// WebSocket server for real-time collaboration (Tool 3: Event Handlers)
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
    // Support both port number (for local dev) and HTTP server (for production)
    if (typeof portOrServer === 'number') {
      // Local development: create WebSocket server on separate port
      this.port = portOrServer;
      this.wss = new WebSocket.Server({ port: portOrServer });
      console.log('Collaboration server running on port', portOrServer);
    } else {
      // Production (Render): attach WebSocket server to existing HTTP server
      this.wss = new WebSocket.Server({ server: portOrServer });
      console.log(` Collaboration server attached to HTTP server`);
    }
    
    // Map data structures for managing room and user state
    this.tripRooms = new Map();
    this.userSessions = new Map();
    this.roomMembers = new Map();
    this.roomCreators = new Map();
    this.setupEventHandlers();
  }

  // Setup WebSocket event handlers (Tool 3: Event Handlers)
  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      console.log(' New WebSocket connection attempt');
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error(' WebSocket server error:', error);
    });
  }

  // Handle new WebSocket connection with authentication (Tool 3: async/await)
  async handleConnection(ws, req) {
    try {
      // Extract JWT token from URL query parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Authentication token required');
        return;
      }

      // Verify JWT token and get user from database (Tool 1: Database query)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        ws.close(1008, 'User not found');
        return;
      }

      // Store user info on WebSocket object for later use
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

      // Event handlers for WebSocket connection lifecycle (Tool 3: Event Handlers)
      // on('message') - fires when client sends data (explained in Tool 3, case B)
      ws.on('message', (data) => {
        this.handleMessage(ws, data);
      });

      // on('close') - fires when connection closes
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      // on('error') - fires on connection errors
      ws.on('error', (error) => {
        console.error('WebSocket error for user', ws.userName, error);
        this.handleDisconnection(ws);
      });

    } catch (error) {
      console.error(' Connection authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  handleMessage(ws, data) {
    try {
      // Parse JSON message from client
      const message = JSON.parse(data);
      console.log(` Message from ${ws.userName}:`, message.type);
      console.log(` Full message content:`, JSON.stringify(message, null, 2));

      // Switch statement: Route message based on type
      switch (message.type) {
        case 'join_room':
          // Handle user joining a chatroom
          this.handleJoinRoom(ws, message);
          break;
          
        case 'leave_room':
          // Handle user leaving a chatroom
          this.handleLeaveRoom(ws, message);
          break;

        case 'chat_message':
          // Handle incoming chat message
          this.handleChatMessage(ws, message);
          break;

        case 'update_preferences':
          // Handle trip preferences update
          this.handleUpdatePreferences(ws, message);
          break;
          
        case 'update_trip_tracing':
          // Handle trip tracing update
          this.handleUpdateTripTracing(ws, message);
          break;
          
        case 'typing_status':
          // Handle typing status update
          this.handleTypingStatus(ws, message);
          break;  

        case 'ping':
          // Heartbeat: Client checking if server is alive
          console.log(' [DEBUG] Received ping from', ws.userName);
          this.sendToClient(ws, {
            type: 'pong'
          });
          break;

        default:
          // Unknown message type: send error
          this.sendToClient(ws, {
            type: 'error',
            message: `Unknown message type: ${message.type}`
          });
      }
    } catch (error) {
      // Handle JSON parsing errors
      console.error(' Error handling message:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Invalid message format'
      });
    }
  }

  // Asynchronous function to handle user joining a chatroom
  async handleJoinRoom(ws, message) {
    const { roomId, shareCode, isRoomCreator } = message;
    console.log(` Message from ${ws.userName}: join_room`);
    console.log(` Room ID: ${roomId}, Is Room Creator: ${isRoomCreator}`);
    
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
      console.log(` User ${ws.userName} is the creator of room ${roomId}`);
    } else if (existingCreator) {
      console.log(` Room ${roomId} already has a creator: ${existingCreator}`);
    }

    // Leave current room if any
    if (ws.currentTripId) {
      this.leaveRoom(ws, ws.currentTripId);
    }

    // Join new room
    this.joinRoom(ws, roomId);

    // Load chat history from database (Tool 1: Database, Tool 3: async/await)
    try {
      // Query MongoDB using Mongoose (explained in Tool 1, case H)
      // await pauses until query completes (explained in Tool 3, case D)
      const chatHistory = await ChatMessage.find({ roomId })
        .sort({ timestamp: 1 })
        .limit(50);

      // Send history to client via WebSocket
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
      console.error(' Error loading chat history:', error);
    }

    // Send all room members (both online and offline) - this is the source of truth
    const allRoomMembers = Array.from(this.roomMembers.get(roomId)?.values() || [])
      .map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        isOnline: member.isOnline !== undefined ? member.isOnline : false, // Ensure isOnline is always set
        joinedAt: member.joinedAt,
        lastSeen: member.lastSeen,
        isCreator: this.roomCreators.get(roomId) === member.id
      }));
    
    console.log(`\n� ========== USER LIST BROADCAST (JOIN) ==========`);
    console.log(`� Room ID: ${roomId}`);
    console.log(`� Total members in room: ${allRoomMembers.length}`);
    console.log(`� Online members: ${allRoomMembers.filter(m => m.isOnline).length}`);
    console.log(`� Offline members: ${allRoomMembers.filter(m => !m.isOnline).length}`);
    console.log(`� Members:`, JSON.stringify(allRoomMembers.map(m => ({ id: m.id, name: m.name, isOnline: m.isOnline, isCreator: m.isCreator })), null, 2));
    console.log(`� Currently connected clients in this room: ${this.tripRooms.get(roomId)?.size || 0}`);
    console.log(`� ================================================\n`);
    
    // Broadcast updated user list to ALL users in the room (including the joining user)
    // This is the authoritative source - includes ALL users who have ever joined (online and offline)
    this.broadcastToRoom(roomId, {
      type: 'room_users',
      users: allRoomMembers
    }, null); // null means send to everyone, including the sender
    
    console.log(` Broadcasted room_users to all clients in room ${roomId} with ${allRoomMembers.length} total users`);

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
    console.log(' [DEBUG] handleChatMessage called with message:', message);
    const { roomId, tripId, text } = message;
    
    // Accept both roomId and tripId for backward compatibility
    const actualRoomId = roomId || tripId;
    
    console.log(' [DEBUG] Handling chat message:', { roomId, tripId, text, actualRoomId });
    console.log(' [DEBUG] User current room:', ws.currentTripId);
    console.log(' [DEBUG] User info:', { userId: ws.userId, userName: ws.userName });
    
    if (!actualRoomId || !text) {
      console.log(' [DEBUG] Missing room ID or text:', { actualRoomId, text });
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
        userName: ws.userName,              // Display name of the user who sent the message
        message: text                       // Message text
      });

      // await pauses until save operation completes
      await chatMessage.save();             // Prevents sending broadcast before message is saved

      // Broadcast chat message to all users in the room (see WebSocket section)
      console.log(` Broadcasting chat message to room ${actualRoomId}`);
      this.broadcastToRoom(actualRoomId, {
        type: 'chat_message',
        id: chatMessage._id,                // Message ID for message
        text: text,                         // Message text
        user: { id: ws.userId, name: ws.userName }, // User who sent the message
        timestamp: chatMessage.timestamp    // Timestamp of the message
      }, null);                             // null means send to everyone, including the sender
    } catch (error) {
      console.error(' Error saving chat message:', error);
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
      console.error(' Error updating preferences:', error);
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
      console.error(' Error updating trip tracing:', error);
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

  joinRoom(ws, roomId) {
    if (!this.tripRooms.has(roomId)) {
      this.tripRooms.set(roomId, new Set());
    }
    
    this.tripRooms.get(roomId).add(ws);
    ws.currentTripId = roomId;
    
    // Update user session
    const userSession = this.userSessions.get(ws.userId);
    if (userSession) {
      userSession.currentTripId = roomId;
    }

    // Track room members persistently
    if (!this.roomMembers.has(roomId)) {
      this.roomMembers.set(roomId, new Map());
    }
    
    // Add user to room members if not already present, or update existing member
    if (!this.roomMembers.get(roomId).has(ws.userId)) {
      this.roomMembers.get(roomId).set(ws.userId, {
        id: ws.userId,
        name: ws.userName,
        email: ws.userEmail,
        joinedAt: new Date(),
        isOnline: true,
        lastSeen: new Date()
      });
      console.log(`� User ${ws.userName} added to room members for ${roomId}`);
    } else {
      // Update online status and last seen for existing member
      const member = this.roomMembers.get(roomId).get(ws.userId);
      member.isOnline = true;
      member.lastSeen = new Date();
      // Update name in case it changed
      member.name = ws.userName;
      console.log(`� User ${ws.userName} marked as online in room ${roomId}`);
    }

    console.log(`� User ${ws.userName} joined room ${roomId}`);
    
    // Notify the joining user about their own join (for UI updates)
    this.sendToClient(ws, {
      type: 'user_joined',
      user: { id: ws.userId, name: ws.userName },
      timestamp: new Date().toISOString()
    });
    
    // Notify other users in the room
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      user: { id: ws.userId, name: ws.userName },
      timestamp: new Date().toISOString()
    }, ws);
  }

  leaveRoom(ws, roomId) {
    if (this.tripRooms.has(roomId)) {
      this.tripRooms.get(roomId).delete(ws);
      
      // Clean up empty rooms
      if (this.tripRooms.get(roomId).size === 0) {
        this.tripRooms.delete(roomId);
      }
    }

    // Mark user as offline instead of removing them from room members
    if (this.roomMembers.has(roomId) && this.roomMembers.get(roomId).has(ws.userId)) {
      const member = this.roomMembers.get(roomId).get(ws.userId);
      member.isOnline = false;
      member.lastSeen = new Date();
      console.log(`� User ${ws.userName} marked as offline in room ${roomId} (kept in members list)`);
      
      // Check if room is now completely empty (no online members left)
      const allMembers = Array.from(this.roomMembers.get(roomId)?.values() || []);
      const onlineMembers = allMembers.filter(m => m.isOnline);
      
      if (onlineMembers.length === 0) {
        console.log(` Room ${roomId} has no online members - cleaning up all room data`);
        
        // Clean up all room data
        this.roomMembers.delete(roomId);
        this.roomCreators.delete(roomId);
        
        // Notify all connected clients that the room was deleted
        this.broadcastToAllClients({
          type: 'room_deleted',
          roomId,
          message: `Room ${roomId} has been deleted because it's empty`
        });
        
        console.log(` Room ${roomId} completely cleaned up and deletion broadcasted`);
        ws.currentTripId = null;
        return; // Early return since room is deleted
      }
      
      // Room still has members, broadcast updated user list (including offline users)
      // This is the authoritative source - includes ALL users who have ever joined
      const allRoomMembers = allMembers.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        isOnline: member.isOnline !== undefined ? member.isOnline : false, // Ensure isOnline is always set
        joinedAt: member.joinedAt,
        lastSeen: member.lastSeen,
        isCreator: this.roomCreators.get(roomId) === member.id
      }));
      
      console.log(`\n� ========== USER LIST BROADCAST (DISCONNECT) ==========`);
      console.log(`� Room ID: ${roomId}`);
      console.log(`� User ${ws.userName} went offline`);
      console.log(`� Online members: ${onlineMembers.length}`);
      console.log(`� Total members (including offline): ${allMembers.length}`);
      console.log(`� Members:`, JSON.stringify(allRoomMembers.map(m => ({ id: m.id, name: m.name, isOnline: m.isOnline, isCreator: m.isCreator })), null, 2));
      console.log(`� ================================================\n`);
      
      // Broadcast to ALL users in the room - this is the source of truth
      this.broadcastToRoom(roomId, {
        type: 'room_users',
        users: allRoomMembers
      }, null); // Send to everyone
      
      console.log(` Broadcasted room_users after disconnect with ${allRoomMembers.length} total users (${onlineMembers.length} online, ${allMembers.length - onlineMembers.length} offline)`);
    }

    // Notify other users in the room
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
    console.log(`\n� ========== BROADCAST TO ROOM ==========`);
    console.log(`� Room ID: ${roomId}`);
    console.log(`� Message Type: ${message.type}`);
    console.log(`� Sender WebSocket: ${senderWs ? senderWs.userName : 'null (send to all)'}`);
    
    if (!this.tripRooms.has(roomId)) {
      console.log(` Room ${roomId} not found in tripRooms`);
      console.log(`� ========================================\n`);
      return;
    }

    const room = this.tripRooms.get(roomId);
    console.log(`� Total clients in room: ${room.size}`);
    
    let sentCount = 0;
    let skippedCount = 0;
    
    room.forEach(ws => {
      const shouldSend = (senderWs === null || ws !== senderWs) && ws.readyState === WebSocket.OPEN;
      console.log(`� Client ${ws.userName}: shouldSend=${shouldSend}, isOpen=${ws.readyState === WebSocket.OPEN}, isSender=${ws === senderWs}`);
      
      if (shouldSend) {
        this.sendToClient(ws, message);
        sentCount++;
        console.log(` Sent ${message.type} to ${ws.userName}`);
      } else {
        skippedCount++;
        console.log(`  Skipped ${ws.userName} (reason: ${ws === senderWs ? 'is sender' : 'not open'})`);
      }
    });
    
    console.log(`� Broadcast complete: sent to ${sentCount} clients, skipped ${skippedCount}`);
    console.log(`� ========================================\n`);
  }

  broadcastToAllClients(message) {
    console.log(`\n� ========== BROADCAST TO ALL CLIENTS ==========`);
    console.log(`� Message Type: ${message.type}`);
    
    let sentCount = 0;
    let skippedCount = 0;
    
    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, message);
        sentCount++;
        console.log(` Sent ${message.type} to ${ws.userName || 'unknown'}`);
      } else {
        skippedCount++;
        console.log(`  Skipped client (not open)`);
      }
    });
    
    console.log(`� Broadcast to all complete: sent to ${sentCount} clients, skipped ${skippedCount}`);
    console.log(`� ================================================\n`);
  }

  handleDisconnection(ws) {
    console.log(`� [DEBUG] User ${ws.userName} disconnected`);
    console.log(`� [DEBUG] User ID: ${ws.userId}`);
    console.log(`� [DEBUG] Current trip ID: ${ws.currentTripId}`);
    
    // Leave current room if any
    if (ws.currentTripId) {
      console.log(`� [DEBUG] Leaving room: ${ws.currentTripId}`);
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
    console.log('� Shutting down collaboration server...');
    
    // Close all WebSocket connections
    this.wss.clients.forEach(ws => {
      ws.close();
    });
    
    // Close the WebSocket server
    this.wss.close();
    
    console.log(' Collaboration server shut down');
  }
}

module.exports = CollaborationServer;