import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

interface CollaborationInviteProps {
  isVisible: boolean;
  onClose: () => void;
  shareCode: string;
  roomName: string;
}

const CollaborationInvite: React.FC<CollaborationInviteProps> = ({
  isVisible,
  onClose,
  shareCode,
  roomName
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaEmail = () => {
    const subject = `Join my trip planning room: ${roomName}`;
    const body = `Hi! I'd like to invite you to collaborate on my trip planning.\n\nRoom: ${roomName}\nShare Code: ${shareCode}\n\nTo join:\n1. Go to the website\n2. Click "Join Room"\n3. Enter the share code: ${shareCode}\n\nLet's plan this trip together!`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
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
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📤 Invite Others
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Room Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {roomName}
            </h3>
            <p className="text-gray-600">
              Share this code with others to let them join your communication room
            </p>
          </div>

          {/* Share Code */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Code
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={shareCode}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-lg text-center"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Share via:</h4>
            
            <button
              onClick={shareViaEmail}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>📧</span>
              <span>Email</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>📋</span>
              <span>Copy Code</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">How to join:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Go to the website</li>
              <li>2. Click "Join Room" button</li>
              <li>3. Enter the share code: <strong>{shareCode}</strong></li>
              <li>4. Start collaborating!</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default CollaborationInvite;