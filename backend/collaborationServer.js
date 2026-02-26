// WebSocket server for real-time collaboration
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import models for collaboration data
const User = require('./models/User');
const TripPreferences = require('./models/TripPreferences');
const TripTracingState = require('./models/TripTracingState');
const Document = require('./models/Document');
const ChatMessage = require('./models/ChatMessage');

// WebSocket server class for managing real-time connections
class CollaborationServer {
  constructor(portOrServer = 8080) {
    if (typeof portOrServer === 'number') {
      this.port = portOrServer;
      this.wss = new WebSocket.Server({ port: portOrServer });
      console.log('Collaboration server running on port', portOrServer);
    } else {
      this.wss = new WebSocket.Server({ server: portOrServer });
      console.log('Collaboration server attached to HTTP server');
    }
    this.tripRooms = new Map();
    this.userSessions = new Map();
    this.roomMembers = new Map();
    this.roomCreators = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection attempt');
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  }

  async handleConnection(ws, req) {
    try {
      // Extract JWT token from URL query parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Authentication token required');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        ws.close(1008, 'User not found');
        return;
      }

      ws.userId = user._id.toString();
      ws.userName = user.name || user.email;
      ws.userEmail = user.email;
      ws.isAuthenticated = true;
      ws.currentTripId = null;

      // Store session in Map for quick lookup
      this.userSessions.set(ws.userId, {
        ws,
        user: { id: user._id, name: user.name, email: user.email },
        connectedAt: new Date(),
        currentTripId: null
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connection_established',
        message: 'Connected to collaboration server',
        user: { id: user._id, name: user.name, email: user.email }
      });

      // on('message') event listener
      // Receives all client messages and routes them to the appropriate handler
      ws.on('message', (data) => {
        // Pass to handler method for processing
        // Routes to: handleJoinRoom, handleChatMessage, handleLeaveRoom, etc.
        this.handleMessage(ws, data);
      });

      // on('close') event listener
      // Handles user disconnections and updates room state
      ws.on('close', () => {
        // Cleans up user session, removes from room, marks user as offline
        this.handleDisconnection(ws);
      });

      // on('error') event listener
      // Handle connection errors and cleanup
      ws.on('error', (error) => {
        console.error('WebSocket error for user', ws.userName, error);
        // Clean up on error to prevent memory leaks
        this.handleDisconnection(ws);
      });

    } catch (error) {
      console.error('Connection authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  // handleMessage event handler
  // Called automatically when ws.on('message') event listener fires
  handleMessage(ws, data) {
    try {
      // Parse JSON message from client
      const message = JSON.parse(data);
      console.log(`Message from ${ws.userName}:`, message.type);
      console.log(`Full message content:`, JSON.stringify(message, null, 2));

      // Switch statement: Route message to appropriate event handler
      switch (message.type) {
        case 'join_room':
        // Routes to event handler that uses PROMISE (async/await)
        // handleJoinRoom uses promises to load chat history from database
          this.handleJoinRoom(ws, message);
          break;
          
        case 'leave_room':
          // Routes to event handler for user leaving room
          // handleLeaveRoom event handler does not use promises, just leaves user from room
          this.handleLeaveRoom(ws, message);
          break;

        case 'chat_message':
          // Routes to event handler that uses PROMISE (async/await)
          // handleChatMessage event handler uses promises to save message to database
          this.handleChatMessage(ws, message);
          break;

        case 'update_preferences':
          // Routes to event handler for trip preferences updates
          // handleUpdatePreferences event handler uses promises to save preferences to database
          this.handleUpdatePreferences(ws, message);
          break;
          
        case 'update_trip_tracing':
          // Routes to event handler for trip tracing updates
          // handleUpdateTripTracing event handler uses promises to save trip tracing to database
          this.handleUpdateTripTracing(ws, message);
          break;
          
        case 'typing_status':
          // Routes to event handler for typing status updates
          // handleTypingStatus event handler uses promises to save typing status to database
          this.handleTypingStatus(ws, message);
          break;  

        case 'ping':
          // Heartbeat: No database operation, so no promise needed
          console.log('Received ping from', ws.userName);
          this.sendToClient(ws, {
            type: 'pong'
          });
          break;

        default:
          // Unknown message type: send error to client
          this.sendToClient(ws, {
            type: 'error',
            message: `Unknown message type: ${message.type}`
          });
      }
    } catch (error) {
      // Handle JSON parsing errors
      console.error('Error handling message:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Invalid message format'
      });
    }
  }

  // Asynchronous event handler to handle user joining a chatroom
  // Called automatically when user joins a chatroom
  // Uses promise (async/await) to load chat history from database
  async handleJoinRoom(ws, message) {
    const { roomId, shareCode, isRoomCreator } = message;
    console.log(`Message from ${ws.userName}: join_room`);
    console.log(`Room ID: ${roomId}, Is Room Creator: ${isRoomCreator}`);
    
    if (!roomId) {
      this.sendToClient(ws, {
        type: 'error',
        message: 'Room ID required'
      });
      return;
    }

    // Track room creator - check if user is already the creator or if explicitly marked as creator
    const existingCreator = this.roomCreators.get(roomId);
    if (isRoomCreator || existingCreator === ws.userId) {
      this.roomCreators.set(roomId, ws.userId);
    }

    // Leave current room if any
    if (ws.currentTripId) {
      this.leaveRoom(ws, ws.currentTripId);
    }

    // Join new room
    this.joinRoom(ws, roomId);

    try {
      const chatHistory = await ChatMessage.find({ roomId })
        .sort({ timestamp: 1 })
        .limit(50);
      this.sendToClient(ws, {
        type: 'chat_history',
        messages: chatHistory.map(msg => ({
          id: msg._id,
          text: msg.message,
          user: { id: msg.userId, name: msg.userName },
          timestamp: msg.timestamp
        }))
      });
    } catch (error) {
      console.error('Error loading chat history:', error);
    }

    // Send all room members (online and offline)
    const allRoomMembers = Array.from(this.roomMembers.get(roomId)?.values() || [])
      .map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        isOnline: member.isOnline !== undefined ? member.isOnline : false,
        joinedAt: member.joinedAt,
        lastSeen: member.lastSeen,
        isCreator: this.roomCreators.get(roomId) === member.id
      }));
    
    console.log(`\nUSER LIST BROADCAST (JOIN)\n`);
    console.log(`Room ID: ${roomId}`);
    console.log(`Total members in room: ${allRoomMembers.length}`);
    console.log(`Online members: ${allRoomMembers.filter(m => m.isOnline).length}`);
    console.log(`Offline members: ${allRoomMembers.filter(m => !m.isOnline).length}`);
    console.log(`Members:`, JSON.stringify(allRoomMembers.map(m => ({ id: m.id, name: m.name, isOnline: m.isOnline, isCreator: m.isCreator })), null, 2));
    console.log(`Currently connected clients in this room: ${this.tripRooms.get(roomId)?.size || 0}`);
    console.log(`\n`);
    
    this.broadcastToRoom(roomId, {
      type: 'room_users',
      users: allRoomMembers
    }, null);

    // Send room info to the joining user
    this.sendToClient(ws, {
      type: 'room_joined',
      roomId,
      message: `Joined room: ${roomId}`
    });
  }

  handleLeaveRoom(ws, message) {
    if (ws.currentTripId) {
      this.leaveRoom(ws, ws.currentTripId);
    }
  }

  async handleChatMessage(ws, message) {
    console.log('handleChatMessage called with message:', message);
    const { roomId, tripId, text } = message;
    
    // Accept both roomId and tripId for backward compatibility
    const actualRoomId = roomId || tripId;
    
    console.log('Handling chat message:', { roomId, tripId, text, actualRoomId });
    console.log('User current room:', ws.currentTripId);
    console.log('User info:', { userId: ws.userId, userName: ws.userName });
    
    if (!actualRoomId || !text) {
      console.log('Missing room ID or text:', { actualRoomId, text });
      this.sendToClient(ws, {
        type: 'error',
        message: 'Room ID and message text required'
      });
      return;
    }

    try {
      // Create new chat message instance
      const chatMessage = new ChatMessage({
        roomId: actualRoomId,               // Room ID for message
        userId: ws.userId,                  // User ID of the user who sent the message
        userName: ws.userName,
        message: text
      });

      await chatMessage.save();

      this.broadcastToRoom(actualRoomId, {
        type: 'chat_message',
        id: chatMessage._id,
        text: text,
        user: { id: ws.userId, name: ws.userName },
        timestamp: chatMessage.timestamp
      }, null);
    } catch (error) {
      console.error('Error saving chat message:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Failed to send message'
      });
    }
  }

  async handleUpdatePreferences(ws, message) {
    const { roomId, preferences } = message;
    
    if (!roomId || !preferences) {
      this.sendToClient(ws, {
        type: 'error',
        message: 'Room ID and preferences required'
      });
      return;
    }

    try {
      // Save to database
      const existingPrefs = await TripPreferences.findOne({ 
        userId: ws.userId,
        roomId: roomId
      });
      
      if (existingPrefs) {
        await TripPreferences.findByIdAndUpdate(existingPrefs._id, {
          ...preferences,
          lastModified: new Date()
        });
      } else {
        // Create new preferences
        const newPrefs = new TripPreferences({
          ...preferences,
          userId: ws.userId,
          roomId: roomId
        });
        await newPrefs.save();
      }

      // Broadcast to all users in the room
      this.broadcastToRoom(roomId, {
        type: 'preferences_updated',
        preferences,
        updatedBy: { id: ws.userId, name: ws.userName },
        timestamp: new Date().toISOString()
      }, ws);

    } catch (error) {
      console.error('Error updating preferences:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Failed to update preferences'
      });
    }
  }

  async handleUpdateTripTracing(ws, message) {
    const { roomId, tripTracingState } = message;
    
    if (!roomId || !tripTracingState) {
      this.sendToClient(ws, {
        type: 'error',
        message: 'Room ID and trip tracing state required'
      });
      return;
    }

    try {
      // Save to database
      const existingState = await TripTracingState.findOne({ 
        userId: ws.userId,
        roomId: roomId
      });
      
      if (existingState) {
        await TripTracingState.findByIdAndUpdate(existingState._id, {
          ...tripTracingState,
          lastModified: new Date()
        });
      } else {
        // Create new state
        const newState = new TripTracingState({
          ...tripTracingState,
          userId: ws.userId,
          roomId: roomId
        });
        await newState.save();
      }

      // Broadcast to all users in the room
      this.broadcastToRoom(roomId, {
        type: 'trip_tracing_updated',
        tripTracingState,
        updatedBy: { id: ws.userId, name: ws.userName },
        timestamp: new Date().toISOString()
      }, ws);

    } catch (error) {
      console.error('Error updating trip tracing:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Failed to update trip tracing'
      });
    }
  }

  handleTypingStatus(ws, message) {
    const { roomId, isTyping } = message;
    
    if (!roomId) {
      return;
    }

    // Broadcast typing status to other users in the room
    this.broadcastToRoom(roomId, {
      type: 'typing_status',
      userId: ws.userId,
      userName: ws.userName,
      isTyping
    }, ws);
  }

  // This algorithm manages the state of users within collaboration rooms, ensuring that
  // users are tracked persistently (even when offline) and their online status is accurately reflected.
  // It also handles the dynamic creation and deletion of rooms based on active participation.
  joinRoom(ws, roomId) {
    // Check if room exists in active connections
    if (!this.tripRooms.has(roomId)) {
      this.tripRooms.set(roomId, new Set());
    }
    this.tripRooms.get(roomId).add(ws); // Add WebSocket connection to the room
    ws.currentTripId = roomId; // Assign current room ID to WebSocket session

    // 2. Update user session to reflect current room
    const userSession = this.userSessions.get(ws.userId);
    if (userSession) {
      userSession.currentTripId = roomId;
    }

    // 3. Persistently track room members (online and offline)
    if (!this.roomMembers.has(roomId)) {
      this.roomMembers.set(roomId, new Map()); // Initialize map for room members if new room
    }

    // 4. Add or update user's status in the persistent room members list
    if (!this.roomMembers.get(roomId).has(ws.userId)) {
      // If user is new to this room, add them with online status
      this.roomMembers.get(roomId).set(ws.userId, {
        id: ws.userId,
        name: ws.userName,
        email: ws.userEmail,
        joinedAt: new Date(),
        isOnline: true,
        lastSeen: new Date()
      });
      console.log(`User ${ws.userName} added to room members for ${roomId}`);
    } else {
      // If user already exists, update their online status and last seen timestamp
      const member = this.roomMembers.get(roomId).get(ws.userId);
      member.isOnline = true;
      member.lastSeen = new Date();
      member.name = ws.userName; // Update name in case it changed
      console.log(`User ${ws.userName} marked as online in room ${roomId}`);
    }

    console.log(`User ${ws.userName} joined room ${roomId}`);
    
    // 5. Notify clients about the user joining
    this.sendToClient(ws, {
      type: 'user_joined',
      user: { id: ws.userId, name: ws.userName },
      timestamp: new Date().toISOString()
    });
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      user: { id: ws.userId, name: ws.userName },
      timestamp: new Date().toISOString()
    }, ws); // Broadcast to others in the room
  }

  // This method handles user disconnection while maintaining persistent membership tracking.
  leaveRoom(ws, roomId) {
    // 1. Remove WebSocket connection from active room set
    if (this.tripRooms.has(roomId)) {
      this.tripRooms.get(roomId).delete(ws);
      // If room becomes empty of active connections, remove it from active rooms
      if (this.tripRooms.get(roomId).size === 0) {
        this.tripRooms.delete(roomId);
      }
    }

    // 2. Mark user as offline in the persistent room members list
    if (this.roomMembers.has(roomId) && this.roomMembers.get(roomId).has(ws.userId)) {
      const member = this.roomMembers.get(roomId).get(ws.userId);
      member.isOnline = false;
      member.lastSeen = new Date(); // Record last seen timestamp
      console.log(`User ${ws.userName} marked as offline in room ${roomId} (kept in members list)`);
      
      // 3. Check if the room is now completely empty of *online* members
      const allMembers = Array.from(this.roomMembers.get(roomId)?.values() || []);
      const onlineMembers = allMembers.filter(m => m.isOnline);

      if (onlineMembers.length === 0) {
        console.log(`Room ${roomId} has no online members - cleaning up all room data`);
        // If no online members, clean up all persistent room data
        this.roomMembers.delete(roomId);
        this.roomCreators.delete(roomId);

        // Notify all connected clients that the room was deleted
        this.broadcastToAllClients({
          type: 'room_deleted',
          roomId,
          message: `Room ${roomId} has been deleted because it's empty`
        });
        console.log(`Room ${roomId} completely cleaned up and deletion broadcasted`);
        ws.currentTripId = null; // Clear current trip ID for the leaving user
        return; // Early return as room is fully deleted
      }

      // 4. If room still has members (even if offline), broadcast updated user list
      // Broadcast current user list and status
      const allRoomMembers = allMembers.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        isOnline: member.isOnline !== undefined ? member.isOnline : false,
        joinedAt: member.joinedAt,
        lastSeen: member.lastSeen,
        isCreator: this.roomCreators.get(roomId) === member.id
      }));
      
      console.log(`\nUSER LIST BROADCAST (DISCONNECT)\n`);
      console.log(`Room ID: ${roomId}`);
      console.log(`User ${ws.userName} went offline`);
      console.log(`Online members: ${onlineMembers.length}`);
      console.log(`Total members (including offline): ${allMembers.length}`);
      console.log(`Members:`, JSON.stringify(allRoomMembers.map(m => ({ id: m.id, name: m.name, isOnline: m.isOnline, isCreator: m.isCreator })), null, 2));
      console.log(`\n`);
      
      // Broadcast to all users in room
      this.broadcastToRoom(roomId, {
        type: 'room_users',
        users: allRoomMembers
      }, null); // Send to everyone
      
    }

    // 5. Notify other users in the room about the user leaving
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      user: { id: ws.userId, name: ws.userName },
      timestamp: new Date().toISOString()
    }, ws);

    ws.currentTripId = null;
    
    // Update user session
    const userSession = this.userSessions.get(ws.userId);
    if (userSession) {
      userSession.currentTripId = null;
    }
  }

  broadcastToRoom(roomId, message, senderWs = null) {
    console.log(`\nBROADCAST TO ROOM\n`);
    console.log(`Room ID: ${roomId}`);
    console.log(`Message Type: ${message.type}`);
    console.log(`Sender WebSocket: ${senderWs ? senderWs.userName : 'null (send to all)'}`);
    
    if (!this.tripRooms.has(roomId)) {
      console.log(`Room ${roomId} not found in tripRooms`);
      console.log(`\n`);
      return;
    }

    const room = this.tripRooms.get(roomId);
    console.log(`Total clients in room: ${room.size}`);
    
    let sentCount = 0;
    let skippedCount = 0;
    
    room.forEach(ws => {
      const shouldSend = (senderWs === null || ws !== senderWs) && ws.readyState === WebSocket.OPEN;
      console.log(`Client ${ws.userName}: shouldSend=${shouldSend}, isOpen=${ws.readyState === WebSocket.OPEN}, isSender=${ws === senderWs}`);
      
      if (shouldSend) {
        this.sendToClient(ws, message);
        sentCount++;
        console.log(`Sent ${message.type} to ${ws.userName}`);
      } else {
        skippedCount++;
        console.log(`Skipped ${ws.userName} (reason: ${ws === senderWs ? 'is sender' : 'not open'})`);
      }
    });
    
    console.log(`Broadcast complete: sent to ${sentCount} clients, skipped ${skippedCount}`);
  }

  broadcastToAllClients(message) {
    console.log(`\nBROADCAST TO ALL CLIENTS\n`);
    console.log(`Message Type: ${message.type}`);
    
    let sentCount = 0;
    let skippedCount = 0;
    
    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, message);
        sentCount++;
        console.log(`Sent ${message.type} to ${ws.userName || 'unknown'}`);
      } else {
        skippedCount++;
        console.log(`Skipped client (not open)`);
      }
    });
    
    console.log(`Broadcast to all complete: sent to ${sentCount} clients, skipped ${skippedCount}`);
  }

  handleDisconnection(ws) {
    console.log(`User ${ws.userName} disconnected`);
    console.log(`User ID: ${ws.userId}`);
    console.log(`Current trip ID: ${ws.currentTripId}`);
    
    // Leave current room if any
    if (ws.currentTripId) {
      console.log(`Leaving room: ${ws.currentTripId}`);
      this.leaveRoom(ws, ws.currentTripId);
    }
    
    // Remove from user sessions
    this.userSessions.delete(ws.userId);
  }

  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  shutdown() {
    console.log('Shutting down collaboration server...');
    
    // Close all WebSocket connections
    this.wss.clients.forEach(ws => {
      ws.close();
    });
    
    // Close the WebSocket server
    this.wss.close();
    
    console.log('Collaboration server shut down');
  }
}

module.exports = CollaborationServer;