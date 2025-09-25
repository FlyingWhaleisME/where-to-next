import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question4DestinationApproachProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

interface DestinationApproach {
  travelType: 'abroad' | 'domestic' | '';
  destinationStatus: 'chosen' | 'in_mind' | 'open' | '';
  specificDestinations?: string[];
  originLocation?: string;
}

const Question4DestinationApproach: React.FC<Question4DestinationApproachProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  // Load current answer from localStorage
  const getCurrentAnswer = () => {
    const saved = localStorage.getItem('tripPreferences');
    if (saved) {
      try {
        const tripPreferences = JSON.parse(saved);
        return {
          destinationApproach: tripPreferences.destinationApproach,
          duration: tripPreferences.duration // Also preserve duration data
        };
      } catch (error) {
        console.error('Error parsing trip preferences:', error);
      }
    }
    return null;
  };

  const currentAnswer = getCurrentAnswer();

  const [approach, setApproach] = useState<DestinationApproach>({
    travelType: currentAnswer?.destinationApproach?.travelType || '',
    destinationStatus: currentAnswer?.destinationApproach?.destinationStatus || '',
    specificDestinations: currentAnswer?.destinationApproach?.specificDestinations || [],
    originLocation: currentAnswer?.destinationApproach?.originLocation || '',
  });

  const [customDestinations, setCustomDestinations] = useState<string[]>(
    currentAnswer?.destinationApproach?.specificDestinations || ['']
  );

  const [originLocation, setOriginLocation] = useState<string>(
    currentAnswer?.destinationApproach?.originLocation || ''
  );


  useEffect(() => {
    console.log('Question4DestinationApproach - approach updated:', approach);
    // Preserve duration data when saving destination approach
    const answerToSave = {
      destinationApproach: approach,
      duration: currentAnswer?.duration // Preserve existing duration data
    };
    onAnswer(currentQuestion, answerToSave);
  }, [approach, onAnswer, currentQuestion, currentAnswer?.duration]);

  // Update approach when origin location changes
  useEffect(() => {
    setApproach(prev => ({
      ...prev,
      originLocation: originLocation
    }));
  }, [originLocation]);


  const handleTravelTypeSelect = (type: 'abroad' | 'domestic') => {
    setApproach(prev => ({
      ...prev,
      travelType: type,
      // Reset destination status when travel type changes
      destinationStatus: '',
      specificDestinations: []
    }));
    setCustomDestinations(['']);
  };

  const handleDestinationStatusSelect = (status: 'chosen' | 'in_mind' | 'open') => {
    setApproach(prev => ({
      ...prev,
      destinationStatus: status,
      specificDestinations: status === 'open' ? [] : prev.specificDestinations
    }));
    
    if (status === 'open') {
      setCustomDestinations(['']);
    }
  };

  const handleDestinationChange = (index: number, value: string) => {
    const newDestinations = [...customDestinations];
    newDestinations[index] = value;
    setCustomDestinations(newDestinations);
    
    // Update approach with non-empty destinations
    const validDestinations = newDestinations.filter(dest => dest.trim() !== '');
    setApproach(prev => ({
      ...prev,
      specificDestinations: validDestinations
    }));
  };

  const addDestination = () => {
    setCustomDestinations([...customDestinations, '']);
  };

  const removeDestination = (index: number) => {
    if (customDestinations.length > 1) {
      const newDestinations = customDestinations.filter((_, i) => i !== index);
      setCustomDestinations(newDestinations);
      
      const validDestinations = newDestinations.filter(dest => dest.trim() !== '');
      setApproach(prev => ({
        ...prev,
        specificDestinations: validDestinations
      }));
    }
  };

  const canProceedToNext = () => {
    if (!approach.travelType || !approach.destinationStatus || !originLocation.trim()) return false;
    
    if (approach.destinationStatus === 'chosen' || approach.destinationStatus === 'in_mind') {
      return approach.specificDestinations && approach.specificDestinations.length > 0;
    }
    
    return true; // For 'open' status
  };

  const travelOptions = [
    {
      id: 'abroad',
      emoji: '✈️',
      title: 'International Travel',
      description: 'I want to travel abroad to another country'
    },
    {
      id: 'domestic',
      emoji: '🏞️',
      title: 'Domestic Travel', 
      description: 'I want to stay within my home country'
    }
  ];

  const destinationOptions = [
    {
      id: 'chosen',
      emoji: '🎯',
      title: 'Destinations Chosen',
      description: 'I already know exactly where I want to go'
    },
    {
      id: 'in_mind',
      emoji: '💭',
      title: 'Destinations in Mind',
      description: 'I have some destinations I\'m considering'
    },
    {
      id: 'open',
      emoji: '🌍',
      title: 'Open to Suggestions',
      description: 'I want AI to suggest destinations based on my preferences'
    }
  ];


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          🗺️ Tell us about your destination approach
        </h2>
        <p className="text-xl text-gray-600">
          This helps us tailor the perfect recommendations for you
        </p>
      </div>

      {/* Travel Type Selection */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Are you planning to travel abroad or domestically?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {travelOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTravelTypeSelect(option.id as 'abroad' | 'domestic')}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                approach.travelType === option.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="text-4xl mb-3">{option.emoji}</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                {option.title}
              </h4>
              <p className="text-gray-600">{option.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Origin Location Input */}
      <AnimatePresence>
        {approach.travelType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Where are you traveling from? 🏠
            </h3>
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                placeholder="e.g., New York, London, Tokyo, Los Angeles"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <p className="text-sm text-gray-600 mt-2 text-center">
                This helps us provide more accurate transportation information and travel times
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destination Status Selection */}
      <AnimatePresence>
        {approach.travelType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              What's your destination status?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {destinationOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDestinationStatusSelect(option.id as 'chosen' | 'in_mind' | 'open')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    approach.destinationStatus === option.id
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-3">{option.emoji}</div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {option.title}
                  </h4>
                  <p className="text-gray-600">{option.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Specific Destinations Input */}
      <AnimatePresence>
        {(approach.destinationStatus === 'chosen' || approach.destinationStatus === 'in_mind') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              {approach.destinationStatus === 'chosen' 
                ? 'What destinations have you chosen?' 
                : 'What destinations are you considering?'
              }
            </h3>
            <div className="max-w-2xl mx-auto space-y-3">
              {customDestinations.map((destination, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => handleDestinationChange(index, e.target.value)}
                    placeholder={`Destination ${index + 1} (e.g., Tokyo, Paris, New York)`}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  {customDestinations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDestination(index)}
                      className="px-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDestination}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add another destination
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Summary Display */}
      <AnimatePresence>
        {canProceedToNext() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-8"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-3">✅ Your Destination Approach:</h4>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Travel Type:</span> {
                  approach.travelType === 'abroad' ? '✈️ International Travel' : '🏞️ Domestic Travel'
                }
              </p>
              <p>
                <span className="font-medium">Destination Status:</span> {
                  approach.destinationStatus === 'chosen' ? '🎯 Destinations Chosen' :
                  approach.destinationStatus === 'in_mind' ? '💭 Destinations in Mind' :
                  '🌍 Open to Suggestions'
                }
              </p>
              {approach.specificDestinations && approach.specificDestinations.length > 0 && (
                <p>
                  <span className="font-medium">Destinations:</span> {approach.specificDestinations.join(', ')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevious}
          className="btn-secondary text-xl px-8 py-4"
        >
          ← Previous
        </motion.button>

        <div className="text-center text-gray-500 font-medium">
          Question {currentQuestion} of {totalQuestions}
        </div>

        <motion.button
          whileHover={{ scale: canProceedToNext() ? 1.05 : 1 }}
          whileTap={{ scale: canProceedToNext() ? 0.95 : 1 }}
          onClick={onNext}
          disabled={!canProceedToNext()}
          className={`btn-primary text-xl px-8 py-4 ${
            canProceedToNext()
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {canProceedToNext() ? 'Continue 🎨' : 'Please complete'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Question4DestinationApproach;
