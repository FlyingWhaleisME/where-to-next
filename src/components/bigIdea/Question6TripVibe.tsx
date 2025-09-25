import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Question6TripVibeProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

const Question6TripVibe: React.FC<Question6TripVibeProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  // Load previous answers on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.tripVibe) {
          // Parse the comma-separated tripVibe string back to array
          const vibes = preferences.tripVibe.split(',').map((v: string) => v.trim());
          setSelectedVibes(vibes);
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  const tripVibes = [
    { 
      value: 'relaxation', 
      label: 'Relaxation', 
      emoji: '😌', 
      description: 'Do whatever — just deep breaths and slow days.',
      longDescription: 'Free day at a different country/place style',
      zone: 'comfort',
      picture: '/images/relaxation.jpg'
    },
    { 
      value: 'entertainment', 
      label: 'Entertainment', 
      emoji: '🎭', 
      description: 'Live music, bright lights, and nights that don\'t know how to end.',
      longDescription: 'Activities, attractions, performance arts, anything fun',
      zone: 'comfort',
      picture: '/images/entertainment.jpg'
    },
    { 
      value: 'educational', 
      label: 'Educational Discovery', 
      emoji: '📚', 
      description: 'Travel with curiosity — learn, question, and come back changed.',
      longDescription: 'Museums, sightseeing/landmarks, history, productive, new experiences special there',
      zone: 'growth',
      picture: '/images/educational.jpg'
    },
    { 
      value: 'cultural', 
      label: 'Cultural Immersion', 
      emoji: '🏺', 
      description: 'Stories in stone, music in streets — see the soul of a place.',
      longDescription: 'Day living like the locals, meals/lifestyle all like locals, socializing',
      zone: 'growth',
      picture: '/images/cultural.jpg'
    },
    { 
      value: 'shared', 
      label: 'Shared Escape', 
      emoji: '💘', 
      description: 'Whether it\'s love or laughter, it\'s better when you\'re close.',
      longDescription: 'To do something that would leave a special memory',
      zone: 'comfort',
      picture: '/images/shared-escape.jpg'
    },
    { 
      value: 'culinary', 
      label: 'Culinary Adventure', 
      emoji: '🍽️', 
      description: 'New tastes, local plates — eat your way through the map.',
      longDescription: 'Food-focused experiences and local cuisine exploration',
      zone: 'growth',
      picture: '/images/culinary.jpg'
    }
  ];

  const handleVibeToggle = (vibeValue: string) => {
    setSelectedVibes(prev => {
      if (prev.includes(vibeValue)) {
        const newSelection = prev.filter(v => v !== vibeValue);
        onAnswer(6, { tripVibe: newSelection.join(', ') });
        return newSelection;
      } else if (prev.length < 3) {
        const newSelection = [...prev, vibeValue];
        onAnswer(6, { tripVibe: newSelection.join(', ') });
        return newSelection;
      } else {
        return prev;
      }
    });
  };

  const handleNext = () => {
    if (selectedVibes.length > 0) {
      onNext();
    }
  };

  const getZoneVibes = (zone: 'comfort' | 'growth') => {
    return tripVibes.filter(vibe => vibe.zone === zone);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Imagine the vibe of your trip
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Choose up to 3 vibes that resonate with you. Mix comfort and growth zones for balance!
        </p>
        <p className="text-sm text-gray-500">
          Selected: {selectedVibes.length}/3
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
          Comfort Zone
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getZoneVibes('comfort').map((vibe) => {
            const isSelected = selectedVibes.includes(vibe.value);
            const rank = selectedVibes.indexOf(vibe.value) + 1;
            
            return (
              <motion.div
                key={vibe.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`option-card relative cursor-pointer transition-all ${
                  isSelected ? 'selected border-2 border-green-500 bg-green-50' : ''
                }`}
                onClick={() => handleVibeToggle(vibe.value)}
              >
                {rank > 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {rank}
                  </div>
                )}
                
                <div className="w-full h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-4xl">{vibe.emoji}</div>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{vibe.label}</h4>
                <p className="text-gray-600 text-sm mb-2">{vibe.description}</p>
                <p className="text-xs text-gray-500 italic">{vibe.longDescription}</p>
                
                <div className={`mt-3 p-2 rounded-lg text-center font-medium ${
                  isSelected 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isSelected ? `Ranked #${rank}` : 'Click to select'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-4 h-4 bg-purple-500 rounded-full mr-2"></span>
          Growth Zone
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getZoneVibes('growth').map((vibe) => {
            const isSelected = selectedVibes.includes(vibe.value);
            const rank = selectedVibes.indexOf(vibe.value) + 1;
            
            return (
              <motion.div
                key={vibe.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`option-card relative cursor-pointer transition-all ${
                  isSelected ? 'selected border-2 border-purple-500 bg-purple-50' : ''
                }`}
                onClick={() => handleVibeToggle(vibe.value)}
              >
                {rank > 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {rank}
                  </div>
                )}
                
                <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-4xl">{vibe.emoji}</div>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{vibe.label}</h4>
                <p className="text-sm mb-2">{vibe.description}</p>
                <p className="text-xs text-gray-500 italic">{vibe.longDescription}</p>
                
                <div className={`mt-3 p-2 rounded-lg text-center font-medium ${
                  isSelected 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isSelected ? `Ranked #${rank}` : 'Click to select'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {selectedVibes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
        >
          <h4 className="font-semibold text-blue-800 mb-2">Your Vibe Selection:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedVibes.map((vibeValue, index) => {
              const vibe = tripVibes.find(v => v.value === vibeValue);
              const zoneColor = vibe?.zone === 'comfort' ? 'green' : 'purple';
              return (
                <span
                  key={vibeValue}
                  className={`px-3 py-1 bg-${zoneColor}-100 text-${zoneColor}-800 rounded-full text-sm font-medium`}
                >
                  #{index + 1} {vibe?.label} ({vibe?.zone === 'comfort' ? 'Comfort' : 'Growth'})
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          className="px-6 py-3 rounded-xl font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-all"
        >
          Previous
        </button>

        <div className="text-gray-500">
          {currentQuestion} of {totalQuestions}
        </div>

        <button
          onClick={handleNext}
          disabled={selectedVibes.length === 0}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedVibes.length > 0
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default Question6TripVibe;