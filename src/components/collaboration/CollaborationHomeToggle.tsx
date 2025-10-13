import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import collaborationService from '../../services/collaborationService';
import { getCurrentUser } from '../../services/apiService';
import CollaborationSettings from './CollaborationSettings';
import CollaborationInvite from './CollaborationInvite';
import JoinRoomModal from './JoinRoomModal';
// DraggableCollaborationPanel is now handled globally in App.tsx

interface CollaborationRoomSettings {
  roomType: 'private' | 'public' | 'invite-only';
  roomName: string;
  allowAnonymous: boolean;
  requireApproval: boolean;
  maxUsers: number;
  shareCode: string;
}

const CollaborationHomeToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Restore collaboration state from localStorage
    const savedRoomId = localStorage.getItem('current-room-id');
    const token = localStorage.getItem('token');
    return !!(savedRoomId && token);
  });
  const [isConnected, setIsConnected] = useState(false);
  // showPanel is now handled globally in App.tsx
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [collaborationSettings, setCollaborationSettings] = useState<CollaborationRoomSettings>({
    roomType: 'invite-only',
    roomName: 'My Trip Planning Room',
    allowAnonymous: false,
    requireApproval: false,
    maxUsers: 5,
    shareCode: ''
  });

  useEffect(() => {
    // Set up collaboration callbacks
    collaborationService.setCallbacks({
      onConnectionChange: setIsConnected,
      onUserJoined: (user) => {
        console.log('👥 [DEBUG] User joined:', user.name);
        // Don't increment here - let the room_users message handle the count
      },
      onUserLeft: (user) => {
        console.log('👥 [DEBUG] User left:', user.name);
        setOnlineUsers(prev => Math.max(0, prev - 1));
      },
      onRoomUsers: (users) => {
        console.log('👥 [DEBUG] Received room users:', users);
        setOnlineUsers(users.length);
      },
      onMessage: (message) => {
        console.log('New message:', message.text);
      },
      onError: (error) => {
        console.error('Collaboration error:', error);
      }
    });

    // Listen for logout (token removal from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // User logged out - disable collaboration
        console.log('User logged out - disabling collaboration (storage event)');
        disableCollaboration();
      }
    };

    // Listen for logout (same tab)
    const handleUserLogout = () => {
      console.log('User logged out - disabling collaboration (custom event)');
      disableCollaboration();
    };

    const disableCollaboration = () => {
      setIsEnabled(false);
      setIsConnected(false);
      // Panel visibility is now handled globally in App.tsx
      setShowSettings(false);
      setShowInvite(false);
      setShowJoinRoom(false);
      collaborationService.disconnect();
      
      // Clear room data
      localStorage.removeItem('current-room-id');
      localStorage.removeItem('room-creator');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogout', handleUserLogout);
    
    // Also check if token exists on mount
    const token = localStorage.getItem('token');
    if (!token) {
      setIsEnabled(false);
      setIsConnected(false);
    }

    // Periodic check to ensure authentication state is in sync
    const checkAuthStatus = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken && isEnabled) {
        console.log('Token removed - disabling collaboration');
        disableCollaboration();
      }
    };

    // Auto-reconnect ONCE on mount if we have a saved room ID
    const autoReconnect = () => {
      const savedRoomId = localStorage.getItem('current-room-id');
      const token = localStorage.getItem('token');
      const connectionStatus = collaborationService.getConnectionStatus();
      
      // Only reconnect if:
      // 1. We have a saved room
      // 2. User is authenticated
      // 3. NOT already connected or connecting
      if (savedRoomId && token && !connectionStatus.isConnected && connectionStatus.wsState !== 0 /* CONNECTING */) {
        console.log('🔄 [DEBUG] Auto-reconnecting to room on mount:', savedRoomId);
        const currentUser = getCurrentUser();
        if (currentUser) {
          const isRoomCreator = localStorage.getItem('room-creator') === currentUser.id;
          collaborationService.joinRoom(savedRoomId, currentUser.id, currentUser.name || currentUser.email, isRoomCreator);
        }
      }
    };

    // Run auto-reconnect ONCE on mount
    autoReconnect();

    // Check auth status periodically (less frequently)
    const authCheckInterval = setInterval(checkAuthStatus, 10000); // Check every 10 seconds

    // Listen for showChatbox event from header
    const handleShowChatbox = () => {
      console.log('🔍 [DEBUG] CollaborationHomeToggle: Received showChatbox event');
      console.log('🔍 [DEBUG] CollaborationHomeToggle: Current isEnabled state:', isEnabled);
      
      // Only show panel if collaboration is enabled
      if (isEnabled) {
        console.log('🔍 [DEBUG] CollaborationHomeToggle: Dispatching showChatbox event for global handler');
        // Dispatch the event again so App.tsx can handle it
        window.dispatchEvent(new CustomEvent('showChatbox'));
      } else {
        console.log('🔍 [DEBUG] CollaborationHomeToggle: Collaboration not enabled, cannot show panel');
      }
    };

    // Listen for showCollaborationSettings event from header
    const handleShowCollaborationSettings = () => {
      console.log('🔍 [DEBUG] CollaborationHomeToggle: Received showCollaborationSettings event');
      // Show the settings modal to start communication
      setShowSettings(true);
    };

    window.addEventListener('showChatbox', handleShowChatbox);
    window.addEventListener('showCollaborationSettings', handleShowCollaborationSettings);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userLogout', handleUserLogout);
        window.removeEventListener('showChatbox', handleShowChatbox);
        window.removeEventListener('showCollaborationSettings', handleShowCollaborationSettings);
        clearInterval(authCheckInterval);
    };
}, [isConnected]); // Changed dependency to isConnected to prevent excessive re-runs

  const handleToggle = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Cannot enable collaboration: User not authenticated');
      alert('Please login to use collaboration features');
      return;
    }

    if (!isEnabled) {
      // Enable collaboration
      setIsEnabled(true);
      setShowSettings(true);
    } else {
      // Disable collaboration
      setIsEnabled(false);
      collaborationService.disconnect();
      // Panel visibility is now handled globally in App.tsx
      setShowSettings(false);
      setShowInvite(false);
      setShowJoinRoom(false);
    }
  };

  const handleShowPanel = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Cannot open chat: User not authenticated');
      alert('Please login to use collaboration features');
      return;
    }

    // Just toggle the panel - room should already be created from settings
    console.log('Chat button clicked. isEnabled:', isEnabled);
    console.log('collaborationSettings:', collaborationSettings);
    
    // Dispatch event to show global chatbox
    console.log('Dispatching showChatbox event for global handler');
    window.dispatchEvent(new CustomEvent('showChatbox'));
  };

  const handleJoinRoom = (roomId: string, shareCode?: string) => {
    // Get current user info
    const currentUser = getCurrentUser();
    const userId = currentUser?.id || 'anonymous';
    const userName = currentUser?.name || currentUser?.email || 'Anonymous User';
    
    // Save room ID for global chatbox
    localStorage.setItem('current-room-id', roomId);
    
    // Dispatch event to notify header
    window.dispatchEvent(new CustomEvent('roomJoined', { detail: { roomId, userId } }));
    
    // Join the specified room
    collaborationService.joinRoom(roomId, userId, userName, false);
    setIsEnabled(true);
    setIsConnected(true);
    console.log('Joining room:', roomId, 'with code:', shareCode);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    // Don't disconnect if user just closes settings - they might want to keep collaboration active
    console.log('🔧 [DEBUG] Settings closed without saving - keeping collaboration state intact');
  };

  const handleSettingsSave = (newSettings: CollaborationRoomSettings) => {
    console.log('💾 [DEBUG] handleSettingsSave called with:', newSettings);
    
    setCollaborationSettings(newSettings);
    setShowSettings(false);
    
    // Create and join the room when settings are saved
    if (newSettings.shareCode) {
      const roomId = `room-${newSettings.shareCode}`;
      console.log('💾 [DEBUG] Creating room:', roomId, 'with settings:', newSettings);
      
      // Get current user info
      const currentUser = getCurrentUser();
      const userId = currentUser?.id || 'anonymous';
      const userName = currentUser?.name || currentUser?.email || 'Anonymous User';
      
      console.log('💾 [DEBUG] User info:', { userId, userName });
      
      // Enable collaboration first (this shows the green button)
      setIsEnabled(true);
      
      // Track room creator and current room
      localStorage.setItem('room-creator', userId);
      localStorage.setItem('current-room-id', roomId);
      
      // Dispatch event to notify header
      window.dispatchEvent(new CustomEvent('roomCreated', { detail: { roomId, userId } }));
      
      console.log('💾 [DEBUG] Saved to localStorage:', {
        'room-creator': userId,
        'current-room-id': roomId
      });
      
      // Try to join the room (service auto-connects)
      try {
        collaborationService.joinRoom(roomId, userId, userName, true);
        console.log('💾 [DEBUG] Successfully initiated room join');
        // Don't set isConnected to true here - let the service handle it
      } catch (error) {
        console.error('❌ [DEBUG] Failed to join room:', error);
        // Keep isEnabled true so user can see the green button and try again
      }
    } else {
      console.warn('❌ [DEBUG] No share code in settings:', newSettings);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
      {/* Main Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base ${
          isEnabled
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <span>{isEnabled ? '🔗' : '🔌'}</span>
        <span className="hidden sm:inline">{isEnabled ? 'Communicating' : 'Start Communication'}</span>
        <span className="sm:hidden">{isEnabled ? 'On' : 'Start'}</span>
      </motion.button>


      {/* Join Room Button - Always visible when not enabled */}
      {!isEnabled && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowJoinRoom(true)}
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 text-sm sm:text-base"
        >
          <span>🚪</span>
          <span>Join Room</span>
        </motion.button>
      )}

      {/* Settings Button */}
      {isEnabled && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(true)}
          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          title="Communication settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      )}


      {/* Chat Button */}
      {isEnabled && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShowPanel}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Open communication panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </motion.button>
      )}

      {/* Tooltip */}
      <div className="relative group">
        <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {isEnabled 
            ? 'Real-time communication enabled. Click chat to collaborate with others.' 
            : 'Enable real-time communication to work with others on this trip.'
          }
        </div>
      </div>

      {/* Settings Modal */}
      <CollaborationSettings
        isVisible={showSettings}
        onClose={handleSettingsClose}
        onSettingsChange={handleSettingsSave}
        currentSettings={collaborationSettings}
      />

      {/* Invite Modal */}
      <CollaborationInvite
        isVisible={showInvite}
        onClose={() => setShowInvite(false)}
        shareCode={collaborationSettings.shareCode}
        roomName={collaborationSettings.roomName}
      />

      {/* Join Room Modal */}
      <JoinRoomModal
        isVisible={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        onJoinRoom={handleJoinRoom}
      />

      {/* Note: DraggableCollaborationPanel is now handled globally in App.tsx */}
    </div>
  );
};

export default CollaborationHomeToggle;