import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSurveyProgress } from '../hooks/useSurveyProgress';
import { getCurrentUser } from '../services/apiService';

const HomePage: React.FC = () => {
  const [hasTripPreferences, setHasTripPreferences] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
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

  // Debug function to view all accounts and data in MongoDB
  const viewAllAccounts = async () => {
    try {
      const { debugApi } = await import('../services/apiService');
      const result = await debugApi.getAllData();
      
      if (result.data) {
        setDebugData(result.data);
        setShowDebugModal(true);
      } else {
        alert(`Failed to fetch data:\n${result.error}`);
      }
    } catch (error) {
      alert(`Failed to fetch data:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-hawaii-mint to-white py-8 sm:py-12 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
            Where To Next?
          </h1>
          
          {/* Temporary test buttons */}
          <div className="mb-6 sm:mb-8 flex justify-center gap-3 flex-wrap">
            <button
              onClick={testBackendConnection}
              className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              Test Backend Connection
            </button>
            <button
              onClick={viewAllAccounts}
              className="px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm sm:text-base"
            >
              View All Accounts & Data
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
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

      {/* Debug Modal - View All Accounts */}
      {showDebugModal && debugData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                All Accounts & Data ({debugData.totalUsers} users)
              </h2>
              <button
                onClick={() => setShowDebugModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Fetched at: {debugData.fetchedAt}</p>
            
            <div className="space-y-6">
              {debugData.users?.map((u: any, idx: number) => (
                <div key={u.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    User {idx + 1}: {u.name || 'No Name'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                    <p><strong>ID:</strong> <code className="bg-gray-200 px-1 rounded text-xs">{u.id}</code></p>
                    <p><strong>Email:</strong> {u.email}</p>
                    <p><strong>Password (hash):</strong> <code className="bg-gray-200 px-1 rounded text-xs break-all">{u.passwordHash?.substring(0, 30)}...</code></p>
                    <p><strong>Created:</strong> {new Date(u.createdAt).toLocaleString()}</p>
                    <p><strong>Last Login:</strong> {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                  
                  {/* Documents */}
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-700">Documents ({u.documentsCount})</h4>
                    {u.documents?.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                        {u.documents.map((doc: any) => (
                          <li key={doc.id}>{doc.title} <span className="text-gray-400 text-xs">({new Date(doc.createdAt).toLocaleDateString()})</span></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 ml-2">No documents</p>
                    )}
                  </div>
                  
                  {/* Preferences */}
                  <div>
                    <h4 className="font-semibold text-gray-700">Saved Surveys ({u.preferencesCount})</h4>
                    {u.preferences?.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                        {u.preferences.map((pref: any) => (
                          <li key={pref.id}>{pref.surveyName} <span className="text-gray-400 text-xs">({pref.completedAt ? new Date(pref.completedAt).toLocaleDateString() : 'N/A'})</span></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 ml-2">No saved surveys</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
