import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Question5DestinationStyleProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

const Question5DestinationStyle: React.FC<Question5DestinationStyleProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Load previous answers on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.destinationStyles) {
          setSelectedStyles(preferences.destinationStyles);
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  const destinationStyles = [
    { 
      value: 'urban', 
      label: 'Urban Vibes', 
      emoji: '🏙️', 
      description: 'City lights, midnight snacks, and the buzz of strangers all around.',
      picture: '/images/urban-vibes.jpg'
    },
    { 
      value: 'rural', 
      label: 'Rural Escape', 
      emoji: '🏞️', 
      description: 'Off the radar, into the real — quiet, local, and deeply felt.',
      picture: '/images/rural-escape.jpg'
    },
    { 
      value: 'coastal', 
      label: 'Coastal Air', 
      emoji: '🌊', 
      description: 'Cool breeze, crashing waves, and seafood that never saw a freezer.',
      picture: '/images/coastal-air.jpg'
    },
    { 
      value: 'mountain', 
      label: 'Mountain Retreat', 
      emoji: '🏔️', 
      description: 'Crisp air, forest scents, and nature whispering just to you.',
      picture: '/images/mountain-retreat.jpg'
    },
    { 
      value: 'tropical', 
      label: 'Tropical Mood', 
      emoji: '🌴', 
      description: 'Warm sun, sweet fruit, and swim-perfect days on repeat.',
      picture: '/images/tropical-mood.jpg'
    },
    { 
      value: 'snowy', 
      label: 'Snowy Magic', 
      emoji: '❄️', 
      description: 'Cold cheeks, cozy layers, and maybe — just maybe — the northern lights.',
      picture: '/images/snowy-magic.jpg'
    }
  ];

  const handleStyleToggle = (styleValue: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleValue)) {
        const newSelection = prev.filter(s => s !== styleValue);
        onAnswer(5, { destinationStyles: newSelection });
        return newSelection;
      } else {
        const newSelection = [...prev, styleValue];
        onAnswer(5, { destinationStyles: newSelection });
        return newSelection;
      }
    });
  };

  const handleNext = () => {
    if (selectedStyles.length > 0) {
      onNext();
    }
  };

  const getRankDisplay = (styleValue: string) => {
    const rank = selectedStyles.indexOf(styleValue) + 1;
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
          Imagine the destination-style options
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Choose multiple styles that appeal to you. The order you select them will be used for ranking.
        </p>
        <p className="text-sm text-gray-500">
          AI will think of them as possibilities and rank them accordingly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {destinationStyles.map((style) => {
          const isSelected = selectedStyles.includes(style.value);
          const rank = getRankDisplay(style.value);
          
          return (
            <motion.div
              key={style.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`option-card relative cursor-pointer transition-all ${
                isSelected ? 'selected border-2 border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleStyleToggle(style.value)}
            >
              {rank && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {rank}
                </div>
              )}
              
              <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                <div className="text-4xl">{style.emoji}</div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{style.label}</h3>
              <p className="text-gray-600 text-sm">{style.description}</p>
              
              <div className={`mt-3 p-2 rounded-lg text-center font-medium ${
                isSelected 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {isSelected ? `Ranked #${rank}` : 'Click to select'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedStyles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200"
        >
          <h4 className="font-semibold text-green-800 mb-2">Your Style Ranking:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedStyles.map((styleValue, index) => {
              const style = destinationStyles.find(s => s.value === styleValue);
              return (
                <span
                  key={styleValue}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  #{index + 1} {style?.label}
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
          disabled={selectedStyles.length === 0}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedStyles.length > 0
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

export default Question5DestinationStyle;