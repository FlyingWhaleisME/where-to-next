import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GeneratedPrompt } from '../types';

interface AIPromptDisplayProps {
  prompt: GeneratedPrompt;
  onClose: () => void;
  onBackToSurvey?: () => void;
  showBackToSurvey?: boolean;
}

const AIPromptDisplay: React.FC<AIPromptDisplayProps> = ({ prompt, onClose, onBackToSurvey, showBackToSurvey }) => {
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [isEditingLegacyPrompt, setIsEditingLegacyPrompt] = useState(false);
  const [originalPreferencesPrompt] = useState(prompt.preferencesPrompt || '');
  const [originalDestinationPrompt] = useState(prompt.destinationPrompt || '');
  const [originalLegacyPrompt] = useState(prompt.prompt || '');
  const [editedPreferencesPrompt, setEditedPreferencesPrompt] = useState(prompt.preferencesPrompt || '');
  const [editedDestinationPrompt, setEditedDestinationPrompt] = useState(prompt.destinationPrompt || '');
  const [editedLegacyPrompt, setEditedLegacyPrompt] = useState(prompt.prompt || '');
  const [showCopiedPreferences, setShowCopiedPreferences] = useState(false);
  const [showCopiedDestination, setShowCopiedDestination] = useState(false);
  const [showCopiedLegacy, setShowCopiedLegacy] = useState(false);

  const handleCopyPreferencesPrompt = async () => {
    try {
      await navigator.clipboard.writeText(editedPreferencesPrompt);
      setShowCopiedPreferences(true);
      setTimeout(() => setShowCopiedPreferences(false), 2000);
    } catch (err) {
      console.error('Failed to copy preferences prompt:', err);
    }
  };

  const handleCopyDestinationPrompt = async () => {
    try {
      await navigator.clipboard.writeText(editedDestinationPrompt);
      setShowCopiedDestination(true);
      setTimeout(() => setShowCopiedDestination(false), 2000);
    } catch (err) {
      console.error('Failed to copy destination prompt:', err);
    }
  };

  const handleSavePreferencesChanges = () => {
    if (prompt.preferencesPrompt) {
      prompt.preferencesPrompt = editedPreferencesPrompt;
    }
    setIsEditingPreferences(false);
  };

  const handleSaveDestinationChanges = () => {
    if (prompt.destinationPrompt) {
      prompt.destinationPrompt = editedDestinationPrompt;
    }
    setIsEditingDestination(false);
  };

  const handleResetPreferences = () => {
    setEditedPreferencesPrompt(originalPreferencesPrompt);
    setIsEditingPreferences(false);
  };

  const handleResetDestination = () => {
    setEditedDestinationPrompt(originalDestinationPrompt);
    setIsEditingDestination(false);
  };

  const handleResetLegacyPrompt = () => {
    setEditedLegacyPrompt(originalLegacyPrompt);
    setIsEditingLegacyPrompt(false);
  };

  const handleSaveLegacyPrompt = () => {
    if (prompt.prompt) {
      prompt.prompt = editedLegacyPrompt;
    }
    setIsEditingLegacyPrompt(false);
  };

  const handleCopyLegacyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(editedLegacyPrompt);
      setShowCopiedLegacy(true);
      setTimeout(() => setShowCopiedLegacy(false), 2000);
    } catch (err) {
      console.error('Failed to copy legacy prompt:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{prompt.title}</h2>
              <p className="text-emerald-100 mt-2">{prompt.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Tips Section */}
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-emerald-800 mb-3">Pro Tips</h3>
            <ul className="space-y-2">
              {prompt.tips.map((tip, index) => (
                <li key={index} className="text-emerald-700 flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Tools Links */}
          <div className="bg-rose-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-rose-700 mb-3">🤖 Popular AI Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {prompt.links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow text-rose-600 hover:text-rose-700"
                >
                  {link.includes('openai') ? 'ChatGPT' : 
                   link.includes('claude') ? 'Claude' : 
                   link.includes('gemini') ? 'Gemini' : 'AI Tool'}
                </a>
              ))}
            </div>
          </div>

          {/* Preferences Prompt Section */}
          {prompt.preferencesPrompt && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Step 1: Preferences Prompt</h3>
                <div className="flex space-x-2">
                  {isEditingPreferences ? (
                    <>
                      <button
                        onClick={handleSavePreferencesChanges}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleResetPreferences}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Reset
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingPreferences(true)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Edit Prompt
                    </button>
                  )}
                  <button
                    onClick={handleCopyPreferencesPrompt}
                    className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-500 transition-colors relative"
                  >
                    {showCopiedPreferences ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
              </div>
              
              {isEditingPreferences ? (
                <textarea
                  value={editedPreferencesPrompt}
                  onChange={(e) => setEditedPreferencesPrompt(e.target.value)}
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm"
                  placeholder="Edit your preferences prompt here..."
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {editedPreferencesPrompt}
                  </pre>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Copy this prompt first to establish context with your AI assistant
              </p>
            </div>
          )}

          {/* Destination Prompt Section */}
          {prompt.destinationPrompt && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Step 2: Destination Prompt</h3>
                <div className="flex space-x-2">
                  {isEditingDestination ? (
                    <>
                      <button
                        onClick={handleSaveDestinationChanges}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleResetDestination}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Reset
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingDestination(true)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Edit Prompt
                    </button>
                  )}
                  <button
                    onClick={handleCopyDestinationPrompt}
                    className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-500 transition-colors relative"
                  >
                    {showCopiedDestination ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
              </div>
              
              {isEditingDestination ? (
                <textarea
                  value={editedDestinationPrompt}
                  onChange={(e) => setEditedDestinationPrompt(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm"
                  placeholder="Edit your destination prompt here..."
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {editedDestinationPrompt}
                  </pre>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Copy this prompt after the preferences prompt for destination-specific information
              </p>
            </div>
          )}

          {/* Legacy single prompt support */}
          {prompt.prompt && !prompt.preferencesPrompt && !prompt.destinationPrompt && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Your AI Prompt</h3>
                <div className="flex space-x-2">
                  {isEditingLegacyPrompt ? (
                    <>
                      <button
                        onClick={handleSaveLegacyPrompt}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleResetLegacyPrompt}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Reset
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingLegacyPrompt(true)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Edit Prompt
                    </button>
                  )}
                  <button
                    onClick={handleCopyLegacyPrompt}
                    className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors relative"
                  >
                    {showCopiedLegacy ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
              </div>
              {isEditingLegacyPrompt ? (
                <textarea
                  value={editedLegacyPrompt}
                  onChange={(e) => setEditedLegacyPrompt(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm"
                  placeholder="Edit your AI prompt here..."
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {editedLegacyPrompt}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-center space-x-4">
            {showBackToSurvey && onBackToSurvey && (
              <button
                onClick={onBackToSurvey}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to survey</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Got it! 👍
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIPromptDisplay; 