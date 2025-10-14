// ADVANCED TECHNIQUE 39: COMPREHENSIVE REACT IMPORTS WITH ADVANCED LIBRARIES
// Multiple React hooks, animation library, DOM manipulation, and custom service imports
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Advanced animation library
import { createPortal } from 'react-dom'; // Portal rendering for modal overlays
import collaborationService, { CollaborationUser, CollaborationMessage } from '../../services/collaborationService';
import { getCurrentUser } from '../../services/apiService';
import CollaborationInvite from './CollaborationInvite';

interface DraggableCollaborationPanelProps {
  tripId: string;
  isVisible: boolean;
  onToggle: () => void;
}

const DraggableCollaborationPanel: React.FC<DraggableCollaborationPanelProps> = ({
  tripId,
  isVisible,
  onToggle
}) => {
  // ADVANCED TECHNIQUE 40: WEB AUDIO API SYNTHESIS WITH ENVELOPE SHAPING
  // Complex audio synthesis using Web Audio API with oscillator and gain node manipulation
  const playNotificationSound = () => {
    try {
      // ADVANCED TECHNIQUE 41: CROSS-BROWSER AUDIO CONTEXT INITIALIZATION
      // Dynamic audio context creation with fallback for different browser implementations
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // ADVANCED TECHNIQUE 42: FUNCTIONAL PROGRAMMING WITH AUDIO SYNTHESIS
      // Higher-order function for creating customizable audio tones with mathematical precision
      const createBellTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // ADVANCED TECHNIQUE 43: AUDIO ENVELOPE SHAPING WITH MATHEMATICAL CURVES
        // Complex gain envelope with linear and exponential ramps for realistic bell sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // ADVANCED TECHNIQUE 44: MUSICAL INTERVAL SYNTHESIS
      // Two-tone harmonic sequence using musical frequencies (perfect fifth interval)
      const now = audioContext.currentTime;
      createBellTone(523.25, now, 0.3); // C5
      createBellTone(659.25, now + 0.15, 0.3); // E5
      
      console.log('🔔 [DEBUG] Notification ding sound played');
    } catch (error) {
      console.log('🔔 [DEBUG] Could not play notification sound:', error);
    }
  };
  // ADVANCED TECHNIQUE 45: COMPREHENSIVE STATE MANAGEMENT WITH MULTIPLE HOOKS
  // Complex component state with multiple useState hooks for different aspects of UI and functionality
  const [shouldStayOpen, setShouldStayOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const [isChatboxVisible, setIsChatboxVisible] = useState(false); // Track actual visibility
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<CollaborationUser[]>([]);
  const [userStatuses, setUserStatuses] = useState<{ [userId: string]: boolean }>({});
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({});
  const [lastError, setLastError] = useState<string | null>(null);
  
  // ADVANCED TECHNIQUE 46: INTERACTIVE UI STATE MANAGEMENT
  // Complex state for drag-and-drop functionality with position, size, and interaction tracking
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 50 });
  const [size, setSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  // ADVANCED TECHNIQUE 47: LAZY STATE INITIALIZATION WITH LOCALSTORAGE
  // State initialization with localStorage integration for persistence across sessions
  const [roomCreator, setRoomCreator] = useState<string | null>(() => {
    return localStorage.getItem('room-creator') || null;
  });
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Auto-scroll when messages change
    scrollToBottom();
  }, [messages]);

  // Clear notifications when chatbox becomes visible
  useEffect(() => {
    if (isVisible) {
      console.log('🔔 [DEBUG] Chatbox opened - clearing notifications');
      setHasNewMessages(false);
      setUnreadMessageCount(0);
      setIsChatboxVisible(true); // Chatbox is now visible
    } else {
      setIsChatboxVisible(false); // Chatbox is now hidden
    }
  }, [isVisible]);

  // Dispatch notification updates to header
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('notificationUpdate', {
      detail: {
        hasNewMessages,
        unreadMessageCount
      }
    }));
  }, [hasNewMessages, unreadMessageCount]);

  useEffect(() => {
    
    // Set up collaboration callbacks
    collaborationService.setCallbacks({
      onConnectionChange: (connected) => {
        console.log('🔗 [DEBUG] Panel: Connection status changed to:', connected);
        console.log('🔗 [DEBUG] Collaboration service state:', collaborationService.getConnectionStatus());
        console.log('🔗 [DEBUG] WebSocket connection status:', collaborationService.getConnectionStatus());
        setIsConnected(connected);
      },
      onUserJoined: (user) => {
        console.log('👥 [DEBUG] User joined:', user);
        setOnlineUsers(prev => {
          if (!prev.find(u => u.id === user.id)) {
            console.log('👥 [DEBUG] Adding user to list:', user.name);
            return [...prev, user];
          }
          console.log('👥 [DEBUG] User already in list:', user.name);
          return prev;
        });
        // Mark user as online
        setUserStatuses(prev => ({ ...prev, [user.id]: true }));
      },
      onUserLeft: (user) => {
        console.log('👥 [DEBUG] User left:', user);
        setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
        // Mark user as offline
        setUserStatuses(prev => ({ ...prev, [user.id]: false }));
      },
      onMessage: (message) => {
        console.log('💬 [DEBUG] Received message in panel:', message);
        console.log('💬 [DEBUG] Message structure:', {
          hasMessage: !!message,
          hasUser: !!(message && message.user),
          hasText: !!(message && message.text),
          userId: message?.user?.id,
          userName: message?.user?.name,
          text: message?.text
        });
        console.log('💬 [DEBUG] Current messages count:', messages.length);
        console.log('💬 [DEBUG] Panel isVisible:', isVisible);
        
        if (message && message.user && message.text) {
          setMessages(prev => {
            console.log('💬 [DEBUG] Adding message to state. Previous count:', prev.length);
            
            // Check if this exact message already exists (same ID)
            const messageExists = prev.some(m => m.id === message.id);
            if (messageExists) {
              console.log('💬 [DEBUG] Duplicate message ID in UI state, skipping:', message.id);
              return prev;
            }
            
            const newMessages = [...prev, message];
            console.log('💬 [DEBUG] New messages count:', newMessages.length);
            console.log('💬 [DEBUG] New message details:', {
              id: message.id,
              user: message.user?.name,
              text: message.text,
              timestamp: message.timestamp
            });
            return newMessages;
          });
          
          // Show notification logic:
          // 1. Only for messages from OTHER users (not your own)
          // 2. Only when chatbox is closed (not visible)
          const currentUser = getCurrentUser();
          const isFromCurrentUser = currentUser && message.user.id === currentUser.id;
          
          // Only show notification badge if:
          // - Message is from another user (not yourself)
          // - Chatbox is closed (not visible)
          if (!isFromCurrentUser && !isChatboxVisible) {
            console.log('🔔 [DEBUG] Showing notification for message from:', message.user.name);
            console.log('🔔 [DEBUG] Notification conditions:', {
              isFromCurrentUser,
              isVisible,
              isChatboxVisible,
              messageFrom: message.user.name
            });
            
            setHasNewMessages(true);
            setUnreadMessageCount(prev => prev + 1);
            
            // Play ding sound for new message
            playNotificationSound();
          } else {
            console.log('🔔 [DEBUG] Not showing notification. Reason:', 
              isFromCurrentUser ? 'own message' : 'chatbox is open'
            );
          }
        } else {
          console.warn('❌ [DEBUG] Invalid message received:', message);
        }
      },
      onChatHistory: (messages) => {
        console.log('📚 [DEBUG] Received chat history in panel:', messages.length, 'messages');
        setMessages(messages); // Replace messages, don't append
      },
      onRoomUsers: (users) => {
        console.log('\n👥 ========== UI RECEIVED ROOM USERS ==========');
        console.log('👥 Total users received:', users?.length || 0);
        console.log('👥 Users with creator info:', users.map(u => ({
          id: u.id,
          name: u.name,
          isCreator: u.isCreator,
          isOnline: u.isOnline
        })));
        console.log('👥 Current onlineUsers state before update:', onlineUsers.length);
        console.log('👥 ================================================\n');
        
        setOnlineUsers(users);
        
        // Update user statuses based on the received users
        const newUserStatuses: { [userId: string]: boolean } = {};
        users.forEach(user => {
          newUserStatuses[user.id] = user.isOnline || false;
        });
        setUserStatuses(newUserStatuses);
        
        console.log('👥 setOnlineUsers called with', users.length, 'users');
        console.log('👥 Updated userStatuses:', newUserStatuses);
      },
      onTypingChange: (userId, typing) => {
        setIsTyping(prev => ({ ...prev, [userId]: typing }));
      },
      onError: (error) => {
        setLastError(error);
        console.error('Collaboration error:', error);
      }
    });

    // Load existing messages and connection status
    const currentMessages = collaborationService.getMessages();
    const currentUsers = collaborationService.getOnlineUsers();
    const currentConnection = collaborationService.isConnected();
    
    console.log('Panel: Initial state - Connected:', currentConnection, 'Messages:', currentMessages.length, 'Users:', currentUsers.length);
    
    setMessages(currentMessages);
    setOnlineUsers(currentUsers);
    setIsConnected(currentConnection);

    // Cleanup function to disconnect when component unmounts
    return () => {
      console.log('🔗 [DEBUG] DraggableCollaborationPanel unmounting - disconnecting WebSocket');
      collaborationService.disconnect();
    };
  }, []);

  // Clear new message indicator when chatbox becomes visible
  useEffect(() => {
    if (isVisible) {
      setHasNewMessages(false);
    }
  }, [isVisible]);

  // Ensure WebSocket connection is maintained even when chatbox is hidden
  useEffect(() => {
    // Keep connection alive even when chatbox is not visible
    if (!isVisible && isConnected) {
      console.log('🔗 [DEBUG] Chatbox hidden but connection maintained');
    }
  }, [isVisible, isConnected]);

  // Auto-join room when tripId is provided (only once)
  useEffect(() => {
    if (tripId && tripId !== 'default-trip') {
      console.log('🔗 [DEBUG] Auto-joining room:', tripId);
      
      // Get current user info
      const currentUser = getCurrentUser();
      if (currentUser) {
        const userId = currentUser.id;
        const userName = currentUser.name || currentUser.email;
        
        console.log('🔗 [DEBUG] Joining room with user:', userName);
        console.log('🔗 [DEBUG] Current collaboration service state:', collaborationService.getConnectionStatus());
        
        const isRoomCreator = localStorage.getItem('room-creator') === userId;
        
        // Only join if not already in this room
        const currentTripId = collaborationService.getCurrentTripId();
        if (currentTripId !== tripId) {
          collaborationService.joinRoom(tripId, userId, userName, isRoomCreator);
        } else {
          console.log('🔗 [DEBUG] Already in this room, skipping join');
        }
        
        // Update roomCreator state from localStorage
        setRoomCreator(localStorage.getItem('room-creator'));
        
        // Mark current user as online
        setUserStatuses(prev => ({ ...prev, [userId]: true }));
        
        // Check connection status after a delay
        setTimeout(() => {
          console.log('🔗 [DEBUG] Connection status after join:', collaborationService.getConnectionStatus());
        }, 2000);
      } else {
        console.warn('❌ [DEBUG] No user found for auto-join');
      }
    }
  }, [tripId]);

  // Debug component lifecycle
  useEffect(() => {
    console.log('🔗 [DEBUG] DraggableCollaborationPanel mounted/updated - tripId:', tripId, 'isVisible:', isVisible);
    
    return () => {
      console.log('🔗 [DEBUG] DraggableCollaborationPanel unmounting/updating');
    };
  }, [tripId, isVisible]);

  // Listen for localStorage changes to update roomCreator state
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'room-creator') {
        console.log('🔍 [DEBUG] Room creator changed in localStorage:', e.newValue);
        setRoomCreator(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for showChatbox event from header
  useEffect(() => {
    const handleShowChatbox = () => {
      console.log('🔍 [DEBUG] Received showChatbox event - opening chatbox');
      // Force the chatbox to be visible
      if (typeof onToggle === 'function') {
        // If onToggle is provided, we need to communicate with parent
        // For now, we'll just log that we received the event
        console.log('🔍 [DEBUG] showChatbox event received but onToggle is controlled by parent');
      }
    };

    window.addEventListener('showChatbox', handleShowChatbox);
    return () => window.removeEventListener('showChatbox', handleShowChatbox);
  }, [onToggle]);

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isResizing) {
      const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      console.log('💬 [DEBUG] Sending message:', newMessage.trim());
      console.log('💬 [DEBUG] Connection status:', isConnected);
      console.log('💬 [DEBUG] Collaboration service state:', collaborationService.getConnectionStatus());
      
      if (isConnected) {
        // Send via WebSocket if connected
        console.log('💬 [DEBUG] Sending via WebSocket');
        collaborationService.sendChatMessage(newMessage.trim());
      } else {
        // Add message locally for testing (offline mode)
        console.log('💬 [DEBUG] Adding message locally (offline mode)');
        const localMessage = {
          id: Date.now().toString(),
          text: newMessage.trim(),
          user: { id: 'local', name: 'You', email: 'local@test.com' },
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, localMessage]);
        console.log('Added message locally:', localMessage);
      }
      
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Always render the component to maintain WebSocket connection and callbacks
  // but conditionally show/hide it with CSS

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0.8
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-[99999]"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'default',
        visibility: isVisible ? 'visible' : 'hidden',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header - Draggable */}
      <div className="drag-handle bg-gray-800 text-white px-4 py-3 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <h3 className="font-semibold">
            Collaboration
            {hasNewMessages && !isVisible && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                {unreadMessageCount > 0 ? unreadMessageCount : 'New!'}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          
          {/* Refresh Button */}
          <button
            onClick={() => {
              console.log('🔄 [DEBUG] Manual refresh requested');
              const currentUser = getCurrentUser();
              if (currentUser && tripId) {
                console.log('🔄 [DEBUG] Refreshing room data for:', tripId);
                // Force rejoin to refresh user list and messages
                collaborationService.disconnect();
                setTimeout(() => {
                  const isRoomCreator = localStorage.getItem('room-creator') === currentUser.id;
                  collaborationService.joinRoom(tripId, currentUser.id, currentUser.name || currentUser.email, isRoomCreator);
                }, 1000);
              }
            }}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Refresh room data"
          >
            Refresh
          </button>

          {/* Invite Button */}
          <button
            onClick={() => setShowInvite(true)}
            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            title="Invite others to this room"
          >
            Invite
          </button>
          
          {/* Room Creator Delete Button */}
          {(() => {
            const currentUser = getCurrentUser();
            const storedRoomCreator = localStorage.getItem('room-creator');
            const canDelete = (roomCreator && currentUser?.id === roomCreator) || 
                             (storedRoomCreator && currentUser?.id === storedRoomCreator);
            console.log('🔍 [DEBUG] Delete Room button check:', {
              roomCreator,
              storedRoomCreator,
              currentUserId: currentUser?.id,
              currentUserEmail: currentUser?.email,
              canDelete
            });
            return canDelete;
          })() && (
            <button
              onClick={() => {
                try {
                  if (window.confirm('Are you sure you want to permanently delete this room? This will disconnect all users and the room cannot be accessed again.')) {
                    // Permanently delete the room
                    localStorage.removeItem('current-room-id');
                    localStorage.removeItem('room-creator');
                    localStorage.removeItem('chatbox-stay-open');
                    
                    // Dispatch event to notify header
                    window.dispatchEvent(new CustomEvent('roomDeleted'));
                    
                    collaborationService.disconnect();
                    onToggle(); // Close the chatbox
                    console.log('Room permanently deleted');
                  }
                } catch (error) {
                  console.error('Error deleting room:', error);
                  alert('An error occurred while deleting the room. Please try again.');
                }
              }}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              title="Permanently delete room (Room creator only)"
            >
              Delete Room
            </button>
          )}

          {/* Leave Room Button - Only for non-initiators */}
          {(() => {
            const currentUser = getCurrentUser();
            const storedRoomCreator = localStorage.getItem('room-creator');
            const isCreator = (roomCreator && currentUser?.id === roomCreator) || 
                             (storedRoomCreator && currentUser?.id === storedRoomCreator);
            console.log('🔍 [DEBUG] Leave Room button check:', {
              roomCreator,
              storedRoomCreator,
              currentUserId: currentUser?.id,
              currentUserEmail: currentUser?.email,
              isCreator
            });
            return !isCreator; // Show button if NOT the creator
          })() && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to permanently leave this room? You will need the share code to rejoin.')) {
                  // Leave the room permanently
                  localStorage.removeItem('current-room-id');
                  localStorage.removeItem('room-creator');
                  localStorage.removeItem('chatbox-stay-open');
                  
                  // Dispatch event to notify header
                  window.dispatchEvent(new CustomEvent('roomDeleted'));
                  
                  collaborationService.disconnect();
                  onToggle(); // Close the chatbox
                  console.log('User permanently left the room');
                }
              }}
              className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              title="Permanently leave room (Non-creators only)"
            >
              Leave Room
            </button>
          )}
          
          {/* Go Online Button */}
          {!isConnected && (
            <button
              onClick={() => {
                console.log('🔄 [DEBUG] Manual reconnect requested');
                console.log('🔄 [DEBUG] Current connection state:', isConnected);
                console.log('🔄 [DEBUG] Service connection state:', collaborationService.getConnectionStatus());
                
                const currentUser = getCurrentUser();
                if (currentUser && tripId) {
                  console.log('🔄 [DEBUG] Reconnecting to room:', tripId);
                  console.log('🔄 [DEBUG] Current user:', currentUser.name);
                  
                  // Force reconnection
                  collaborationService.forceReconnect();
                  
                  // Check connection status after delay
                  setTimeout(() => {
                    const status = collaborationService.getConnectionStatus();
                    console.log('🔄 [DEBUG] Connection status after reconnect:', status);
                    console.log('🔄 [DEBUG] Panel isConnected state:', isConnected);
                    
                    // Force update connection state if needed
                    if (status.isConnected && !isConnected) {
                      console.log('🔄 [DEBUG] Forcing connection state update');
                      setIsConnected(true);
                    }
                    
                    // Mark current user as online
                    setUserStatuses(prev => ({ ...prev, [currentUser.id]: true }));
                  }, 3000);
                } else {
                  console.warn('❌ [DEBUG] Cannot reconnect - no user or room ID');
                  console.log('❌ [DEBUG] Current user:', currentUser);
                  console.log('❌ [DEBUG] Trip ID:', tripId);
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 [DEBUG] Touch end event - Go Online button');
                // Trigger the same logic as onClick
                const currentUser = getCurrentUser();
                if (currentUser && tripId) {
                  collaborationService.forceReconnect();
                }
              }}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors touch-manipulation"
              title="Go online"
              style={{ touchAction: 'manipulation' }}
            >
              Go Online
            </button>
          )}
          
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Connection Error Banner - Only show when offline */}
      {lastError && !isConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-4 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm">{lastError}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('🧪 [DEBUG] User clicked test connection');
                  collaborationService.testConnection().then(success => {
                    console.log('🧪 [DEBUG] Connection test result:', success);
                    alert(success ? 'Connection test passed!' : 'Connection test failed - check console for details');
                  });
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🧪 [DEBUG] Touch end - Test Connection button');
                  collaborationService.testConnection().then(success => {
                    alert(success ? 'Connection test passed!' : 'Connection test failed - check console for details');
                  });
                }}
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Test Connection
              </button>
              <button
                onClick={() => {
                  console.log('🔄 [DEBUG] User clicked force reconnect');
                  collaborationService.forceReconnect();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔄 [DEBUG] Touch end - Force Reconnect button');
                  collaborationService.forceReconnect();
                }}
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Force Reconnect
              </button>
              <button
                onClick={() => {
                  console.log('🔧 [DEBUG] User clicked manual connect');
                  collaborationService.manualConnect();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔧 [DEBUG] Touch end - Manual Connect button');
                  collaborationService.manualConnect();
                }}
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Manual Connect
              </button>
              <button
                onClick={() => {
                  const status = collaborationService.getConnectionStatus();
                  console.log('📊 [DEBUG] Connection status:', status);
                  alert(`Connection Status:\nWebSocket: ${status.wsStateName}\nConnected: ${status.isConnected}\nTrip ID: ${status.currentTripId}\nUsers: ${status.onlineUsers}\nMessages: ${status.messages}\nError: ${status.lastError || 'None'}`);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('📊 [DEBUG] Touch end - Show Status button');
                  const status = collaborationService.getConnectionStatus();
                  alert(`Connection Status:\nWebSocket: ${status.wsStateName}\nConnected: ${status.isConnected}\nTrip ID: ${status.currentTripId}\nUsers: ${status.onlineUsers}\nMessages: ${status.messages}\nError: ${status.lastError || 'None'}`);
                }}
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Show Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
            activeTab === 'chat'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span>💬</span>
          <span>Chat ({messages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span>👥</span>
          <span>Users ({onlineUsers.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-600">
                        {message.user?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Now'}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                      {message.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing indicators */}
              {Object.entries(isTyping).map(([userId, typing]) => 
                typing && (
                  <div key={userId} className="text-xs text-gray-500 italic">
                    {onlineUsers.find(u => u.id === userId)?.name || 'Someone'} is typing...
                  </div>
                )
              )}
              
              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Type a message..." : "Type a message... (offline)"}
                  disabled={false}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isConnected ? 'Send' : 'Send (Offline)'}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Users Tab */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {onlineUsers.map((user) => {
                if (!user || !user.id) {
                  console.warn('❌ [DEBUG] Invalid user in list:', user);
                  return null;
                }
                return (
                  <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center space-x-2">
                        <span>{user.name || 'Unknown User'}</span>
                        {user.isCreator && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            (Initiator)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-2 h-2 rounded-full ${
                        user.isOnline ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  </div>
                );
              })}
              
              {onlineUsers.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No users in room</p>
                  <p className="text-sm">Share your room code to invite others!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 hover:bg-gray-400 transition-colors"
        onMouseDown={handleResizeStart}
        style={{
          clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
        }}
      />

      {/* Invite Modal */}
      <CollaborationInvite
        isVisible={showInvite}
        onClose={() => setShowInvite(false)}
        shareCode={tripId.replace('room-', '')}
        roomName="Trip Planning Room"
      />
    </motion.div>,
    document.body
  );
};

export default DraggableCollaborationPanel;
