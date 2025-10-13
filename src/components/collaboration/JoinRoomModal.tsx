import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

interface JoinRoomModalProps {
  isVisible: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string, shareCode?: string) => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isVisible,
  onClose,
  onJoinRoom
}) => {
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinByCode = async () => {
    if (!shareCode.trim()) {
      setError('Please enter a share code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate network delay and potential failure
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if backend is available
      const { healthApi } = await import('../../services/apiService');
      const healthCheck = await healthApi.test();
      
      if (!healthCheck.data) {
        throw new Error('Backend connection failed. Please check your internet connection and try again.');
      }

      onJoinRoom(`room-${shareCode.toUpperCase()}`, shareCode.toUpperCase());
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            🚪 Join Communication Room
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Instructions */}
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
              Enter Share Code
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Ask your friend for the share code to join their communication room
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Share Code Input */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Code
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={shareCode}
                onChange={(e) => {
                  setShareCode(e.target.value.toUpperCase());
                  setError(''); // Clear error when user types
                }}
                placeholder="Enter share code (e.g., TOKYO1)"
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-base sm:text-lg"
                maxLength={8}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* How to get code */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">How to get a share code:</h4>
            <ol className="text-xs sm:text-sm text-blue-700 space-y-1">
              <li>1. Ask your friend to create a communication room</li>
              <li>2. They'll get a share code (like "TOKYO1")</li>
              <li>3. They share the code with you</li>
              <li>4. Enter it here to join!</li>
            </ol>
          </div>

          {/* Example */}
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-green-800 mb-2 text-sm sm:text-base">Example:</h4>
            <p className="text-xs sm:text-sm text-green-700">
              Your friend: "Hey! I created a room for our Tokyo trip. 
              Join code: <strong>TOKYO1</strong>"
            </p>
            <p className="text-xs sm:text-sm text-green-700 mt-1">
              You: Enter "TOKYO1" in the box above and click "Join Room"
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleJoinByCode}
            disabled={!shareCode.trim() || isLoading}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Joining...</span>
              </>
            ) : (
              <span>Join Room</span>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default JoinRoomModal;