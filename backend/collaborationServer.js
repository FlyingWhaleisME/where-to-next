// ADVANCED TECHNIQUE 16: WEBSOCKET REAL-TIME COMMUNICATION ARCHITECTURE
// WebSocket server implementation for bidirectional real-time communication
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import models for collaboration data
const User = require('./models/User');
const TripPreferences = require('./models/TripPreferences');
const TripTracingState = require('./models/TripTracingState');
const Document = require('./models/Document');
const ChatMessage = require('./models/ChatMessage');

// ADVANCED TECHNIQUE 17: CLASS-BASED OBJECT-ORIENTED ARCHITECTURE
// ES6 class implementation with constructor initialization and state management
class CollaborationServer {
  constructor(portOrServer = 8080) {
    // Support both port number (for local dev) and HTTP server (for production)
    if (typeof portOrServer === 'number') {
      // Local development: create WebSocket server on separate port
      this.port = portOrServer;
      this.wss = new WebSocket.Server({ port: portOrServer });
      console.log(`🔗 Collaboration server running on port ${portOrServer}`);
    } else {
      // Production (Render): attach WebSocket server to existing HTTP server
      this.wss = new WebSocket.Server({ server: portOrServer });
      console.log(`🔗 Collaboration server attached to HTTP server`);
    }
    
    // ADVANCED TECHNIQUE 18: MAP-BASED STATE MANAGEMENT
    // Multiple Map data structures for efficient key-value lookups and state tracking
    this.tripRooms = new Map(); // Track active trip collaborations
    this.userSessions = new Map(); // Track user sessions
    this.roomMembers = new Map(); // Track all room members (persistent)
    this.roomCreators = new Map(); // Track room creators
    this.setupEventHandlers();
  }

  // ADVANCED TECHNIQUE 19: EVENT-DRIVEN PROGRAMMING WITH CALLBACK PATTERNS
  // Event handler setup for WebSocket server lifecycle management
  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      console.log('📡 New WebSocket connection attempt');
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('❌ WebSocket server error:', error);
    });
  }

  // ADVANCED TECHNIQUE 20: ASYNC AUTHENTICATION WITH URL PARSING AND JWT VERIFICATION
  // Complex authentication flow with URL parameter extraction and database validation
  async handleConnection(ws, req) {
    console.log('📡 [DEBUG] Handling new WebSocket connection');
    console.log('📡 [DEBUG] Request URL:', req.url);
    
    try {
      // ADVANCED TECHNIQUE 21: URL PARSING AND QUERY PARAMETER EXTRACTION
      // Dynamic URL construction and parameter extraction for authentication
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      console.log('📡 [DEBUG] Extracted token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      
      if (!token) {
        console.log('❌ [DEBUG] No token provided, closing connection');
        ws.close(1008, 'Authentication token required');
        return;
      }

      // ADVANCED TECHNIQUE 22: JWT TOKEN VERIFICATION WITH ERROR HANDLING
      // Synchronous JWT verification with comprehensive error handling
      console.log('🔍 [DEBUG] Verifying JWT token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('🔍 [DEBUG] Token decoded successfully, userId:', decoded.userId);
      
      const user = await User.findById(decoded.userId).select('-password');
      console.log('🔍 [DEBUG] User found:', user ? `${user.name || user.email}` : 'NO USER');
      
      if (!user) {
        console.log('❌ [DEBUG] User not found, closing connection');
        ws.close(1008, 'User not found');
        return;
      }

      // ADVANCED TECHNIQUE 23: DYNAMIC OBJECT PROPERTY ASSIGNMENT
      // Runtime property assignment to WebSocket object for state management
      ws.userId = user._id.toString();
      ws.userName = user.name || user.email;
      ws.userEmail = user.email;
      ws.isAuthenticated = true;
      ws.currentTripId = null;
      
      console.log('✅ [DEBUG] WebSocket connection authenticated for user:', ws.userName);

      // ADVANCED TECHNIQUE 24: SESSION STATE MANAGEMENT WITH MAP STORAGE
      // Complex session object creation with nested data structures
      this.userSessions.set(ws.userId, {
        ws,
        user: { id: user._id, name: user.name, email: user.email },
        connectedAt: new Date(),
        currentTripId: null
      });

      console.log(`✅ User ${ws.userName} connected to collaboration server`);

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connection_established',
        message: 'Connected to collaboration server',
        user: { id: user._id, name: user.name, email: user.email }
      });

      // ADVANCED TECHNIQUE 25: EVENT LISTENER CHAINING FOR WEBSOCKET LIFECYCLE
      // Multiple event handlers for different WebSocket states and message types
      ws.on('message', (data) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for user ${ws.userName}:`, error);
        this.handleDisconnection(ws);
      });

    } catch (error) {
      console.error('❌ Connection authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  // ADVANCED TECHNIQUE 26: MESSAGE ROUTING WITH SWITCH STATEMENT AND JSON PARSING
  // Complex message handling with type-based routing and error recovery
  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      console.log(`📨 Message from ${ws.userName}:`, message.type);
      console.log(`📨 Full message content:`, JSON.stringify(message, null, 2));

      // ADVANCED TECHNIQUE 27: SWITCH-BASED MESSAGE DISPATCHING
      // Pattern matching for different message types with corresponding handler methods
      switch (message.type) {
        case 'join_room':
          this.handleJoinRoom(ws, message);
          break;
        case 'leave_room':
          this.handleLeaveRoom(ws, message);
          break;
        case 'chat_message':
          this.handleChatMessage(ws, message);
          break;
        case 'update_preferences':
          this.handleUpdatePreferences(ws, message);
          break;
        case 'update_trip_tracing':
          this.handleUpdateTripTracing(ws, message);
          break;
        case 'typing_status':
          this.handleTypingStatus(ws, message);
          break;
        case 'ping':
          // ADVANCED TECHNIQUE 28: HEARTBEAT MECHANISM FOR CONNECTION MONITORING
          // Ping-pong pattern for maintaining WebSocket connection health
          console.log('💓 [DEBUG] Received ping from', ws.userName);
          this.sendToClient(ws, {
            type: 'pong'
          });
          break;
        default:
          this.sendToClient(ws, {
            type: 'error',
            message: `Unknown message type: ${message.type}`
          });
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Invalid message format'
      });
    }
  }

  async handleJoinRoom(ws, message) {
    const { roomId, shareCode, isRoomCreator } = message;
    console.log(`📨 Message from ${ws.userName}: join_room`);
    console.log(`📨 Room ID: ${roomId}, Is Room Creator: ${isRoomCreator}`);
    
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
      console.log(`👑 User ${ws.userName} is the creator of room ${roomId}`);
    } else if (existingCreator) {
      console.log(`👑 Room ${roomId} already has a creator: ${existingCreator}`);
    }

    // Leave current room if any
    if (ws.currentTripId) {
      this.leaveRoom(ws, ws.currentTripId);
    }

    // Join new room
    this.joinRoom(ws, roomId);

    // Load and send chat history
    try {
      const chatHistory = await ChatMessage.find({ roomId })
        .sort({ timestamp: 1 })
        .limit(50); // Last 50 messages

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
      console.error('❌ Error loading chat history:', error);
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
    
    console.log(`\n📊 ========== USER LIST BROADCAST (JOIN) ==========`);
    console.log(`📊 Room ID: ${roomId}`);
    console.log(`📊 Total members in room: ${allRoomMembers.length}`);
    console.log(`📊 Online members: ${allRoomMembers.filter(m => m.isOnline).length}`);
    console.log(`📊 Offline members: ${allRoomMembers.filter(m => !m.isOnline).length}`);
    console.log(`📊 Members:`, JSON.stringify(allRoomMembers.map(m => ({ id: m.id, name: m.name, isOnline: m.isOnline, isCreator: m.isCreator })), null, 2));
    console.log(`📊 Currently connected clients in this room: ${this.tripRooms.get(roomId)?.size || 0}`);
    console.log(`📊 ================================================\n`);
    
    // Broadcast updated user list to ALL users in the room (including the joining user)
    // This is the authoritative source - includes ALL users who have ever joined (online and offline)
    this.broadcastToRoom(roomId, {
      type: 'room_users',
      users: allRoomMembers
    }, null); // null means send to everyone, including the sender
    
    console.log(`✅ Broadcasted room_users to all clients in room ${roomId} with ${allRoomMembers.length} total users`);

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
    console.log('💬 [DEBUG] handleChatMessage called with message:', message);
    const { roomId, tripId, text } = message;
    
    // Accept both roomId and tripId for backward compatibility
    const actualRoomId = roomId || tripId;
    
    console.log('💬 [DEBUG] Handling chat message:', { roomId, tripId, text, actualRoomId });
    console.log('💬 [DEBUG] User current room:', ws.currentTripId);
    console.log('💬 [DEBUG] User info:', { userId: ws.userId, userName: ws.userName });
    
    if (!actualRoomId || !text) {
      console.log('❌ [DEBUG] Missing room ID or text:', { actualRoomId, text });
      this.sendToClient(ws, {
        type: 'error',
        message: 'Room ID and message text required'
      });
      return;
    }

    try {
      // Save message to database
      const chatMessage = new ChatMessage({
        roomId: actualRoomId,
        userId: ws.userId,
        userName: ws.userName,
        message: text
      });
      await chatMessage.save();

      console.log(`💬 Broadcasting chat message to room ${actualRoomId}`);
      
      // Broadcast to all users in the room INCLUDING the sender
      this.broadcastToRoom(actualRoomId, {
        type: 'chat_message',
        id: chatMessage._id,
        text: text,
        user: { id: ws.userId, name: ws.userName },
        timestamp: chatMessage.timestamp
      }, null); // null = send to everyone including sender
      
      console.log(`✅ Chat message broadcast complete`);

    } catch (error) {
      console.error('❌ Error saving chat message:', error);
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
      console.error('❌ Error updating preferences:', error);
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
      console.error('❌ Error updating trip tracing:', error);
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
      console.log(`👥 User ${ws.userName} added to room members for ${roomId}`);
    } else {
      // Update online status and last seen for existing member
      const member = this.roomMembers.get(roomId).get(ws.userId);
      member.isOnline = true;
      member.lastSeen = new Date();
      // Update name in case it changed
      member.name = ws.userName;
      console.log(`👥 User ${ws.userName} marked as online in room ${roomId}`);
    }

    console.log(`👥 User ${ws.userName} joined room ${roomId}`);
    
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
      console.log(`👥 User ${ws.userName} marked as offline in room ${roomId} (kept in members list)`);
      
      // Check if room is now completely empty (no online members left)
      const allMembers = Array.from(this.roomMembers.get(roomId)?.values() || []);
      const onlineMembers = allMembers.filter(m => m.isOnline);
      
      if (onlineMembers.length === 0) {
        console.log(`🗑️ Room ${roomId} has no online members - cleaning up all room data`);
        
        // Clean up all room data
        this.roomMembers.delete(roomId);
        this.roomCreators.delete(roomId);
        
        // Notify all connected clients that the room was deleted
        this.broadcastToAllClients({
          type: 'room_deleted',
          roomId,
          message: `Room ${roomId} has been deleted because it's empty`
        });
        
        console.log(`✅ Room ${roomId} completely cleaned up and deletion broadcasted`);
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
      
      console.log(`\n📊 ========== USER LIST BROADCAST (DISCONNECT) ==========`);
      console.log(`📊 Room ID: ${roomId}`);
      console.log(`📊 User ${ws.userName} went offline`);
      console.log(`📊 Online members: ${onlineMembers.length}`);
      console.log(`📊 Total members (including offline): ${allMembers.length}`);
      console.log(`📊 Members:`, JSON.stringify(allRoomMembers.map(m => ({ id: m.id, name: m.name, isOnline: m.isOnline, isCreator: m.isCreator })), null, 2));
      console.log(`📊 ================================================\n`);
      
      // Broadcast to ALL users in the room - this is the source of truth
      this.broadcastToRoom(roomId, {
        type: 'room_users',
        users: allRoomMembers
      }, null); // Send to everyone
      
      console.log(`✅ Broadcasted room_users after disconnect with ${allRoomMembers.length} total users (${onlineMembers.length} online, ${allMembers.length - onlineMembers.length} offline)`);
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
    console.log(`\n📢 ========== BROADCAST TO ROOM ==========`);
    console.log(`📢 Room ID: ${roomId}`);
    console.log(`📢 Message Type: ${message.type}`);
    console.log(`📢 Sender WebSocket: ${senderWs ? senderWs.userName : 'null (send to all)'}`);
    
    if (!this.tripRooms.has(roomId)) {
      console.log(`❌ Room ${roomId} not found in tripRooms`);
      console.log(`📢 ========================================\n`);
      return;
    }

    const room = this.tripRooms.get(roomId);
    console.log(`📢 Total clients in room: ${room.size}`);
    
    let sentCount = 0;
    let skippedCount = 0;
    
    room.forEach(ws => {
      const shouldSend = (senderWs === null || ws !== senderWs) && ws.readyState === WebSocket.OPEN;
      console.log(`📢 Client ${ws.userName}: shouldSend=${shouldSend}, isOpen=${ws.readyState === WebSocket.OPEN}, isSender=${ws === senderWs}`);
      
      if (shouldSend) {
        this.sendToClient(ws, message);
        sentCount++;
        console.log(`✅ Sent ${message.type} to ${ws.userName}`);
      } else {
        skippedCount++;
        console.log(`⏭️  Skipped ${ws.userName} (reason: ${ws === senderWs ? 'is sender' : 'not open'})`);
      }
    });
    
    console.log(`📢 Broadcast complete: sent to ${sentCount} clients, skipped ${skippedCount}`);
    console.log(`📢 ========================================\n`);
  }

  broadcastToAllClients(message) {
    console.log(`\n📢 ========== BROADCAST TO ALL CLIENTS ==========`);
    console.log(`📢 Message Type: ${message.type}`);
    
    let sentCount = 0;
    let skippedCount = 0;
    
    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, message);
        sentCount++;
        console.log(`✅ Sent ${message.type} to ${ws.userName || 'unknown'}`);
      } else {
        skippedCount++;
        console.log(`⏭️  Skipped client (not open)`);
      }
    });
    
    console.log(`📢 Broadcast to all complete: sent to ${sentCount} clients, skipped ${skippedCount}`);
    console.log(`📢 ================================================\n`);
  }

  handleDisconnection(ws) {
    console.log(`👋 [DEBUG] User ${ws.userName} disconnected`);
    console.log(`👋 [DEBUG] User ID: ${ws.userId}`);
    console.log(`👋 [DEBUG] Current trip ID: ${ws.currentTripId}`);
    
    // Leave current room if any
    if (ws.currentTripId) {
      console.log(`👋 [DEBUG] Leaving room: ${ws.currentTripId}`);
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
    console.log('🛑 Shutting down collaboration server...');
    
    // Close all WebSocket connections
    this.wss.clients.forEach(ws => {
      ws.close();
    });
    
    // Close the WebSocket server
    this.wss.close();
    
    console.log('✅ Collaboration server shut down');
  }
}

module.exports = CollaborationServer;