import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Question1GroupSizeProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

const Question1GroupSize: React.FC<Question1GroupSizeProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  const [selectedGroupSize, setSelectedGroupSize] = useState<string>('');
  const [customRange, setCustomRange] = useState<string>('');

  // Load previous answers on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.groupSize) {
          setSelectedGroupSize(preferences.groupSize);
        }
        if (preferences.customRange) {
          setCustomRange(preferences.customRange);
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  const groupSizeOptions = [
    { 
      value: 'solo', 
      label: 'Solo', 
      emoji: '🧍‍♂️', 
      description: 'Just me, myself, and I.',
      picture: '/images/solo-travel.jpg'
    },
    { 
      value: 'pair', 
      label: 'Pair', 
      emoji: '👩‍❤️‍👨', 
      description: 'A trip for two — romance or bromance.',
      picture: '/images/pair-travel.jpg'
    },
    { 
      value: 'small-group', 
      label: 'Small Group (3–4)', 
      emoji: '👨‍👩‍👧', 
      description: 'A cozy crew — not a crowd, not alone.',
      picture: '/images/small-group.jpg'
    },
    { 
      value: 'mid-size', 
      label: 'Mid-size Squad (5–8)', 
      emoji: '🧑‍🤝‍🧑', 
      description: 'Enough people for inside jokes and group photos.',
      picture: '/images/mid-group.jpg'
    },
    { 
      value: 'big-group', 
      label: 'Big Group (9+)', 
      emoji: '🚌', 
      description: 'An expedition, not a vacation.',
      picture: '/images/big-group.jpg'
    },
    { 
      value: 'group-organizer', 
      label: 'Group Organizer', 
      emoji: '👥', 
      description: 'Planning for others — teachers, companies, or group leaders.',
      picture: '/images/group-organizer.jpg'
    }
  ];

  const handleSelect = (groupSize: string) => {
    setSelectedGroupSize(groupSize);
    if (groupSize === 'group-organizer') {
      if (customRange.trim()) {
        onAnswer(1, { groupSize, customRange: customRange.trim() });
      } else {
        onAnswer(1, { groupSize });
      }
    } else {
      onAnswer(1, { groupSize });
    }
  };

  const handleCustomRangeChange = (value: string) => {
    setCustomRange(value);
    if (selectedGroupSize === 'group-organizer') {
      onAnswer(1, { groupSize: selectedGroupSize, customRange: value.trim() });
    }
  };

  const handleNext = () => {
    if (selectedGroupSize) {
      if (selectedGroupSize === 'group-organizer' && !customRange.trim()) {
        return;
      }
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          How many people are going?
        </h2>
        <p className="text-lg text-gray-600">
          This helps us understand the group dynamics and plan accordingly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {groupSizeOptions.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`option-card ${selectedGroupSize === option.value ? 'selected' : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
              <div className="text-4xl">{option.emoji}</div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{option.label}</h3>
            <p className="text-gray-600 text-sm">{option.description}</p>
          </motion.div>
        ))}
      </div>

      {selectedGroupSize === 'group-organizer' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 rounded-xl"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell us about your group (e.g., "Grade 5 class trip", "Company retreat for 20 employees", "Family reunion with 3 generations")
          </label>
          <textarea
            value={customRange}
            onChange={(e) => handleCustomRangeChange(e.target.value)}
            placeholder="e.g., Grade 5 class trip with 25 students and 3 chaperones"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps us understand your group dynamics and provide better recommendations
          </p>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={currentQuestion === 1}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            currentQuestion === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Previous
        </button>

        <div className="text-gray-500">
          {currentQuestion} of {totalQuestions}
        </div>

        <button
          onClick={handleNext}
          disabled={!selectedGroupSize || (selectedGroupSize === 'group-organizer' && !customRange.trim())}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedGroupSize && (selectedGroupSize !== 'group-organizer' || customRange.trim())
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

export default Question1GroupSize; 