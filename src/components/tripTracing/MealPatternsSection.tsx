import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MealPatternsSectionProps {
  onAnswer: (sectionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentSection: number;
  totalSections: number;
  canProceed: boolean;
}

const MealPatternsSection: React.FC<MealPatternsSectionProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentSection,
  totalSections,
  canProceed
}) => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [changeThroughTrip, setChangeThroughTrip] = useState<boolean>(false);
  const [changeType, setChangeType] = useState<boolean>(false);

  const mealOptions = [
    { 
      value: 'breakfast', 
      label: 'Breakfast', 
      emoji: '🌅', 
      description: 'Morning meal',
      exclusive: false
    },
    { 
      value: 'brunch', 
      label: 'Brunch', 
      emoji: '🥐', 
      description: 'Late morning meal (excludes breakfast & lunch only)',
      exclusive: false
    },
    { 
      value: 'snack-dessert', 
      label: 'Snack/Dessert', 
      emoji: '🍰', 
      description: 'Light snacks and desserts',
      exclusive: false
    },
    { 
      value: 'lunch', 
      label: 'Lunch', 
      emoji: '🍽️', 
      description: 'Midday meal',
      exclusive: false
    },
    { 
      value: 'supper', 
      label: 'Supper', 
      emoji: '🍴', 
      description: 'Evening meal',
      exclusive: false
    },
    { 
      value: 'dinner', 
      label: 'Dinner', 
      emoji: '🥘', 
      description: 'Main evening meal',
      exclusive: false
    },
    { 
      value: 'late-night-snack', 
      label: 'Late Night Snack', 
      emoji: '🌙', 
      description: 'Late evening snacks',
      exclusive: false
    },
    { 
      value: 'flexible', 
      label: 'Flexible', 
      emoji: '🔄', 
      description: 'Adapt to local schedule (excludes all other options)',
      exclusive: true
    },
    { 
      value: 'local-schedule', 
      label: 'Local Schedule', 
      emoji: '🌍', 
      description: 'Follow local meal times (excludes all other options)',
      exclusive: true
    }
  ];

  const handleMealToggle = (mealValue: string) => {
    const meal = mealOptions.find(m => m.value === mealValue);
    
    if (!meal) return;

    setSelectedMeals(prev => {
      // If clicking on Brunch (special case)
      if (mealValue === 'brunch') {
        if (prev.includes(mealValue)) {
          // Remove brunch if already selected
          return prev.filter(m => m !== mealValue);
        } else {
          // Remove breakfast and lunch, add brunch
          return prev.filter(m => m !== 'breakfast' && m !== 'lunch').concat([mealValue]);
        }
      }
      
      // If clicking on breakfast or lunch while brunch is selected
      if ((mealValue === 'breakfast' || mealValue === 'lunch') && prev.includes('brunch')) {
        // Remove brunch and add the selected meal
        return prev.filter(m => m !== 'brunch').concat([mealValue]);
      }
      
      // If clicking on an exclusive option (Flexible or Local Schedule)
      if (meal.exclusive) {
        if (prev.includes(mealValue)) {
          // Remove it if already selected
          return prev.filter(m => m !== mealValue);
        } else {
          // Select only this option, remove all others
          return [mealValue];
        }
      }
      
      // If clicking on a non-exclusive option
      if (prev.includes(mealValue)) {
        // Remove it
        return prev.filter(m => m !== mealValue);
      } else {
        // Check if we have any exclusive options selected
        const hasExclusive = prev.some(p => mealOptions.find(m => m.value === p)?.exclusive);
        if (hasExclusive) {
          // Remove exclusive options and add this one
          return [mealValue];
        } else {
          // Add to existing selection
          return [...prev, mealValue];
        }
      }
    });
  };

  const handleNext = () => {
    if (selectedMeals.length > 0) {
      onAnswer(3, {
        mealPatterns: {
          selectedMeals,
          changeThroughTrip,
          changeType
        }
      });
      onNext();
    }
  };

  const canProceedToNext = selectedMeals.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🍽️ Meal Patterns
        </h2>
        <p className="text-lg text-gray-600">
          Select your preferred meal patterns during the trip
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Select your meal preferences:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mealOptions.map((option) => {
            const isSelected = selectedMeals.includes(option.value);
            const isExclusive = option.exclusive;
            
            return (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`option-card cursor-pointer transition-all ${
                  isSelected 
                    ? 'selected border-2 border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                } ${isExclusive ? 'ring-2 ring-purple-200' : ''}`}
                onClick={() => handleMealToggle(option.value)}
              >
                <div className="text-4xl mb-3">{option.emoji}</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{option.label}</h4>
                <p className="text-gray-600 text-sm">{option.description}</p>
                {isExclusive && (
                  <div className="mt-2 text-xs text-purple-600 font-medium">
                    ⚠️ Exclusive option
                  </div>
                )}
                {isSelected && (
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    ✓ Selected
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {selectedMeals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200"
        >
          <h4 className="font-semibold text-green-800 mb-2">Selected Meal Patterns:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedMeals.map((meal) => {
              const mealInfo = mealOptions.find(m => m.value === meal);
              return (
                <span key={meal} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {mealInfo?.emoji} {mealInfo?.label}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="mb-8 space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Meal flexibility:</h3>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="mealChangeThroughTrip"
            checked={changeThroughTrip}
            onChange={(e) => setChangeThroughTrip(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="mealChangeThroughTrip" className="text-lg text-gray-700">
            Change meal patterns through the trip
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="mealChangeType"
            checked={changeType}
            onChange={(e) => setChangeType(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="mealChangeType" className="text-lg text-gray-700">
            Change meal types during the trip
          </label>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          className="px-6 py-3 rounded-xl font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-all"
        >
          Previous
        </button>

        <div className="text-gray-500">
          {currentSection} of {totalSections}
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceedToNext}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            canProceedToNext
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

export default MealPatternsSection; 