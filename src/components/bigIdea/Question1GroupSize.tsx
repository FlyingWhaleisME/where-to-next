import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// TypeScript interface defines Reactcomponent props structure
// Props allow parent component to pass data and callbacks to child
interface Question1GroupSizeProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

// Functional component receives props via destructuring
// React.FC indicates this is a React functional component
const Question1GroupSize: React.FC<Question1GroupSizeProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  // React useState hooks for component state management
  // Component re-renders when selectedGroupSize changes
  const [selectedGroupSize, setSelectedGroupSize] = useState<string>('');
  const [customRange, setCustomRange] = useState<string>('');

  // React useEffect hook runs once when component mounts
  // Loads previously saved answer from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.groupSize) {
          // Updates component state with saved group size
          setSelectedGroupSize(preferences.groupSize);
        }
        if (preferences.customRange) {
          // Updates component state with saved custom range
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

  // Event handler function updates local state and notifies parent
  const handleSelect = (groupSize: string) => {
    // Updates the component state with selected group size
    setSelectedGroupSize(groupSize);
    if (groupSize === 'group-organizer') {
      if (customRange.trim()) {
        // Notifies parent with both group size and custom range when custom range is provided
        // Calls the onAnswer function with the group size and custom range
        onAnswer(1, { groupSize, customRange: customRange.trim() });
      } else {
        // Notifies parent with group size when custom range is not provided
        // Calls the onAnswer function with the group size
        onAnswer(1, { groupSize });
      }
    } else {
      // Notifies parent with group size when group size is not provided
      // Calls the onAnswer function with the group size
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
        {/* Map function renders list of options */}
        {/* Each option calls handleSelect when clicked */}
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
            <div className="w-full h-32 bg-gradient-to-br from-emerald-100 to-rose-100 rounded-lg mb-3 flex items-center justify-center">
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
          className="mb-6 p-4 bg-emerald-50 rounded-xl"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell us about your group (e.g., "Grade 5 class trip", "Company retreat for 20 employees", "Family reunion with 3 generations")
          </label>
          <textarea
            value={customRange}
            onChange={(e) => handleCustomRangeChange(e.target.value)}
            placeholder="e.g., Grade 5 class trip with 25 students and 3 chaperones"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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