import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

interface CollaborationRoomSettings {
  roomType: 'private' | 'public' | 'invite-only';
  roomName: string;
  allowAnonymous: boolean;
  requireApproval: boolean;
  maxUsers: number;
  shareCode: string;
}

interface CollaborationSettingsProps {
  isVisible: boolean;
  onClose: () => void;
  onSettingsChange: (settings: CollaborationRoomSettings) => void;
  currentSettings: CollaborationRoomSettings;
}

const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({
  isVisible,
  onClose,
  onSettingsChange,
  currentSettings
}) => {
  const [settings, setSettings] = useState<CollaborationRoomSettings>(currentSettings);

  // Auto-generate share code when modal opens if none exists
  React.useEffect(() => {
    if (isVisible && !settings.shareCode) {
      generateShareCode();
    }
  }, [isVisible]);

  const handleSave = () => {
    console.log('💾 [DEBUG] Saving collaboration settings:', settings);
    console.log('💾 [DEBUG] onSettingsChange callback:', typeof onSettingsChange);
    
    if (!settings.shareCode) {
      console.warn('❌ [DEBUG] No share code generated, generating one now');
      generateShareCode();
      return;
    }
    
    try {
      onSettingsChange(settings);
      onClose();
    } catch (error) {
      console.error('❌ [DEBUG] Error saving settings:', error);
    }
  };

  const generateShareCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSettings(prev => ({ ...prev, shareCode: code }));
  };

  if (!isVisible) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🔧 Communication Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type
            </label>
            <select
              value={settings.roomType}
              onChange={(e) => setSettings(prev => ({ ...prev, roomType: e.target.value as 'private' | 'public' | 'invite-only' }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="invite-only">Invite Only</option>
            </select>
          </div>

          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={settings.roomName}
              onChange={(e) => setSettings(prev => ({ ...prev, roomName: e.target.value }))}
              placeholder="My Trip Planning Room"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Allow Anonymous */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowAnonymous"
              checked={settings.allowAnonymous}
              onChange={(e) => setSettings(prev => ({ ...prev, allowAnonymous: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowAnonymous" className="ml-2 block text-sm text-gray-700">
              Allow anonymous users to join
            </label>
          </div>

          {/* Require Approval */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireApproval"
              checked={settings.requireApproval}
              onChange={(e) => setSettings(prev => ({ ...prev, requireApproval: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-700">
              Require approval for new members
            </label>
          </div>

          {/* Max Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Users
            </label>
            <input
              type="number"
              value={settings.maxUsers}
              onChange={(e) => setSettings(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 2 }))}
              min="2"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              How many people can join this room? (2-100)
            </p>
          </div>

          {/* Share Code */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800">Share Code</h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={settings.shareCode}
                onChange={(e) => setSettings(prev => ({ ...prev, shareCode: e.target.value.toUpperCase() }))}
                placeholder="Share Code"
                maxLength={8}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center"
              />
              <button
                onClick={generateShareCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate
              </button>
            </div>
            
            <p className="text-sm text-blue-700">
              Share this code with others to let them join your room. They can enter it on the website to join.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">How it works:</h4>
            <ol className="text-sm text-green-700 space-y-1">
              <li>1. Set up your room name and preferences</li>
              <li>2. Generate a share code</li>
              <li>3. Share the code with friends</li>
              <li>4. Friends use "Join Room" button to enter the code</li>
              <li>5. Everyone collaborates in real-time!</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Room
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default CollaborationSettings;