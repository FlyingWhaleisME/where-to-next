import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSurveyProgress } from '../hooks/useSurveyProgress';
import { getCurrentUser } from '../services/apiService';

const HomePage: React.FC = () => {
  const [hasTripPreferences, setHasTripPreferences] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { safeNavigate } = useSurveyProgress();
  
  // Temporary test function for backend communication
  const testBackendConnection = async () => {
    try {
      const { healthApi } = await import('../services/apiService');
      const result = await healthApi.test();
      
      if (result.data) {
        alert(`Backend connection successful!\n\nServer response:\n${JSON.stringify(result.data, null, 2)}`);
      } else {
        alert(`Backend connection failed:\n${result.error}`);
      }
    } catch (error) {
      alert(`Backend connection failed:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    // Check if user has trip preferences
    const latestPrefs = localStorage.getItem('tripPreferences');
    const savedPrefs = localStorage.getItem('savedTripPreferences');
    
    if (latestPrefs || (savedPrefs && JSON.parse(savedPrefs).length > 0)) {
      setHasTripPreferences(true);
    }

    // Load current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Listen for login/logout events
    const handleUserLogin = () => {
      console.log('User logged in - updating HomePage user state');
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    const handleUserLogout = () => {
      console.log('User logged out - clearing HomePage user state');
      setUser(null);
    };

    // Listen for custom events
    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);

    // Also listen for storage changes (token updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token added - user logged in
          const currentUser = getCurrentUser();
          setUser(currentUser);
        } else {
          // Token removed - user logged out
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 sm:py-12 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
            🌍 Where To Next?
          </h1>
          
          {/* Temporary backend test button */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={testBackendConnection}
              className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              Test Backend Connection
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">💡</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Big Idea</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Identify your dream trip before you start planning.
              </p>
              <button
                onClick={() => safeNavigate('/big-picture')}
                className="btn-primary w-full text-sm sm:text-base py-2 sm:py-3"
              >
                Start Big Idea Survey
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">🎯</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Trip Tracing</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Specify your trip details from your big ideas.
              </p>
              {hasTripPreferences ? (
                <button
                  onClick={() => safeNavigate('/trip-tracing')}
                  className="btn-primary w-full text-sm sm:text-base py-2 sm:py-3"
                >
                  Continue Trip Tracing
                </button>
              ) : (
                <button
                  onClick={() => safeNavigate('/big-picture')}
                  className="btn-secondary w-full text-sm sm:text-base py-2 sm:py-3"
                >
                  Complete Big Idea First
                </button>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">🚀 How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
              <div>
                <div className="text-xl sm:text-2xl mb-2">1️⃣</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Big Idea Survey</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Answer questions about your travel preferences to identify your dream trip.
                </p>
              </div>
              <div>
                <div className="text-xl sm:text-2xl mb-2">2️⃣</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Trip Tracing</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Get down to the details of your trip, picking options and settling rules before trip.
                </p>
              </div>
              <div>
                <div className="text-xl sm:text-2xl mb-2">3️⃣</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Get Results</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Receive personalized recommendations and make detailed trip planning documents.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;