import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Question9PrioritiesProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
  onQuestion7Complete?: () => void; // Special handler for Question 7
  setAiPrompt?: (prompt: any) => void; // For emergency button
  setShowAIPrompt?: (show: boolean) => void; // For emergency button
}

const Question9Priorities: React.FC<Question9PrioritiesProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed,
  onQuestion7Complete,
  setAiPrompt,
  setShowAIPrompt
}) => {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [priorityOrder, setPriorityOrder] = useState<string[]>([]);

  // Load previous answers on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.priorities) {
          setSelectedPriorities(preferences.priorities);
          setPriorityOrder(preferences.priorities);
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  const priorities = [
    { 
      value: 'eco-friendliness', 
      label: 'Eco-friendliness', 
      description: 'Environmentally conscious travel options',
      icon: '🌱'
    },
    { 
      value: 'safety', 
      label: 'Safety', 
      description: 'Safe destinations and accommodations',
      icon: '🛡️'
    },
    { 
      value: 'accessibility', 
      label: 'Accessibility', 
      description: 'Physical needs or medical requirements',
      icon: '♿'
    },
    { 
      value: 'cost-efficiency', 
      label: 'Cost-efficiency', 
      description: 'Getting the most value for your money',
      icon: '💰'
    },
    { 
      value: 'time-efficiency', 
      label: 'Time-efficiency', 
      description: 'Optimizing time during your trip',
      icon: '⏰'
    },
    { 
      value: 'cost-effectiveness', 
      label: 'Cost effectiveness', 
      description: 'Balancing quality with cost',
      icon: '⚖️'
    },
    { 
      value: 'number-of-options', 
      label: 'Number of options', 
      description: 'Having multiple choices available',
      icon: '📋'
    }
  ];

  const handlePriorityToggle = (priorityValue: string) => {
    console.log('Priority toggle called for:', priorityValue);
    
    setSelectedPriorities(prev => {
      if (prev.includes(priorityValue)) {
        const newSelection = prev.filter(p => p !== priorityValue);
        const newOrder = priorityOrder.filter(p => p !== priorityValue);
        setPriorityOrder(newOrder);
        
        console.log('Removing priority, calling onAnswer with:', { 
          priorities: newSelection,
          priorityOrder: newOrder
        });
        
        console.log('Saving priorities to localStorage:', { 
          priorities: newSelection,
          priorityOrder: newOrder
        });
        
        onAnswer(9, { 
          priorities: newSelection,
          priorityOrder: newOrder
        });
        return newSelection;
      } else {
        const newSelection = [...prev, priorityValue];
        const newOrder = [...priorityOrder, priorityValue];
        setPriorityOrder(newOrder);
        
        console.log('Adding priority, calling onAnswer with:', { 
          priorities: newSelection,
          priorityOrder: newOrder
        });
        
        console.log('Saving priorities to localStorage:', { 
          priorities: newSelection,
          priorityOrder: newOrder
        });
        
        onAnswer(9, { 
          priorities: newSelection,
          priorityOrder: newOrder
        });
        return newSelection;
      }
    });
  };

  const handleNext = () => {
    console.log('Question7 handleNext called!');
    console.log('Selected priorities:', selectedPriorities);
    console.log('Priority order:', priorityOrder);
    
    if (selectedPriorities.length > 0) {
      console.log('Question 7 completed, calling onNext...');
      onNext();
    } else {
      console.log('No priorities selected, cannot proceed');
    }
  };

  const getPriorityRank = (priorityValue: string) => {
    const rank = priorityOrder.indexOf(priorityValue) + 1;
    return rank > 0 ? rank : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Ranking priorities in quality
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Select the priorities that matter to you. The order you select them creates your ranking.
        </p>
        <p className="text-sm text-gray-500">
          This will be used as a weighing filter system for AI recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {priorities.map((priority) => {
          const isSelected = selectedPriorities.includes(priority.value);
          const rank = getPriorityRank(priority.value);
          
          return (
            <motion.div
              key={priority.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`option-card relative cursor-pointer transition-all ${
                isSelected ? 'selected border-2 border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handlePriorityToggle(priority.value)}
            >
              {rank && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {rank}
                </div>
              )}
              
              <div className="text-center">
                <div className="text-4xl mb-3">{priority.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{priority.label}</h3>
                <p className="text-gray-600 text-sm">{priority.description}</p>
                
                <div className={`mt-3 p-2 rounded-lg text-center font-medium ${
                  isSelected 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isSelected ? `Ranked #${rank}` : 'Click to select'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {priorityOrder.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-green-50 rounded-xl border border-green-200"
        >
          <h4 className="font-semibold text-green-800 mb-4">Your Priority Ranking:</h4>
          <div className="space-y-2">
            {priorityOrder.map((priorityValue, index) => {
              const priority = priorities.find(p => p.value === priorityValue);
              return (
                <div key={priorityValue} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-green-800">{priority?.label}</span>
                    <span className="text-sm text-green-600 ml-2">({priority?.description})</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-green-600 mt-3">
            This ranking will be used to weight AI recommendations in your favor
          </p>
          
          {/* Success message when ready to continue */}
          <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-green-800">All set! You can now continue.</p>
                <p className="text-sm text-green-700">Click the "Next" button below to see your AI travel summary.</p>
              </div>
            </div>
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
          {selectedPriorities.length > 0 && (
            <div className="text-sm text-green-600 mt-1">
              ✓ Ready to continue
            </div>
          )}
        </div>
        
        {/* Direct AI Prompt Button - Bypasses all complex logic */}
        {selectedPriorities.length > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🚀 Question 9 - Get AI Summary button clicked!');
              
              // Save to localStorage first
              const currentData = {
                priorities: selectedPriorities,
                priorityOrder: priorityOrder
              };
              localStorage.setItem('question7Data', JSON.stringify(currentData));
              
              // Also save to tripPreferences
              const savedPreferences = localStorage.getItem('tripPreferences');
              if (savedPreferences) {
                try {
                  const preferences = JSON.parse(savedPreferences);
                  preferences.priorities = selectedPriorities;
                  preferences.priorityOrder = priorityOrder;
                  localStorage.setItem('tripPreferences', JSON.stringify(preferences));
                  console.log('✅ Updated tripPreferences with priorities');
                } catch (error) {
                  console.error('Error updating tripPreferences:', error);
                }
              }
              
              // Force trigger the summary by calling onNext
              console.log('About to call onNext()...');
              if (typeof onNext === 'function') {
                onNext();
                console.log('✅ onNext() called successfully');
              } else {
                console.error('❌ onNext is not a function:', typeof onNext);
              }
            }}
            className="px-6 py-3 rounded-xl font-semibold bg-purple-500 text-white hover:bg-purple-600 transition-all ml-2"
            style={{ zIndex: 1000, position: 'relative', cursor: 'pointer' }}
          >
            🚀 Get AI Summary Now
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Question9Priorities;