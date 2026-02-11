// ADVANCED TECHNIQUE 29: TYPE-SAFE INTERFACE DEFINITIONS FOR COMPLEX DATA STRUCTURES
// TypeScript interfaces defining the shape of collaboration data with optional properties
interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  isOnline?: boolean; // Optional property for runtime state management
  joinedAt?: string;
  lastSeen?: string;
  isCreator?: boolean;
}

interface CollaborationMessage {
  id: string;
  text: string;
  user: CollaborationUser;
  timestamp: string;
}

// ADVANCED TECHNIQUE 30: COMPREHENSIVE STATE INTERFACE WITH NESTED DATA STRUCTURES
// Complex state object with arrays, objects, and nullable values for real-time collaboration
interface CollaborationState {
  isConnected: boolean;
  currentTripId: string | null;
  onlineUsers: CollaborationUser[];
  messages: CollaborationMessage[];
  isTyping: { [userId: string]: boolean }; // Dynamic object with string keys
  lastError: string | null;
}

// ADVANCED TECHNIQUE 31: CALLBACK FUNCTION INTERFACE FOR EVENT-DRIVEN PROGRAMMING
// Optional callback functions for different collaboration events and state changes
interface CollaborationCallbacks {
  onConnectionChange?: (isConnected: boolean) => void;
  onUserJoined?: (user: CollaborationUser) => void;
  onUserLeft?: (user: CollaborationUser) => void;
  onRoomUsers?: (users: CollaborationUser[]) => void;
  onMessage?: (message: CollaborationMessage) => void;
  onChatHistory?: (messages: CollaborationMessage[]) => void;
  onPreferencesUpdate?: (preferences: any, updatedBy: CollaborationUser) => void;
  onTripTracingUpdate?: (tripTracingState: any, updatedBy: CollaborationUser) => void;
  onTypingChange?: (userId: string, isTyping: boolean) => void;
  onError?: (error: string) => void;
}

// ADVANCED TECHNIQUE 32: SINGLETON PATTERN WITH COMPREHENSIVE STATE MANAGEMENT
// Class-based service with private properties for encapsulation and state isolation
class CollaborationService {
  private ws: WebSocket | null = null;
  // ADVANCED TECHNIQUE 33: INITIALIZED STATE OBJECT WITH DEFAULT VALUES
  // Complex state initialization with nested arrays and objects for real-time collaboration
  private state: CollaborationState = {
    isConnected: false,
    currentTripId: null,
    onlineUsers: [],
    messages: [],
    isTyping: {},
    lastError: null
  };
  private callbacks: CollaborationCallbacks = {};
  // ADVANCED TECHNIQUE 34: CONNECTION RESILIENCE WITH RETRY MECHANISMS
  // Multiple timeout and retry properties for robust WebSocket connection management
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private typingTimeout: NodeJS.Timeout | null = null;
  private pendingJoinRoom: { roomId: string; userId: string; userName: string; isRoomCreator: boolean } | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionDebounceTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor() {
    // Don't connect immediately - wait for user to login
    console.log('🔧 [DEBUG] CollaborationService initialized, waiting for authentication');
  }

  // ADVANCED TECHNIQUE 35: CONNECTION STATE VALIDATION WITH DEBOUNCING
  // Complex connection logic with state checking and debounced connection attempts
  private connect() {
    // ADVANCED TECHNIQUE 36: WEBSOCKET STATE ENUMERATION AND VALIDATION
    // Check WebSocket readyState constants to prevent duplicate connections
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      console.log('⏳ [DEBUG] WebSocket already connected or connecting, skipping new connection');
      console.log('⏳ [DEBUG] Current state:', this.ws.readyState, '(CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3)');
      return;
    }
    
    // ADVANCED TECHNIQUE 37: RACE CONDITION PREVENTION
    // Prevent multiple simultaneous connection attempts with boolean flag
    if (this.isConnecting) {
      console.log('⏳ [DEBUG] Connection already in progress, skipping');
      return;
    }

    // ADVANCED TECHNIQUE 38: TIMEOUT CLEANUP AND DEBOUNCING
    // Clear existing timeout and implement debounced connection for performance
    if (this.connectionDebounceTimeout) {
      clearTimeout(this.connectionDebounceTimeout);
    }

    // Debounce connection attempts
    this.connectionDebounceTimeout = setTimeout(() => {
      this.performConnection();
    }, 100); // 100ms debounce
  }

  private performConnection() {
    if (this.isConnecting) {
      console.log('⏳ [DEBUG] Connection already in progress, skipping performConnection');
      return;
    }

    this.isConnecting = true;
    console.log('🔗 [DEBUG] Starting WebSocket connection attempt...');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ [DEBUG] No authentication token found for collaboration');
        this.state.lastError = 'Please login to use collaboration features';
        this.callbacks.onError?.('Please login to use collaboration features');
        this.isConnecting = false;
        return;
      }

      console.log('✅ [DEBUG] Token found, length:', token.length);

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('[DEBUG] Token payload:', payload);
        
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          const expiredAt = new Date(payload.exp * 1000);
          const now = new Date();
          console.error('❌ [DEBUG] JWT token expired at:', expiredAt.toISOString(), 'Current time:', now.toISOString());
          this.state.lastError = 'Your session has expired - please login again';
          this.callbacks.onError?.('Your session has expired - please login again');
          return;
        }
        
        console.log('✅ [DEBUG] Token is valid, expires at:', new Date(payload.exp * 1000).toISOString());
      } catch (e) {
        console.error('❌ [DEBUG] Invalid token format:', e);
        this.state.lastError = 'Invalid authentication - please login again';
        this.callbacks.onError?.('Invalid authentication - please login again');
        return;
      }

      // Create new WebSocket connection to backend server
      // wss:// indicates secure WebSocket (like https://)
      // Token included in URL for authentication
      const wsUrl = `wss://where-to-next-backend.onrender.com?token=${encodeURIComponent(token)}`;
      console.log('[DEBUG] Connecting to WebSocket:', wsUrl.replace(token, 'TOKEN_HIDDEN'));
      this.ws = new WebSocket(wsUrl);

      // Onopen event handler fires when WebSocket connection successfully opens
      // When the connection is established, it is ready to send and receive messages
      this.ws.onopen = () => {
        console.log('✅ [DEBUG] WebSocket connection opened successfully');
        this.isConnecting = false;
        // Update service state to reflect connection status
        this.state.isConnected = true;
        // Clear any existing error
        this.state.lastError = null;
        this.reconnectAttempts = 0;
        // Notify other parts of application that connection is established
        this.callbacks.onConnectionChange?.(true);
        
        this.startHeartbeat();
      };

      // Onmessage event handler fires when a message is received from the server
      this.ws.onmessage = (event) => {
        // Parse JSON string to JavaScript object
        // event.data contains the message as string
        this.handleMessage(JSON.parse(event.data));
      };

      // Onclose event handler fires when the WebSocket connection is closed
      this.ws.onclose = (event) => {
        console.log('[DEBUG] WebSocket connection closed');
        console.log('[DEBUG] Close code:', event.code, 'Reason:', event.reason);
        console.log('[DEBUG] Disconnected from collaboration server');
        
        // Reset connection flag to allow new connection attempts
        this.isConnecting = false; 
        
        const closeCodeMeanings = {
          1000: 'Normal closure',
          1001: 'Going away',
          1002: 'Protocol error',
          1003: 'Unsupported data',
          1006: 'Abnormal closure (no close frame)',
          1007: 'Invalid frame payload data',
          1008: 'Policy violation',
          1009: 'Message too big',
          1010: 'Missing extension',
          1011: 'Internal error',
          1015: 'TLS handshake failure'
        };
        
        console.log('[DEBUG] Close code meaning:', closeCodeMeanings[event.code as keyof typeof closeCodeMeanings] || 'Unknown');
        
        // Stop heartbeat to prevent stale connections
        this.stopHeartbeat();
        
        // Update service state to reflect disconnection status
        this.state.isConnected = false;
        // Notify other parts of application that connection is lost
        this.callbacks.onConnectionChange?.(false);
        
        // Always attempt to reconnect unless it's a manual close (1000) or user logged out
        const token = localStorage.getItem('token');
        const hasActiveRoom = localStorage.getItem('current-room-id');

        // Attempt to reconnect unless it's a manual close (1000) or user logged out or no active room
        if (event.code !== 1000 && token && hasActiveRoom && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log('[DEBUG] Attempting to reconnect...');
          console.log('[DEBUG] Reason: User still authenticated and has active room');
          this.attemptReconnect();
        } else if (event.code === 1000) {
          console.log('✅ [DEBUG] Normal closure - no reconnection needed');
        } else if (!token || !hasActiveRoom) {
          console.log('✅ [DEBUG] No reconnection needed - user logged out or no active room');
        } else {
          console.log('❌ [DEBUG] Max reconnection attempts reached');
        }
      };

      // Onerror event handler fires when the WebSocket connection encounters an error
      this.ws.onerror = (error) => {
        console.error('❌ [DEBUG] WebSocket error occurred:', error);
        console.error('❌ [DEBUG] Error type:', error.type);
        console.error('❌ [DEBUG] Error target:', error.target);
        
        this.isConnecting = false; // Reset connection flag
        
        // Check if backend server is running
        console.log('[DEBUG] Checking if backend server is accessible...');
        fetch('https://where-to-next-backend.onrender.com/api/health')
          .then(response => {
            if (response.ok) {
              console.log('✅ [DEBUG] Backend server is running');
              return response.json();
            } else {
              console.error('❌ [DEBUG] Backend server returned error:', response.status);
            }
          })
          .then(data => {
            if (data) {
              console.log('[DEBUG] Backend health:', data);
            }
          })
          .catch(err => {
            console.error('❌ [DEBUG] Backend server is not accessible:', err.message);
          });
        
        // Update service state to reflect error status
        this.state.lastError = 'Connection error - please check if backend server is running';
        this.callbacks.onError?.('Connection error - please check if backend server is running');
      };

    } catch (error) {
      console.error('❌ [DEBUG] Failed to connect to collaboration server:', error);
      console.error('❌ [DEBUG] Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      this.state.lastError = 'Failed to connect - check console for details';
      this.callbacks.onError?.('Failed to connect - check console for details');
    }
  }

  private attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 [DEBUG] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    console.log(`⏰ [DEBUG] Reconnection delay: ${delay}ms (exponential backoff)`);
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [DEBUG] Max reconnection attempts reached. Stopping reconnection.');
      console.log('💡 [DEBUG] Possible solutions:');
      console.log('   - Check if backend server is running');
      console.log('   - Try refreshing the page');
      console.log('   - Check internet connection');
      console.log('   - Try logging out and back in');
      return;
    }
    
    setTimeout(() => {
      console.log(`🔄 [DEBUG] Reconnection attempt ${this.reconnectAttempts} starting...`);
      this.connect();
    }, delay);
  }

  private handleMessage(message: any) {
    console.log('📨 [DEBUG] Collaboration message received:', message.type);
    console.log('📨 [DEBUG] Full message:', message);

    // Switch statement: Handle different message types
    switch (message.type) {
      case 'connection_established':
        // Server confirmed connection
        console.log('✅ Collaboration connection established');

        if (this.pendingJoinRoom) {
          console.log('🔄 [DEBUG] Executing pending room join:', this.pendingJoinRoom);
          this.sendJoinRoomMessage(this.pendingJoinRoom.roomId, this.pendingJoinRoom.userId, this.pendingJoinRoom.userName, this.pendingJoinRoom.isRoomCreator);
          this.pendingJoinRoom = null;
        } else {
          const savedRoomId = localStorage.getItem('current-room-id');
          if (savedRoomId) {
            console.log('🔄 [DEBUG] No pending join but found saved room ID, attempting to rejoin:', savedRoomId);
            try {
              const token = localStorage.getItem('token');
              if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userStr = localStorage.getItem('user');
                if (userStr) {
                  const user = JSON.parse(userStr);
                  const isRoomCreator = localStorage.getItem('room-creator') === user.id;
                  console.log('🔄 [DEBUG] Rejoining saved room with user info from localStorage');
                  this.sendJoinRoomMessage(savedRoomId, user.id, user.name || user.email, isRoomCreator);
                }
              }
            } catch (e) {
              console.error('❌ [DEBUG] Failed to rejoin saved room:', e);
            }
          }
        }
        break;

      case 'user_joined':
        // Another user joined the room
        this.handleUserJoined(message.user);
        break;

      case 'user_left':
        // User left the room
        this.handleUserLeft(message.user);
        break;

      case 'room_deleted':
        this.handleRoomDeleted(message.roomId, message.message);
        break;

      case 'chat_message':
        // New chat message received
        console.log('💬 [DEBUG] Received chat_message type in handleMessage:', message);
        this.handleChatMessage(message);
        break;

      case 'preferences_updated':
        // Trip preferences were updated by another user
        this.handlePreferencesUpdate(message.preferences, message.updatedBy);
        break;

      case 'trip_tracing_updated':
        this.handleTripTracingUpdate(message.tripTracingState, message.updatedBy);
        break;

      case 'user_typing':
        this.handleUserTyping(message.user, message.isTyping);
        break;

      case 'trip_state':
        this.handleTripState(message);
        break;

      case 'sync_data':
        this.handleSyncData(message);
        break;

      case 'chat_history':
        this.handleChatHistory(message.messages);
        break;

      case 'room_users':
        console.log('\n👥 ========== ROOM USERS UPDATE RECEIVED ==========');
        console.log('👥 Total users:', message.users?.length || 0);
        console.log('👥 Users:', JSON.stringify(message.users?.map((u: any) => ({ name: u.name, isOnline: u.isOnline, isCreator: u.isCreator })), null, 2));
        console.log('👥 Current onlineUsers state before update:', this.state.onlineUsers.length);
        console.log('👥 ================================================\n');
        
        this.state.onlineUsers = message.users;
        // Trigger callback with all users to update UI
        this.callbacks.onRoomUsers?.(message.users);
        
        console.log('👥 Updated onlineUsers state:', this.state.onlineUsers.length);
        console.log('👥 onRoomUsers callback executed');
        break;

      case 'room_joined':
        console.log('✅ [DEBUG] Room joined successfully:', message.roomId);
        this.state.currentTripId = message.roomId;
        break;

      case 'error':
        console.error('❌ Collaboration error:', message.message);
        this.state.lastError = message.message;
        this.callbacks.onError?.(message.message);
        break;

      case 'server_shutdown':
        console.log('🛑 Collaboration server is shutting down');
        this.state.isConnected = false;
        this.callbacks.onConnectionChange?.(false);
        break;

      case 'pong':
        console.log('💓 [DEBUG] Received pong from server');
        break;

      default:
        console.log('⚠️ Unknown collaboration message type:', message.type);
    }
  }

  private handleUserJoined(user: CollaborationUser) {
    console.log('👥 [DEBUG] User joined:', user);
    console.log('👥 [DEBUG] Current online users before:', this.state.onlineUsers.length);
    console.log('👥 [DEBUG] Current online users list:', this.state.onlineUsers);
    
    // Update or add user to the list
    const existingUserIndex = this.state.onlineUsers.findIndex(u => u.id === user.id);
    if (existingUserIndex >= 0) {
      // Update existing user
      this.state.onlineUsers[existingUserIndex] = user;
      console.log('👥 [DEBUG] Updated existing user:', user.id);
    } else {
      // Add new user
      this.state.onlineUsers.push(user);
      console.log('👥 [DEBUG] Added new user:', user.id);
    }
    
    console.log('👥 [DEBUG] Current online users after:', this.state.onlineUsers.length);
    console.log('👥 [DEBUG] Updated online users list:', this.state.onlineUsers);
    
    // Always trigger callback to update UI
    this.callbacks.onUserJoined?.(user);
  }

  private handleUserLeft(user: CollaborationUser) {
    // Don't remove user from state - mark as offline instead
    // The backend will send room_users with all users (including offline ones)
    const userIndex = this.state.onlineUsers.findIndex(u => u.id === user.id);
    if (userIndex >= 0) {
      this.state.onlineUsers[userIndex] = { ...this.state.onlineUsers[userIndex], isOnline: false };
      console.log('👥 [DEBUG] Marked user as offline in service state:', user.id);
    }
    this.callbacks.onUserLeft?.(user);
  }

  private handleRoomDeleted(roomId: string, message: string) {
    console.log(`🗑️ [DEBUG] Room deleted: ${roomId} - ${message}`);
    
    // Check if this is the current user's room
    const currentRoomId = localStorage.getItem('current-room-id');
    if (currentRoomId === roomId) {
      console.log(`🗑️ [DEBUG] Current user was in deleted room - cleaning up localStorage`);
      
      // Clear localStorage
      localStorage.removeItem('current-room-id');
      localStorage.removeItem('room-creator');
      
      // Clear state
      this.state.currentTripId = null;
      this.state.onlineUsers = [];
      this.state.messages = [];
      
      // Disconnect if connected
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.disconnect();
      }
      
      // Dispatch event to notify UI components
      window.dispatchEvent(new CustomEvent('roomDeleted', {
        detail: { roomId, reason: 'empty' }
      }));
      
      console.log(`✅ [DEBUG] Cleanup complete for deleted room ${roomId}`);
    }
  }

  private handleChatMessage(message: CollaborationMessage) {
    console.log('💬 [DEBUG] Received chat message:', message);
    console.log('💬 [DEBUG] Message structure:', {
      id: message.id,
      text: message.text,
      user: message.user,
      timestamp: message.timestamp
    });
    console.log('💬 [DEBUG] Current messages count before:', this.state.messages.length);
    
    // Check if this exact message already exists (same ID)
    const messageExists = this.state.messages.some(m => m.id === message.id);
    if (messageExists) {
      console.log('💬 [DEBUG] Duplicate message ID found, skipping:', message.id);
      return;
    }
    
    this.state.messages.push(message);
    
    console.log('💬 [DEBUG] Current messages count after:', this.state.messages.length);
    console.log('💬 [DEBUG] All messages:', this.state.messages);
    
    console.log('💬 [DEBUG] Calling onMessage callback...');
    console.log('💬 [DEBUG] Callbacks available:', !!this.callbacks.onMessage);
    this.callbacks.onMessage?.(message);
    console.log('💬 [DEBUG] onMessage callback called');
  }

  private handleChatHistory(messages: CollaborationMessage[]) {
    console.log('📚 [DEBUG] Received chat history:', messages.length, 'messages');
    console.log('📚 [DEBUG] Chat history messages:', messages);
    
    this.state.messages = messages;
    
    console.log('📚 [DEBUG] Updated state messages:', this.state.messages);
    
    // Trigger callback with all messages to replace UI messages
    this.callbacks.onChatHistory?.(messages);
  }

  private handlePreferencesUpdate(preferences: any, updatedBy: CollaborationUser) {
    this.callbacks.onPreferencesUpdate?.(preferences, updatedBy);
  }

  private handleTripTracingUpdate(tripTracingState: any, updatedBy: CollaborationUser) {
    this.callbacks.onTripTracingUpdate?.(tripTracingState, updatedBy);
  }

  private handleUserTyping(user: CollaborationUser, isTyping: boolean) {
    this.state.isTyping[user.id] = isTyping;
    this.callbacks.onTypingChange?.(user.id, isTyping);
  }

  private handleTripState(message: any) {
    this.state.currentTripId = message.tripId;
    this.state.onlineUsers = message.onlineUsers || [];
    
    // Handle initial data sync
    if (message.preferences) {
      this.callbacks.onPreferencesUpdate?.(message.preferences, { id: '', name: 'System', email: '' });
    }
    
    if (message.tripTracingState) {
      this.callbacks.onTripTracingUpdate?.(message.tripTracingState, { id: '', name: 'System', email: '' });
    }
  }

  private handleSyncData(message: any) {
    if (message.preferences) {
      this.callbacks.onPreferencesUpdate?.(message.preferences, { id: '', name: 'System', email: '' });
    }
    
    if (message.tripTracingState) {
      this.callbacks.onTripTracingUpdate?.(message.tripTracingState, { id: '', name: 'System', email: '' });
    }
  }

  // Public methods
  public setCallbacks(callbacks: CollaborationCallbacks) {
    console.log('🔧 [DEBUG] Setting collaboration callbacks from component:', Object.keys(callbacks));
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('🔧 [DEBUG] Updated callbacks:', Object.keys(this.callbacks));
  }

  public joinTrip(tripId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot join trip: WebSocket not connected');
      return;
    }

    this.sendMessage({
      type: 'join_trip',
      tripId
    });

    this.state.currentTripId = tripId;
    console.log(`👥 Joined trip: ${tripId}`);
  }

  public leaveTrip(tripId?: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const targetTripId = tripId || this.state.currentTripId;
    if (!targetTripId) {
      return;
    }

    this.sendMessage({
      type: 'leave_trip',
      tripId: targetTripId
    });

    if (targetTripId === this.state.currentTripId) {
      this.state.currentTripId = null;
      this.state.onlineUsers = [];
      this.state.messages = [];
    }

    console.log(`👋 Left trip: ${targetTripId}`);
  }

  public sendMessage(message: any) {
    console.log('📤 [DEBUG] Sending message:', message);
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('❌ [DEBUG] Cannot send message: WebSocket not connected. State:', this.ws?.readyState);
      return;
    }

    console.log('✅ [DEBUG] WebSocket is open, sending message...');
    this.ws.send(JSON.stringify(message));
    console.log('📤 [DEBUG] Message sent successfully');
  }

  public sendChatMessage(text: string) {
    console.log('💬 [DEBUG] sendChatMessage called with:', text);
    console.log('💬 [DEBUG] WebSocket state:', this.ws?.readyState);
    console.log('💬 [DEBUG] WebSocket URL:', this.ws?.url);
    console.log('💬 [DEBUG] Current trip ID:', this.state.currentTripId);
    console.log('💬 [DEBUG] Is connected:', this.state.isConnected);
    console.log('💬 [DEBUG] WebSocket instance:', !!this.ws);
    
    if (!text || text.trim() === '') {
      console.warn('❌ [DEBUG] Cannot send empty message');
      return;
    }
    
    if (!this.state.currentTripId) {
      console.warn('❌ [DEBUG] Cannot send chat message: No active trip');
      console.log('💬 [DEBUG] Available state:', {
        currentTripId: this.state.currentTripId,
        isConnected: this.state.isConnected,
        wsState: this.ws?.readyState
      });
      this.callbacks.onError?.('No active room. Please join a room first.');
      return;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('❌ [DEBUG] Cannot send chat message: WebSocket not open');
      this.callbacks.onError?.('Connection lost. Please try reconnecting.');
      return;
    }

    const chatMessage = {
      type: 'chat_message',
      roomId: this.state.currentTripId,
      tripId: this.state.currentTripId,
      text: text.trim()
    };
    
    console.log('💬 [DEBUG] Sending chat message:', chatMessage);
    console.log('💬 [DEBUG] About to call sendMessage...');
    this.sendMessage(chatMessage);
    console.log('💬 [DEBUG] sendMessage called successfully');
  }

  public updatePreferences(preferences: any) {
    if (!this.state.currentTripId) {
      console.warn('Cannot update preferences: No active trip');
      return;
    }

    this.sendMessage({
      type: 'update_preferences',
      tripId: this.state.currentTripId,
      preferences
    });
  }

  public updateTripTracing(tripTracingState: any) {
    if (!this.state.currentTripId) {
      console.warn('Cannot update trip tracing: No active trip');
      return;
    }

    this.sendMessage({
      type: 'update_trip_tracing',
      tripId: this.state.currentTripId,
      tripTracingState
    });
  }

  public setTyping(isTyping: boolean) {
    if (!this.state.currentTripId) {
      return;
    }

    this.sendMessage({
      type: 'user_typing',
      tripId: this.state.currentTripId,
      isTyping
    });

    // Clear typing indicator after 3 seconds
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    if (isTyping) {
      this.typingTimeout = setTimeout(() => {
        this.setTyping(false);
      }, 3000);
    }
  }

  public requestSync() {
    if (!this.state.currentTripId) {
      console.warn('Cannot request sync: No active trip');
      return;
    }

    this.sendMessage({
      type: 'request_sync',
      tripId: this.state.currentTripId
    });
  }

  public joinRoom(roomId: string, userId: string, userName: string, isRoomCreator: boolean = false) {
    console.log('🔗 [DEBUG] Attempting to join room:', roomId, 'as user:', userName);
    console.log('🔗 [DEBUG] Is room creator:', isRoomCreator);
    console.log('🔗 [DEBUG] Current WebSocket state:', this.ws?.readyState);
    console.log('🔗 [DEBUG] Current trip ID:', this.state.currentTripId);
    console.log('🔗 [DEBUG] WebSocket instance:', !!this.ws);
    console.log('🔗 [DEBUG] Is connected:', this.state.isConnected);
    console.log('🔗 [DEBUG] User ID:', userId);
    console.log('🔗 [DEBUG] User Name:', userName);
    
    // Prevent duplicate joins to the same room if already connected
    if (this.state.currentTripId === roomId && this.state.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      console.log('🔗 [DEBUG] Already in room and connected:', roomId, 'skipping join');
      return;
    }
    
    // Prevent duplicate pending joins
    if (this.pendingJoinRoom && this.pendingJoinRoom.roomId === roomId) {
      console.log('🔗 [DEBUG] Already have pending join for room:', roomId, 'skipping');
      return;
    }
    
    // If not connected, connect first and store pending join
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('🔗 [DEBUG] WebSocket not connected, storing pending join and connecting...');
      this.pendingJoinRoom = { roomId, userId, userName, isRoomCreator };
      this.connect();
    } else {
      console.log('✅ [DEBUG] WebSocket already connected, joining room');
      this.sendJoinRoomMessage(roomId, userId, userName, isRoomCreator);
    }
  }

  private sendJoinRoomMessage(roomId: string, userId: string, userName: string, isRoomCreator: boolean = false) {
    const joinMessage = {
      type: 'join_room',
      roomId,
      userId,
      userName,
      isRoomCreator
    };
    
    console.log('📤 [DEBUG] Sending join room message:', joinMessage);
    console.log('📤 [DEBUG] WebSocket state:', this.ws?.readyState);
    console.log('📤 [DEBUG] WebSocket URL:', this.ws?.url);
    console.log('📤 [DEBUG] Is WebSocket open?', this.ws?.readyState === WebSocket.OPEN);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('📤 [DEBUG] WebSocket is open, sending join room message...');
      this.ws.send(JSON.stringify(joinMessage));
      this.state.currentTripId = roomId;
      
      console.log('✅ [DEBUG] Room joined successfully. Current trip ID:', this.state.currentTripId);
    } else {
      console.error('❌ [DEBUG] Cannot send join room message - WebSocket not open');
    }
  }

  public disconnect() {
    // Stop heartbeat
    this.stopHeartbeat();
    
    // Clear connection debounce timeout
    if (this.connectionDebounceTimeout) {
      clearTimeout(this.connectionDebounceTimeout);
      this.connectionDebounceTimeout = null;
    }
    
    // Reset connection flags
    this.isConnecting = false;
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.state.isConnected = false;
    this.state.currentTripId = null;
    this.state.onlineUsers = [];
    this.state.messages = [];
    this.state.isTyping = {};
  }

  private startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat
    
    console.log('💓 [DEBUG] Starting heartbeat to keep connection alive');
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('💓 [DEBUG] Sending heartbeat ping');
        this.ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        console.log('💓 [DEBUG] WebSocket not open, stopping heartbeat');
        this.stopHeartbeat();
      }
    }, 60000); // Send heartbeat every 60 seconds (reduced frequency)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      console.log('💓 [DEBUG] Stopping heartbeat');
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Getters
  public getState(): CollaborationState {
    return { ...this.state };
  }

  public isConnected(): boolean {
    return this.state.isConnected;
  }

  public getCurrentTripId(): string | null {
    return this.state.currentTripId;
  }

  public getOnlineUsers(): CollaborationUser[] {
    return [...this.state.onlineUsers];
  }

  public getMessages(): CollaborationMessage[] {
    return [...this.state.messages];
  }

  public getLastError(): string | null {
    return this.state.lastError;
  }

  // Manual connection test method
  public testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('🧪 [DEBUG] Starting manual connection test...');
      
      // Check if backend is accessible
      fetch('http://localhost:3001/api/health')
        .then(response => {
          if (response.ok) {
            console.log('✅ [DEBUG] Backend server is accessible');
            return response.json();
          } else {
            console.error('❌ [DEBUG] Backend server returned error:', response.status);
            resolve(false);
          }
        })
        .then(data => {
          if (data) {
            console.log('📊 [DEBUG] Backend health check:', data);
          }
          
          // Check WebSocket server
          console.log('🔍 [DEBUG] Testing WebSocket server...');
          const testWs = new WebSocket('wss://where-to-next-backend.onrender.com');
          
          testWs.onopen = () => {
            console.log('✅ [DEBUG] WebSocket server is accessible');
            testWs.close();
            resolve(true);
          };
          
          testWs.onerror = (error) => {
            console.error('❌ [DEBUG] WebSocket server test failed:', error);
            resolve(false);
          };
          
          testWs.onclose = (event) => {
            console.log('🔌 [DEBUG] WebSocket test connection closed:', event.code, event.reason);
          };
          
          // Timeout after 5 seconds
          setTimeout(() => {
            console.error('⏰ [DEBUG] WebSocket test timed out');
            testWs.close();
            resolve(false);
          }, 5000);
        })
        .catch(err => {
          console.error('❌ [DEBUG] Backend server test failed:', err.message);
          resolve(false);
        });
    });
  }

  // Force reconnection method
  public forceReconnect(roomId?: string, userId?: string, userName?: string, isRoomCreator?: boolean): void {
    console.log('🔄 [DEBUG] Force reconnection requested by user');
    console.log('🔄 [DEBUG] Current WebSocket state:', this.ws?.readyState);
    console.log('🔄 [DEBUG] Current connection state:', this.state.isConnected);
    console.log('🔄 [DEBUG] Room to rejoin:', roomId || this.state.currentTripId || 'none');
    
    // Save room info for rejoining after reconnection
    const roomToRejoin = roomId || this.state.currentTripId;
    const savedRoomId = localStorage.getItem('current-room-id');
    
    // Use provided params or fall back to saved room info
    const finalRoomId = roomToRejoin || savedRoomId;
    const finalUserId = userId;
    const finalUserName = userName;
    const finalIsRoomCreator = isRoomCreator !== undefined ? isRoomCreator : (finalRoomId ? localStorage.getItem('room-creator') === finalUserId : false);
    
    // Reset attempt counter
    this.reconnectAttempts = 0;
    
    // Force disconnect
    this.disconnect();
    
    // Clear state but preserve room info if provided
    this.state.isConnected = false;
    this.state.lastError = null;
    
    // Notify UI of disconnection
    this.callbacks.onConnectionChange?.(false);
    
    console.log('🔄 [DEBUG] Starting reconnection in 1 second...');
    setTimeout(() => {
      console.log('🔄 [DEBUG] Attempting reconnection...');
      
      // If we have room info, set up pending join
      if (finalRoomId && finalUserId && finalUserName) {
        console.log('🔄 [DEBUG] Setting up pending room join:', finalRoomId);
        this.pendingJoinRoom = {
          roomId: finalRoomId,
          userId: finalUserId,
          userName: finalUserName,
          isRoomCreator: finalIsRoomCreator
        };
      } else if (finalRoomId) {
        // If we only have roomId, we'll need to get user info from localStorage after connection
        console.log('🔄 [DEBUG] Room ID provided but missing user info, will rejoin after connection');
      }
      
      this.connect();
    }, 1000);
  }

  // Manual connection trigger for debugging
  public manualConnect(): void {
    console.log('🔧 [DEBUG] Manual connection triggered');
    console.log('🔧 [DEBUG] Current WebSocket state:', this.ws?.readyState);
    console.log('🔧 [DEBUG] Current connection state:', this.state.isConnected);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ [DEBUG] WebSocket already connected');
      return;
    }
    
    console.log('🔄 [DEBUG] Starting fresh connection...');
    this.connect();
  }

  // Get connection status for debugging
  public getConnectionStatus(): any {
    return {
      wsState: this.ws?.readyState,
      wsStateName: this.ws ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.ws.readyState] : 'UNDEFINED',
      isConnected: this.state.isConnected,
      currentTripId: this.state.currentTripId,
      onlineUsers: this.state.onlineUsers.length,
      messages: this.state.messages.length,
      lastError: this.state.lastError,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const collaborationService = new CollaborationService();

export default collaborationService;
export type { CollaborationUser, CollaborationMessage, CollaborationState, CollaborationCallbacks };
