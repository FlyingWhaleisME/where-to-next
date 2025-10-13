import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import collaborationService, { CollaborationUser, CollaborationMessage } from '../../services/collaborationService';

interface CollaborationPanelProps {
  tripId: string;
  isVisible: boolean;
  onToggle: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ tripId, isVisible, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<CollaborationUser[]>([]);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({});
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    // Set up collaboration callbacks
    collaborationService.setCallbacks({
      onConnectionChange: setIsConnected,
      onUserJoined: (user) => {
        setOnlineUsers(prev => {
          if (!prev.find(u => u.id === user.id)) {
            return [...prev, user];
          }
          return prev;
        });
      },
      onUserLeft: (user) => {
        setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
      },
      onMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      onTypingChange: (userId, typing) => {
        setIsTyping(prev => ({
          ...prev,
          [userId]: typing
        }));
      },
      onError: setLastError
    });

    // Join the trip
    // Note: joinTrip is deprecated, use joinRoom instead
    // collaborationService.joinRoom(tripId, userId, userName, false);

    // Cleanup on unmount
    return () => {
      collaborationService.disconnect();
    };
  }, [tripId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected) {
      collaborationService.sendChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (e.target.value.trim()) {
      collaborationService.setTyping(true);
    } else {
      collaborationService.setTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypingUsers = () => {
    return onlineUsers.filter(user => isTyping[user.id]);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <h3 className="text-lg font-semibold text-gray-800">Collaboration</h3>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="p-3 bg-yellow-50 border-b border-yellow-200">
              <p className="text-sm text-yellow-800">
                {lastError || 'Connecting to collaboration server...'}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💬 Chat ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👥 Users ({onlineUsers.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'chat' ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-800">
                            {message.user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-800">
                          {message.text}
                        </div>
                      </motion.div>
                    ))
                  )}

                  {/* Typing indicator */}
                  {getTypingUsers().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2 text-sm text-gray-500"
                    >
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span>
                        {getTypingUsers().map(u => u.name).join(', ')} {getTypingUsers().length === 1 ? 'is' : 'are'} typing...
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder={isConnected ? "Type a message..." : "Connecting..."}
                      disabled={!isConnected}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={!isConnected || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Users Tab */
              <div className="flex-1 overflow-y-auto p-4">
                {onlineUsers.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <p>No other users online</p>
                    <p className="text-sm">Invite others to collaborate!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {onlineUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {isTyping[user.id] && (
                            <span className="text-xs text-gray-500">typing...</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CollaborationPanel;
