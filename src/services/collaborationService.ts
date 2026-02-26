interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  isOnline?: boolean;
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

interface CollaborationState {
  isConnected: boolean;
  currentTripId: string | null;
  onlineUsers: CollaborationUser[];
  messages: CollaborationMessage[];
  isTyping: { [userId: string]: boolean };
  lastError: string | null;
}

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

class CollaborationService {
  private ws: WebSocket | null = null;
  private state: CollaborationState = {
    isConnected: false,
    currentTripId: null,
    onlineUsers: [],
    messages: [],
    isTyping: {},
    lastError: null
  };
  private callbacks: CollaborationCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private typingTimeout: NodeJS.Timeout | null = null;
  private pendingJoinRoom: { roomId: string; userId: string; userName: string; isRoomCreator: boolean } | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionDebounceTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor() {
  }

  private connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }
    
    if (this.isConnecting) {
      return;
    }
    if (this.connectionDebounceTimeout) {
      clearTimeout(this.connectionDebounceTimeout);
    }

    this.connectionDebounceTimeout = setTimeout(() => {
      this.performConnection();
    }, 100);
  }

  private performConnection() {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        this.state.lastError = 'Please login to use collaboration features';
        this.callbacks.onError?.('Please login to use collaboration features');
        this.isConnecting = false;
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          this.state.lastError = 'Your session has expired - please login again';
          this.callbacks.onError?.('Your session has expired - please login again');
          return;
        }
      } catch (e) {
        console.error('Invalid token format:', e);
        this.state.lastError = 'Invalid authentication - please login again';
        this.callbacks.onError?.('Invalid authentication - please login again');
        return;
      }

      const wsUrl = `wss://where-to-next-backend.onrender.com?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.state.isConnected = true;
        this.state.lastError = null;
        this.reconnectAttempts = 0;
        this.callbacks.onConnectionChange?.(true);
        
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false; 
        this.stopHeartbeat();
        this.state.isConnected = false;
        this.callbacks.onConnectionChange?.(false);
        
        const token = localStorage.getItem('token');
        const hasActiveRoom = localStorage.getItem('current-room-id');

        if (event.code !== 1000 && token && hasActiveRoom && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        this.state.lastError = 'Connection error';
        this.callbacks.onError?.('Connection error');
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      this.state.lastError = 'Failed to connect';
      this.callbacks.onError?.('Failed to connect');
    }
  }

  private attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(message: any) {

    // Switch statement: Handle different message types
    switch (message.type) {
      case 'connection_established':
        // Server confirmed connection
        if (this.pendingJoinRoom) {
          this.sendJoinRoomMessage(this.pendingJoinRoom.roomId, this.pendingJoinRoom.userId, this.pendingJoinRoom.userName, this.pendingJoinRoom.isRoomCreator);
          this.pendingJoinRoom = null;
        } else {
          const savedRoomId = localStorage.getItem('current-room-id');
          if (savedRoomId) {
            try {
              const token = localStorage.getItem('token');
              if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userStr = localStorage.getItem('user');
                if (userStr) {
                  const user = JSON.parse(userStr);
                  const isRoomCreator = localStorage.getItem('room-creator') === user.id;
                  this.sendJoinRoomMessage(savedRoomId, user.id, user.name || user.email, isRoomCreator);
                }
              }
            } catch (e) {
              console.error('Failed to rejoin saved room:', e);
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
        this.state.onlineUsers = message.users;
        this.callbacks.onRoomUsers?.(message.users);
        break;

      case 'room_joined':
        this.state.currentTripId = message.roomId;
        break;

      case 'error':
        console.error('Collaboration error:', message.message);
        this.state.lastError = message.message;
        this.callbacks.onError?.(message.message);
        break;

      case 'server_shutdown':
        this.state.isConnected = false;
        this.callbacks.onConnectionChange?.(false);
        break;

      case 'pong':
        break;

      default:
        console.warn('Unknown collaboration message type:', message.type);
    }
  }

  private handleUserJoined(user: CollaborationUser) {
    const existingUserIndex = this.state.onlineUsers.findIndex(u => u.id === user.id);
    if (existingUserIndex >= 0) {
      this.state.onlineUsers[existingUserIndex] = user;
    } else {
      this.state.onlineUsers.push(user);
    }
    
    this.callbacks.onUserJoined?.(user);
  }

  private handleUserLeft(user: CollaborationUser) {
    const userIndex = this.state.onlineUsers.findIndex(u => u.id === user.id);
    if (userIndex >= 0) {
      this.state.onlineUsers[userIndex] = { ...this.state.onlineUsers[userIndex], isOnline: false };
    }
    this.callbacks.onUserLeft?.(user);
  }

  private handleRoomDeleted(roomId: string, message: string) {
    const currentRoomId = localStorage.getItem('current-room-id');
    if (currentRoomId === roomId) {
      localStorage.removeItem('current-room-id');
      localStorage.removeItem('room-creator');
      
      this.state.currentTripId = null;
      this.state.onlineUsers = [];
      this.state.messages = [];
      
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.disconnect();
      }
      
      window.dispatchEvent(new CustomEvent('roomDeleted', {
        detail: { roomId, reason: 'empty' }
      }));
    }
  }

  private handleChatMessage(message: CollaborationMessage) {
    // Check if this exact message already exists (same ID)
    const messageExists = this.state.messages.some(m => m.id === message.id);
    if (messageExists) {
      return;
    }
    
    this.state.messages.push(message);
    this.callbacks.onMessage?.(message);
  }

  private handleChatHistory(messages: CollaborationMessage[]) {
    this.state.messages = messages;
    
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

  public setCallbacks(callbacks: CollaborationCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
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
  }

  public sendMessage(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  public sendChatMessage(text: string) {
    if (!text || text.trim() === '') {
      return;
    }
    
    if (!this.state.currentTripId) {
      this.callbacks.onError?.('No active room. Please join a room first.');
      return;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.callbacks.onError?.('Connection lost. Please try reconnecting.');
      return;
    }

    const chatMessage = {
      type: 'chat_message',
      roomId: this.state.currentTripId,
      tripId: this.state.currentTripId,
      text: text.trim()
    };
    
    this.sendMessage(chatMessage);
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
    if (this.state.currentTripId === roomId && this.state.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    
    if (this.pendingJoinRoom && this.pendingJoinRoom.roomId === roomId) {
      return;
    }
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.pendingJoinRoom = { roomId, userId, userName, isRoomCreator };
      this.connect();
    } else {
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
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(joinMessage));
      this.state.currentTripId = roomId;
    }
  }

  public disconnect() {
    this.stopHeartbeat();
    
    if (this.connectionDebounceTimeout) {
      clearTimeout(this.connectionDebounceTimeout);
      this.connectionDebounceTimeout = null;
    }
    
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
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        this.stopHeartbeat();
      }
    }, 60000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
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

  public testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      fetch('http://localhost:3001/api/health')
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            resolve(false);
          }
        })
        .then(data => {
          const testWs = new WebSocket('wss://where-to-next-backend.onrender.com');
          
          testWs.onopen = () => {
            testWs.close();
            resolve(true);
          };
          
          testWs.onerror = (error) => {
            resolve(false);
          };
          
          testWs.onclose = (event) => {
          };
          
          setTimeout(() => {
            testWs.close();
            resolve(false);
          }, 5000);
        })
        .catch(err => {
          console.error('Backend server test failed:', err.message);
          resolve(false);
        });
    });
  }

  public forceReconnect(roomId?: string, userId?: string, userName?: string, isRoomCreator?: boolean): void {
    const roomToRejoin = roomId || this.state.currentTripId;
    const savedRoomId = localStorage.getItem('current-room-id');
    
    const finalRoomId = roomToRejoin || savedRoomId;
    const finalUserId = userId;
    const finalUserName = userName;
    const finalIsRoomCreator = isRoomCreator !== undefined ? isRoomCreator : (finalRoomId ? localStorage.getItem('room-creator') === finalUserId : false);
    
    this.reconnectAttempts = 0;
    this.disconnect();
    
    this.state.isConnected = false;
    this.state.lastError = null;
    this.callbacks.onConnectionChange?.(false);
    
    setTimeout(() => {
      if (finalRoomId && finalUserId && finalUserName) {
        this.pendingJoinRoom = {
          roomId: finalRoomId,
          userId: finalUserId,
          userName: finalUserName,
          isRoomCreator: finalIsRoomCreator
        };
      }
      
      this.connect();
    }, 1000);
  }

  public manualConnect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    
    this.connect();
  }

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

const collaborationService = new CollaborationService();

export default collaborationService;
export type { CollaborationUser, CollaborationMessage, CollaborationState, CollaborationCallbacks };
