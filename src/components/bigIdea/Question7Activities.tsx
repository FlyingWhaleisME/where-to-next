import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Question7ActivitiesProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

const Question7Activities: React.FC<Question7ActivitiesProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [vibeActivities, setVibeActivities] = useState<{[key: string]: string[]}>({});

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

  // Update answer whenever vibeActivities change
  useEffect(() => {
    const answer = {
      vibeActivities: vibeActivities
    };
    console.log('Question7 sending answer:', answer);
    onAnswer(7, answer);
  }, [vibeActivities, onAnswer]);

  const addActivity = (vibe: string) => {
    setVibeActivities(prev => ({
      ...prev,
      [vibe]: [...(prev[vibe] || []), '']
    }));
  };

  const removeActivity = (vibe: string, index: number) => {
    setVibeActivities(prev => ({
      ...prev,
      [vibe]: prev[vibe]?.filter((_, i) => i !== index) || []
    }));
  };

  const updateActivity = (vibe: string, index: number, value: string) => {
    setVibeActivities(prev => ({
      ...prev,
      [vibe]: prev[vibe]?.map((activity, i) => i === index ? value : activity) || []
    }));
  };

  const getVibeLabel = (vibe: string) => {
    const vibeMap: {[key: string]: string} = {
      'relaxation': 'Relaxation',
      'entertainment': 'Entertainment',
      'educational': 'Educational Discovery',
      'adventure': 'Adventure',
      'culinary': 'Culinary',
      'cultural': 'Cultural',
      'nature': 'Nature',
      'shopping': 'Shopping',
      'photography': 'Photography',
      'wellness': 'Wellness'
    };
    return vibeMap[vibe] || vibe;
  };

  const getVibeEmoji = (vibe: string) => {
    const emojiMap: {[key: string]: string} = {
      'relaxation': '😌',
      'entertainment': '🎭',
      'educational': '📚',
      'adventure': '🏔️',
      'culinary': '🍽️',
      'cultural': '🏛️',
      'nature': '🌿',
      'shopping': '🛍️',
      'photography': '📸',
      'wellness': '🧘'
    };
    return emojiMap[vibe] || '🎯';
  };

  const canProceedToNext = () => {
    // Check if at least one activity is provided for each selected vibe
    return selectedVibes.every(vibe => 
      vibeActivities[vibe] && 
      vibeActivities[vibe].length > 0 && 
      vibeActivities[vibe].some(activity => activity.trim() !== '')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            🎯
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            What activities do you have in mind?
          </h1>
          <p className="text-gray-600 text-lg">
            Tell us about the specific activities you're excited about for each trip vibe you selected.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion} of {totalQuestions}</span>
            <span>{Math.round((currentQuestion / totalQuestions) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Activities for each selected vibe */}
        <div className="space-y-6">
          {selectedVibes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🤔</div>
              <p className="text-gray-600 text-lg">
                Please go back and select some trip vibes first!
              </p>
            </div>
          ) : (
            selectedVibes.map((vibe, vibeIndex) => (
              <motion.div
                key={vibe}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: vibeIndex * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{getVibeEmoji(vibe)}</span>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {getVibeLabel(vibe)} Activities
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">
                  What specific activities are you excited about for {getVibeLabel(vibe).toLowerCase()}? 
                  Add examples with brief explanations.
                </p>

                <div className="space-y-3">
                  {(vibeActivities[vibe] || []).map((activity, activityIndex) => (
                    <div key={activityIndex} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => updateActivity(vibe, activityIndex, e.target.value)}
                          placeholder={`e.g., Visit local hot springs and spa treatments (relaxing and authentic)`}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => removeActivity(vibe, activityIndex)}
                        className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addActivity(vibe)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">+</span>
                    Add another activity
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            ← Previous
          </button>
          
          <button
            onClick={onNext}
            disabled={!canProceedToNext()}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              canProceedToNext()
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canProceedToNext() ? 'Next →' : 'Please add activities for each vibe'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Question7Activities;
