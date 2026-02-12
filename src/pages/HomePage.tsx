import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSurveyProgress } from '../hooks/useSurveyProgress';
import { getCurrentUser } from '../services/apiService';

const HomePage: React.FC = () => {
  const [hasTripPreferences, setHasTripPreferences] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { safeNavigate } = useSurveyProgress();

  useEffect(() => {
    // Check if user has trip preferences (user-specific)
    const { getCurrentUser, isAuthenticated } = require('../services/apiService');
    const { getUserData } = require('../utils/userDataStorage');
    
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id) {
        const latestPrefs = getUserData('tripPreferences');
        const savedPrefs = getUserData('savedTripPreferences');
        
        if (latestPrefs || (savedPrefs && Array.isArray(savedPrefs) && savedPrefs.length > 0)) {
          setHasTripPreferences(true);
        }
      }
    }

    // Load current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Listen for login/logout events
    const handleUserLogin = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    const handleUserLogout = () => {
      setUser(null);
    };

    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
        } else {
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
        <img
          src="https://i.pinimg.com/1200x/3c/02/dc/3c02dc7dd86038a77ce46f5d64262c39.jpg"
          alt="Travel destination"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-rose-50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white drop-shadow-lg text-center"
          >
            Where To Next?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-4 text-lg sm:text-xl text-white/90 drop-shadow-md text-center max-w-2xl"
          >
            Plan your dream trip with friends — from big ideas to every last detail.
          </motion.p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-12 relative z-20 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Big Idea</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Identify your dream trip before you start planning.
              </p>
              <button
                onClick={() => safeNavigate('/big-picture')}
                className="w-full text-sm sm:text-base py-2 sm:py-3 bg-gradient-to-r from-hawaii-coral to-rose-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-rose-500 hover:to-rose-400 transform hover:-translate-y-1 transition-all duration-200"
              >
                Start Big Idea Survey
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Trip Tracing</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Specify your trip details from your big ideas.
              </p>
              {hasTripPreferences ? (
                <button
                  onClick={() => safeNavigate('/trip-tracing')}
                  className="w-full text-sm sm:text-base py-2 sm:py-3 bg-gradient-to-r from-hawaii-coral to-rose-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-rose-500 hover:to-rose-400 transform hover:-translate-y-1 transition-all duration-200"
                >
                  Continue Trip Tracing
                </button>
              ) : (
                <button
                  onClick={() => safeNavigate('/big-picture')}
                  className="w-full text-sm sm:text-base py-2 sm:py-3 bg-rose-200 text-rose-700 font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-rose-300 transform hover:-translate-y-1 transition-all duration-200 border border-rose-300"
                >
                  Complete Big Idea First
                </button>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">How It Works</h2>
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
