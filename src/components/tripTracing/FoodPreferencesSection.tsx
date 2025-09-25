import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FoodPreferencesSectionProps {
  onAnswer: (sectionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentSection: number;
  totalSections: number;
  canProceed: boolean;
}

const FoodPreferencesSection: React.FC<FoodPreferencesSectionProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentSection,
  totalSections,
  canProceed
}) => {
  const [foodPreferences, setFoodPreferences] = useState({
    styles: [] as string[],
    popularity: false,
    vegan: false,
    goodPicVibe: false
  });

  // Save answer whenever food preferences change
  useEffect(() => {
    onAnswer(currentSection, { 
      foodPreferences: {
        styles: foodPreferences.styles,
        popularity: foodPreferences.popularity,
        vegan: foodPreferences.vegan,
        goodPicVibe: foodPreferences.goodPicVibe
      }
    });
  }, [foodPreferences, onAnswer, currentSection]);

  const foodStyleOptions = [
    { value: 'local', label: 'Local Cuisine', emoji: '🌍', description: 'Traditional local dishes' },
    { value: 'international', label: 'International', emoji: '🌐', description: 'Global cuisine options' },
    { value: 'street', label: 'Street Food', emoji: '🍢', description: 'Local street vendors' },
    { value: 'fine', label: 'Fine Dining', emoji: '🍽️', description: 'High-end restaurants' },
    { value: 'casual', label: 'Casual Dining', emoji: '🍕', description: 'Relaxed restaurant experience' },
    { value: 'dont-mind', label: 'I don\'t mind', emoji: '🤷‍♂️', description: 'Open to any food type' }
  ];

  const handleStyleSelect = (style: string) => {
    setFoodPreferences(prev => {
      const currentStyles = prev.styles;
      
      if (style === 'dont-mind') {
        // If selecting "I don't mind", clear all other selections
        if (currentStyles.includes('dont-mind')) {
          // If already selected, deselect it
          return { ...prev, styles: [] };
        } else {
          // Select only "I don't mind"
          return { ...prev, styles: ['dont-mind'] };
        }
      } else {
        // If selecting any other option, remove "I don't mind" if it's selected
        const filteredStyles = currentStyles.filter(s => s !== 'dont-mind');
        
        if (filteredStyles.includes(style)) {
          // Remove the style if already selected
          return { ...prev, styles: filteredStyles.filter(s => s !== style) };
        } else {
          // Add the style
          return { ...prev, styles: [...filteredStyles, style] };
        }
      }
    });
  };

  const handlePopularityToggle = () => {
    setFoodPreferences(prev => ({
      ...prev,
      popularity: !prev.popularity
    }));
  };

  const handleVeganToggle = () => {
    setFoodPreferences(prev => ({
      ...prev,
      vegan: !prev.vegan
    }));
  };

  const handleGoodPicVibeToggle = () => {
    setFoodPreferences(prev => ({
      ...prev,
      goodPicVibe: !prev.goodPicVibe
    }));
  };

  const handleNext = () => {
    if (foodPreferences.styles.length > 0) {
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
          🍕 Food Preferences
        </h2>
        <p className="text-lg text-gray-600">
          Tell us about your food preferences and dining style
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">What food styles do you prefer? (Select multiple)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodStyleOptions.map((option) => {
            const isSelected = foodPreferences.styles.includes(option.value);
            const isExclusive = option.value === 'dont-mind';
            const isDisabled = foodPreferences.styles.includes('dont-mind') && !isExclusive;
            
            return (
              <motion.div
                key={option.value}
                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                className={`option-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isExclusive ? 'exclusive-option' : ''}`}
                onClick={() => !isDisabled && handleStyleSelect(option.value)}
              >
                <div className="text-4xl mb-3">{option.emoji}</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {option.label}
                  {isExclusive && <span className="text-xs text-orange-600 ml-1">(Exclusive)</span>}
                </h4>
                <p className="text-gray-600">{option.description}</p>
                {isSelected && (
                  <div className={`absolute top-2 right-2 ${isExclusive ? 'bg-orange-500' : 'bg-blue-500'} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm`}>
                    ✓
                  </div>
                )}
                {isSelected && isExclusive && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Only
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional preferences:</h3>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="popularity"
            checked={foodPreferences.popularity}
            onChange={handlePopularityToggle}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="popularity" className="text-lg text-gray-700">
            I prefer popular/well-reviewed places
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="vegan"
            checked={foodPreferences.vegan}
            onChange={handleVeganToggle}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="vegan" className="text-lg text-gray-700">
            I need vegan/vegetarian options
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="goodPicVibe"
            checked={foodPreferences.goodPicVibe}
            onChange={handleGoodPicVibeToggle}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="goodPicVibe" className="text-lg text-gray-700">
            I expect good pic/good vibe
          </label>
        </div>
      </div>

      {foodPreferences.styles.length > 0 && (
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700">
            Selected: <span className={`font-semibold ${foodPreferences.styles.includes('dont-mind') ? 'text-orange-600' : 'text-blue-600'}`}>
              {foodPreferences.styles.includes('dont-mind') ? 'I don\'t mind (any food type)' : foodPreferences.styles.join(', ')}
            </span>
          </p>
          {foodPreferences.styles.includes('dont-mind') && (
            <p className="text-sm text-orange-600 mt-1">✨ You're open to any food recommendations!</p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          className="px-6 py-3 rounded-xl font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-all"
        >
          ← Previous
        </button>

        <div className="text-gray-500">
          {currentSection} of {totalSections}
        </div>

        <button
          onClick={handleNext}
          disabled={foodPreferences.styles.length === 0}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            foodPreferences.styles.length > 0
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
};

export default FoodPreferencesSection; 