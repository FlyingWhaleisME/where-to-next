import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSurveyProgress } from '../hooks/useSurveyProgress';

const HomePage: React.FC = () => {
  const [hasTripPreferences, setHasTripPreferences] = useState(false);
  const { safeNavigate } = useSurveyProgress();

  useEffect(() => {
    // Check if user has trip preferences
    const latestPrefs = localStorage.getItem('tripPreferences');
    const savedPrefs = localStorage.getItem('savedTripPreferences');
    
    if (latestPrefs || (savedPrefs && JSON.parse(savedPrefs).length > 0)) {
      setHasTripPreferences(true);
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            🌍 Where To Next?
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Identify your dream trip and specify through detailed surveys and documents.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Big Idea</h3>
            <p className="text-gray-600 mb-6">
              Identify your dream trip before you start planning.
            </p>
            <button 
              onClick={() => safeNavigate('/big-picture')}
              className="btn-primary"
            >
              Start Planning
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Trip Tracing</h3>
            <p className="text-gray-600 mb-6">
              Specify your trip details from your big idea.
            </p>
            {hasTripPreferences ? (
              <button 
                onClick={() => safeNavigate('/trip-tracing')}
                className="btn-primary"
              >
                Trace Trip
              </button>
            ) : (
              <button 
                onClick={() => safeNavigate('/big-picture')}
                className="btn-primary"
              >
                Complete Big Idea First
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Documents</h3>
            <p className="text-gray-600 mb-6">
              Organize your decisions and finalize your trip.
            </p>
            <button 
              onClick={() => safeNavigate('/profile')}
              className="btn-primary"
            >
              View
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            🚀 Why Choose This Approach?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">💰 Efficient planning</h4>
              <p className="text-gray-600">No need of overwhelming money or time investment.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🤖 Learn AI Skills</h4>
              <p className="text-gray-600">Master the art of prompting AI for travel planning</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🎨 Structured steps</h4>
              <p className="text-gray-600">Plan your trip with a guidance of surveys and documents</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🔗 Flexible Tools</h4>
              <p className="text-gray-600">Understand the process of planning a trip and recognizing your own needs.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage; 