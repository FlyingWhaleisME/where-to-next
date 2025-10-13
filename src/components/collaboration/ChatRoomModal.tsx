import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import collaborationService from '../../services/collaborationService';
import { getCurrentUser } from '../../services/apiService';

interface ChatRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CollaborationRoomSettings {
  roomName: string;
  maxUsers: number;
  shareCode: string;
}

const ChatRoomModal: React.FC<ChatRoomModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  
  // Create room state
  const [createSettings, setCreateSettings] = useState<CollaborationRoomSettings>({
    roomName: 'My Trip Room',
    maxUsers: 10,
    shareCode: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // Join room state
  const [joinShareCode, setJoinShareCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!createSettings.roomName.trim()) {
      setError('Room name is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Generate share code if not provided
      const shareCode = createSettings.shareCode || generateShareCode();
      
      // Create room ID using the same share code
      const roomId = `room-${shareCode}`;
      
      // Store room info in localStorage
      localStorage.setItem('current-room-id', roomId);
      localStorage.setItem('room-creator', getCurrentUser()?.id || '');
      
      // Join the room as creator
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not logged in');
      }
      await collaborationService.joinRoom(roomId, currentUser.id, currentUser.name, true);
      
      console.log('✅ [DEBUG] ChatRoomModal: Room created successfully:', roomId);
      
      // Dispatch room created event for Header to update chat button
      window.dispatchEvent(new CustomEvent('roomCreated', {
        detail: { roomId, isCreator: true }
      }));
      
      // Close modal and show chatbox
      onClose();
      window.dispatchEvent(new CustomEvent('showChatbox'));
      
    } catch (error) {
      console.error('❌ [DEBUG] ChatRoomModal: Error creating room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinShareCode.trim()) {
      setError('Please enter a share code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Create room ID using the share code format
      const roomId = `room-${joinShareCode.toUpperCase()}`;
      
      // Store room info in localStorage
      localStorage.setItem('current-room-id', roomId);
      
      // Join the room as participant
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not logged in');
      }
      await collaborationService.joinRoom(roomId, currentUser.id, currentUser.name, false);
      
      console.log('✅ [DEBUG] ChatRoomModal: Room joined successfully:', roomId);
      
      // Dispatch room joined event for Header to update chat button
      window.dispatchEvent(new CustomEvent('roomJoined', {
        detail: { roomId, isCreator: false }
      }));
      
      // Close modal and show chatbox
      onClose();
      window.dispatchEvent(new CustomEvent('showChatbox'));
      
    } catch (error) {
      console.error('❌ [DEBUG] ChatRoomModal: Error joining room:', error);
      setError('Failed to join room. Please check the share code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl transition-colors z-50 pointer-events-auto"
              style={{ zIndex: 10001 }}
            >
              ✕
            </button>

            {/* Header with Gradient */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl -mx-6 -mt-6 h-24 opacity-80"></div>
              <h2 className="relative text-3xl font-bold text-white text-center pt-6 pb-4 z-10">
                🤝 Start Collaborating
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`flex-1 py-3 text-center font-medium text-lg transition-colors ${
                  activeTab === 'create'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('create')}
              >
                Create Room
              </button>
              <button
                className={`flex-1 py-3 text-center font-medium text-lg transition-colors ${
                  activeTab === 'join'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('join')}
              >
                Join Room
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'create' && (
                <motion.div
                  key="create-room"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Create a New Collaboration Room</h3>
                  <p className="text-gray-600 mb-6">
                    Set up your room preferences and invite others to plan together in real-time.
                  </p>
                  
                  {/* Room Settings Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Name
                      </label>
                      <input
                        type="text"
                        value={createSettings.roomName}
                        onChange={(e) => setCreateSettings(prev => ({ ...prev, roomName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter room name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Users
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="20"
                        value={createSettings.maxUsers}
                        onChange={(e) => setCreateSettings(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating || !createSettings.roomName.trim()}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Room...</span>
                      </>
                    ) : (
                      <span>Create Room</span>
                    )}
                  </button>
                </motion.div>
              )}

              {activeTab === 'join' && (
                <motion.div
                  key="join-room"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Join an Existing Collaboration Room</h3>
                  <p className="text-gray-600 mb-6">
                    Enter a share code to join a friend's room and start planning.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Share Code
                      </label>
                      <input
                        type="text"
                        value={joinShareCode}
                        onChange={(e) => setJoinShareCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                        placeholder="Enter share code"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleJoinRoom}
                    disabled={isJoining || !joinShareCode.trim()}
                    className="w-full mt-6 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Joining Room...</span>
                      </>
                    ) : (
                      <span>Join Room</span>
                    )}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Features Showcase */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">What you get:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 text-sm">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">💬</span> Real-time Chat
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">👥</span> User Management
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">📝</span> Shared Planning
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">🚀</span> Seamless Collaboration
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ChatRoomModal;