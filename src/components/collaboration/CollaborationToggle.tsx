import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import collaborationService from '../../services/collaborationService';
import CollaborationSettings from './CollaborationSettings';
import CollaborationInvite from './CollaborationInvite';

interface CollaborationRoomSettings {
  roomType: 'private' | 'public' | 'invite-only';
  roomName: string;
  allowAnonymous: boolean;
  requireApproval: boolean;
  maxUsers: number;
  shareCode: string;
}

interface CollaborationToggleProps {
  tripId: string;
  onCollaborationChange?: (isEnabled: boolean) => void;
}

const CollaborationToggle: React.FC<CollaborationToggleProps> = ({ tripId, onCollaborationChange }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [collaborationSettings, setCollaborationSettings] = useState<CollaborationRoomSettings>({
    roomType: 'private',
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
      onUserJoined: () => {
        setOnlineUsers(prev => prev + 1);
      },
      onUserLeft: () => {
        setOnlineUsers(prev => Math.max(0, prev - 1));
      }
    });

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsEnabled(true);
      onCollaborationChange?.(true);
    }
  }, [onCollaborationChange]);

  const handleToggle = () => {
    if (!isEnabled) {
      // Enable collaboration
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to use collaboration features');
        return;
      }
      setIsEnabled(true);
      onCollaborationChange?.(true);
    } else {
      // Disable collaboration
      collaborationService.disconnect();
      setIsEnabled(false);
      setShowPanel(false);
      onCollaborationChange?.(false);
    }
  };

  const handleShowPanel = () => {
    if (isEnabled && isConnected) {
      setShowPanel(true);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isEnabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </motion.button>

      {/* Status Indicator */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${
          isEnabled 
            ? (isConnected ? 'bg-green-500' : 'bg-yellow-500') 
            : 'bg-gray-400'
        }`}></div>
        <span className="text-xs text-gray-600">
          {isEnabled 
            ? (isConnected ? 'Connected' : 'Connecting...') 
            : 'Offline'
          }
        </span>
      </div>

      {/* Online Users Count */}
      {isEnabled && isConnected && onlineUsers > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
        >
          <span>👥</span>
          <span>{onlineUsers}</span>
        </motion.div>
      )}

      {/* Settings Button */}
      {isEnabled && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(true)}
          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          title="Collaboration settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      )}

      {/* Invite Button */}
      {isEnabled && isConnected && collaborationSettings.roomType === 'invite-only' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInvite(true)}
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          title="Invite others"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      )}

      {/* Chat Button */}
      {isEnabled && isConnected && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShowPanel}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Open collaboration panel"
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
            ? 'Real-time collaboration enabled. Click chat to collaborate with others.' 
            : 'Enable real-time collaboration to work with others on this trip.'
          }
        </div>
      </div>

      {/* Settings Modal */}
      <CollaborationSettings
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={(settings) => setCollaborationSettings(settings)}
        currentSettings={collaborationSettings}
      />

      {/* Invite Modal */}
      <CollaborationInvite
        isVisible={showInvite}
        onClose={() => setShowInvite(false)}
        shareCode={collaborationSettings.shareCode}
        roomName={collaborationSettings.roomName}
      />
    </div>
  );
};

export default CollaborationToggle;
