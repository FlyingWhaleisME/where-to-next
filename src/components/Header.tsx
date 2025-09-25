import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyProgress } from '../hooks/useSurveyProgress';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [latestPreferences, setLatestPreferences] = useState<any>(null);
  const [savedPreferences, setSavedPreferences] = useState<any[]>([]);
  const location = useLocation();
  const { safeNavigate, surveyProgress } = useSurveyProgress();

  useEffect(() => {
    // Load latest trip preferences
    const latestPrefs = localStorage.getItem('tripPreferences');
    if (latestPrefs) {
      try {
        setLatestPreferences(JSON.parse(latestPrefs));
      } catch (error) {
        console.error('Error parsing latest preferences:', error);
      }
    }
    
    // Load saved trip preferences
    const savedPrefs = localStorage.getItem('savedTripPreferences');
    if (savedPrefs) {
      try {
        setSavedPreferences(JSON.parse(savedPrefs));
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, [location]);

  const handleTripTracingClick = () => {
    setShowDropdown(false);
    
    // If no preferences available, go directly to trip tracing
    if (!latestPreferences && savedPreferences.length === 0) {
      safeNavigate('/trip-tracing');
      return;
    }
    
    // Show preference selection modal
    setShowPreferenceModal(true);
  };

  const handlePreferenceSelect = (preferenceSet: any | 'latest') => {
    if (preferenceSet === 'latest') {
      // Use latest preferences (already in localStorage)
      safeNavigate('/trip-tracing');
    } else {
      // Load selected saved preferences
      localStorage.setItem('tripPreferences', JSON.stringify(preferenceSet.preferences));
      safeNavigate('/trip-tracing');
    }
    setShowPreferenceModal(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="relative">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 z-50 relative"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button onClick={() => safeNavigate('/')}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Where To Next?
              </motion.div>
            </button>

            <nav className="flex items-center space-x-6">
              <button 
                onClick={() => safeNavigate('/profile')}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Profile
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center space-x-1 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                >
                  Trip Planning
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    >
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          safeNavigate('/big-picture');
                        }}
                        className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-t-lg"
                      >
                        Big Idea
                      </button>
                      {(latestPreferences || savedPreferences.length > 0) && (
                        <button
                          onClick={handleTripTracingClick}
                          className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          Trip Tracing
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </nav>
          </div>
        </div>
      </motion.header>

      {/* Preference Selection Modal */}
      <AnimatePresence>
        {showPreferenceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPreferenceModal(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  🎯 Select Trip Preferences
                </h2>
                <button
                  onClick={() => setShowPreferenceModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Choose which trip preferences to use for your Trip Tracing survey:
              </p>

              <div className="space-y-4">
                {/* Latest Preferences Option */}
                {latestPreferences && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 cursor-pointer"
                    onClick={() => handlePreferenceSelect('latest')}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">🌟 Latest Survey Results</h3>
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Current
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <p><strong>Group Size:</strong> {latestPreferences.groupSize || 'Not specified'}</p>
                      <p><strong>Budget:</strong> ${latestPreferences.budget || 'Not specified'}</p>
                      <p><strong>Trip Vibe:</strong> {latestPreferences.tripVibe || 'Not specified'}</p>
                      <p><strong>Planning Style:</strong> {
                        typeof latestPreferences.planningStyle === 'number' 
                          ? `${latestPreferences.planningStyle}%`
                          : latestPreferences.planningStyle || 'Not specified'
                      }</p>
                    </div>
                  </motion.div>
                )}

                {/* Saved Preferences Options */}
                {savedPreferences.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">💾 Your Saved Preferences:</h4>
                    </div>
                    
                    {savedPreferences.map((preferenceSet) => (
                      <motion.div
                        key={preferenceSet.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 cursor-pointer"
                        onClick={() => handlePreferenceSelect(preferenceSet)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-800">{preferenceSet.name}</h3>
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Saved
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <p><strong>Group Size:</strong> {preferenceSet.preferences.groupSize || 'Not specified'}</p>
                          <p><strong>Budget:</strong> ${preferenceSet.preferences.budget || 'Not specified'}</p>
                          <p><strong>Trip Vibe:</strong> {preferenceSet.preferences.tripVibe || 'Not specified'}</p>
                          <p><strong>Created:</strong> {formatDate(preferenceSet.createdAt)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}

                {/* No Preferences Available */}
                {!latestPreferences && savedPreferences.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Preferences Found</h3>
                    <p className="text-gray-600 mb-4">
                      Complete a Big Idea survey first to create trip preferences for Trip Tracing.
                    </p>
                    <button
                      onClick={() => {
                        setShowPreferenceModal(false);
                        navigate('/big-picture-planning');
                      }}
                      className="btn-primary px-6 py-3"
                    >
                      Start Big Idea Survey
                    </button>
                  </div>
                )}
              </div>

              {(latestPreferences || savedPreferences.length > 0) && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowPreferenceModal(false)}
                    className="btn-secondary px-6 py-3"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header; 