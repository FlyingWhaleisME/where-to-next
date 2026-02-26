import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
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
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createBellTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      createBellTone(523.25, now, 0.3);
      createBellTone(659.25, now + 0.15, 0.3);
      
    } catch (error) {
      console.warn('Could not play notification sound');
    }
  };
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
  
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 50 });
  const [size, setSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [roomCreator, setRoomCreator] = useState<string | null>(() => {
    return localStorage.getItem('room-creator') || null;
  });
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(isVisible); // Ref to track current visibility state

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Auto-scroll when messages change
    scrollToBottom();
  }, [messages]);

  // Update ref when visibility changes
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  // Clear notifications when chatbox becomes visible and mark all messages as read
  useEffect(() => {
    if (isVisible) {
      setHasNewMessages(false);
      setUnreadMessageCount(0);
      setIsChatboxVisible(true);
      lastReadTimestampRef.current = Date.now();
    } else {
      setIsChatboxVisible(false);
    }
  }, [isVisible]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('notificationUpdate', {
      detail: {
        hasNewMessages,
        unreadMessageCount
      }
    }));
  }, [hasNewMessages, unreadMessageCount]);

  const lastReadTimestampRef = useRef<number>(Date.now());
  
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);
  
  const handleMessage = useCallback((message: CollaborationMessage) => {
    if (message && message.user && message.text) {
      setMessages(prev => {
        const messageExists = prev.some(m => m.id === message.id);
        if (messageExists) {
          return prev;
        }
        
        return [...prev, message];
      });
      
      const currentUser = getCurrentUser();
      const isFromCurrentUser = currentUser && message.user.id === currentUser.id;
      
      const chatboxIsClosed = !isVisible;
      const chatboxElement = panelRef.current;
      const computedStyle = chatboxElement ? window.getComputedStyle(chatboxElement) : null;
      const isChatboxVisibleInDOM = chatboxElement && 
        computedStyle && 
        computedStyle.visibility !== 'hidden' &&
        computedStyle.display !== 'none' &&
        chatboxElement.offsetParent !== null;
      
      const shouldNotify = !isFromCurrentUser && chatboxIsClosed && !isChatboxVisibleInDOM;
      
      if (shouldNotify) {
        setHasNewMessages(true);
        const messageTime = new Date(message.timestamp).getTime();
        if (messageTime > lastReadTimestampRef.current) {
          setUnreadMessageCount(prev => prev + 1);
        }
        
        playNotificationSound();
      }
    } else {
      console.warn('Invalid message received');
    }
  }, [isVisible]);

  useEffect(() => {
    collaborationService.setCallbacks({
      onConnectionChange: (connected) => {
        setIsConnected(connected);
      },
      onUserJoined: (user) => {
        setOnlineUsers(prev => {
          const existingUser = prev.find(u => u.id === user.id);
          if (!existingUser) {
            return [...prev, { ...user, isOnline: true }];
          } else {
            // User already exists, just update their online status
            return prev.map(u => 
              u.id === user.id ? { ...u, isOnline: true } : u
            );
          }
        });
        // Mark user as online
        setUserStatuses(prev => ({ ...prev, [user.id]: true }));
      },
      onUserLeft: (user) => {
        // Don't update onlineUsers state here - wait for room_users broadcast
        // The backend will broadcast room_users with all users (including offline ones)
        // Just mark user as offline in statuses for tracking
        setUserStatuses(prev => ({ ...prev, [user.id]: false }));
      },
      onMessage: handleMessage,
      onChatHistory: (messages) => {
        setMessages(messages); // Replace messages, don't append
        // Mark all loaded messages as read (they're old messages)
        if (messages.length > 0) {
          const lastMessageTime = new Date(messages[messages.length - 1].timestamp).getTime();
          lastReadTimestampRef.current = Math.max(lastReadTimestampRef.current, lastMessageTime);
        }
        // Reset unread count when loading history (these are old messages)
        setUnreadMessageCount(0);
      },
      onRoomUsers: (users) => {
        // Default isOnline to false if missing
        const usersWithStatus = (users || []).map(user => ({
          ...user,
          isOnline: user.isOnline !== undefined ? user.isOnline : false
        }));
        
        setOnlineUsers(usersWithStatus);
        
        // Update user statuses based on the received users
        const newUserStatuses: { [userId: string]: boolean } = {};
        usersWithStatus.forEach(user => {
          newUserStatuses[user.id] = user.isOnline || false;
        });
        setUserStatuses(newUserStatuses);
        
      },
      onTypingChange: (userId, typing) => {
        setIsTyping(prev => ({ ...prev, [userId]: typing }));
      },
      onError: (error) => {
        setLastError(error);
        console.error('Collaboration error:', error);
      }
    });

    const currentMessages = collaborationService.getMessages();
    const currentUsers = collaborationService.getOnlineUsers();
    const currentConnection = collaborationService.isConnected();
    
    
    setMessages(currentMessages);
    setOnlineUsers(currentUsers);
    setIsConnected(currentConnection);

    return () => {
      collaborationService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      setHasNewMessages(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible && isConnected) {
    }
  }, [isVisible, isConnected]);

  // Auto-join room when tripId is provided (only once)
  useEffect(() => {
    if (tripId && tripId !== 'default-trip') {
      
      // Get current user info
      const currentUser = getCurrentUser();
      if (currentUser) {
        const userId = currentUser.id;
        const userName = currentUser.name || currentUser.email;
        
        
        const isRoomCreator = localStorage.getItem('room-creator') === userId;
        
        // Only join if not already in this room
        const currentTripId = collaborationService.getCurrentTripId();
        if (currentTripId !== tripId) {
          collaborationService.joinRoom(tripId, userId, userName, isRoomCreator);
        } else {
        }
        
        // Update roomCreator state from localStorage
        setRoomCreator(localStorage.getItem('room-creator'));
        
        // Mark current user as online
        setUserStatuses(prev => ({ ...prev, [userId]: true }));
        
        // Check connection status after a delay
        setTimeout(() => {
        }, 2000);
      } else {
        console.warn('No user found for auto-join');
      }
    }
  }, [tripId]);

  // Debug component lifecycle
  useEffect(() => {
    
    return () => {
    };
  }, [tripId, isVisible]);

  // Listen for localStorage changes to update roomCreator state
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'room-creator') {
        setRoomCreator(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for showChatbox event from header
  useEffect(() => {
    const handleShowChatbox = () => {
      // Force the chatbox to be visible
      if (typeof onToggle === 'function') {
        // If onToggle is provided, we need to communicate with parent
        // For now, we'll just log that we received the event
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
      
      if (isConnected) {
        // Send via WebSocket if connected
        collaborationService.sendChatMessage(newMessage.trim());
      } else {
        // Add message locally for testing (offline mode)
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
              const currentUser = getCurrentUser();
              if (currentUser && tripId) {
                // Force rejoin to refresh user list and messages
                collaborationService.disconnect();
                setTimeout(() => {
                  const isRoomCreator = localStorage.getItem('room-creator') === currentUser.id;
                  collaborationService.joinRoom(tripId, currentUser.id, currentUser.name || currentUser.email, isRoomCreator);
                }, 1000);
              }
            }}
            className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            title="Refresh room data"
          >
            Refresh
          </button>

          {/* Invite Button */}
          <button
            onClick={() => setShowInvite(true)}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowInvite(true);
            }}
            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors touch-manipulation"
            style={{ touchAction: 'manipulation' }}
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
                const currentUser = getCurrentUser();
                if (currentUser && tripId) {
                  
                  // Determine if user is room creator
                  const isRoomCreator = localStorage.getItem('room-creator') === currentUser.id;
                  
                  // Force reconnection with room info
                  collaborationService.forceReconnect(
                    tripId,
                    currentUser.id,
                    currentUser.name || currentUser.email,
                    isRoomCreator
                  );
                  
                  // Check connection status after delay
                  setTimeout(() => {
                    const status = collaborationService.getConnectionStatus();
                    // Force update connection state if needed
                    if (status.isConnected && !isConnected) {
                      setIsConnected(true);
                    }
                    
                    // Mark current user as online
                    setUserStatuses(prev => ({ ...prev, [currentUser.id]: true }));
                  }, 3000);
                } else {
                  console.warn('Cannot reconnect - no user or room ID');
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Trigger the same logic as onClick
                const currentUser = getCurrentUser();
                if (currentUser && tripId) {
                  const isRoomCreator = localStorage.getItem('room-creator') === currentUser.id;
                  collaborationService.forceReconnect(
                    tripId,
                    currentUser.id,
                    currentUser.name || currentUser.email,
                    isRoomCreator
                  );
                }
              }}
              className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors touch-manipulation"
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
                  collaborationService.testConnection().then(success => {
                    alert(success ? 'Connection test passed!' : 'Connection test failed - check console for details');
                  });
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
                  const currentUser = getCurrentUser();
                  if (currentUser && tripId) {
                    const isRoomCreator = localStorage.getItem('room-creator') === currentUser.id;
                    collaborationService.forceReconnect(
                      tripId,
                      currentUser.id,
                      currentUser.name || currentUser.email,
                      isRoomCreator
                    );
                  } else {
                    collaborationService.forceReconnect();
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const currentUser = getCurrentUser();
                  if (currentUser && tripId) {
                    const isRoomCreator = localStorage.getItem('room-creator') === currentUser.id;
                    collaborationService.forceReconnect(
                      tripId,
                      currentUser.id,
                      currentUser.name || currentUser.email,
                      isRoomCreator
                    );
                  } else {
                    collaborationService.forceReconnect();
                  }
                }}
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Force Reconnect
              </button>
              <button
                onClick={() => {
                  collaborationService.manualConnect();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
                  alert(`Connection Status:\nWebSocket: ${status.wsStateName}\nConnected: ${status.isConnected}\nTrip ID: ${status.currentTripId}\nUsers: ${status.onlineUsers}\nMessages: ${status.messages}\nError: ${status.lastError || 'None'}`);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
              ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span>Chat ({messages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
            activeTab === 'users'
              ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                  console.warn('Invalid user in list');
                  return null;
                }
                return (
                  <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center space-x-2">
                        <span>{user.name || 'Unknown User'}</span>
                        {user.isCreator && (
                          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
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
                  <div className="text-xl mb-2 font-bold text-gray-400">No Users</div>
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
