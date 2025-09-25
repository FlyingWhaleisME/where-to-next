import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TravelMethodSectionProps {
  onAnswer: (sectionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentSection: number;
  totalSections: number;
}

interface TravelMethodData {
  travelMethod: 'flights' | 'driving' | 'public_transport' | 'undecided';
  publicTransportType?: 'train' | 'bus' | 'ferry' | 'cruise' | 'other';
  publicTransportDetails?: string;
}

const TravelMethodSection: React.FC<TravelMethodSectionProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentSection,
  totalSections
}) => {
  // Load existing data from localStorage
  const getExistingData = () => {
    const saved = localStorage.getItem('tripTracingState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        return state.travelMethod || {};
      } catch (error) {
        console.error('Error parsing trip tracing state:', error);
      }
    }
    return {};
  };

  const existingData = getExistingData();
  
  const [travelMethodData, setTravelMethodData] = useState<TravelMethodData>({
    travelMethod: existingData.travelMethod || 'undecided',
    publicTransportType: existingData.publicTransportType,
    publicTransportDetails: existingData.publicTransportDetails || ''
  });

  const [showPublicTransportOptions, setShowPublicTransportOptions] = useState(
    travelMethodData.travelMethod === 'public_transport'
  );

  useEffect(() => {
    console.log('Travel method data updated, calling onAnswer with:', travelMethodData);
    onAnswer(currentSection, { travelMethod: travelMethodData });
  }, [travelMethodData, currentSection, onAnswer]);

  const handleTravelMethodChange = (method: 'flights' | 'driving' | 'public_transport' | 'undecided') => {
    console.log('Travel method changed to:', method);
    setTravelMethodData(prev => ({
      ...prev,
      travelMethod: method,
      // Clear public transport details if switching away from public transport
      ...(method !== 'public_transport' && {
        publicTransportType: undefined,
        publicTransportDetails: ''
      })
    }));
    
    setShowPublicTransportOptions(method === 'public_transport');
  };

  const handlePublicTransportTypeChange = (type: 'train' | 'bus' | 'ferry' | 'cruise' | 'other') => {
    setTravelMethodData(prev => ({
      ...prev,
      publicTransportType: type,
      // Clear details if switching away from "other"
      ...(type !== 'other' && { publicTransportDetails: '' })
    }));
  };

  const handlePublicTransportDetailsChange = (details: string) => {
    setTravelMethodData(prev => ({
      ...prev,
      publicTransportDetails: details
    }));
  };

  const canProceedToNext = () => {
    // "undecided" is a valid choice - user wants AI guidance
    if (travelMethodData.travelMethod === 'undecided') return true;
    
    // No method selected yet
    if (!travelMethodData.travelMethod) return false;
    
    // For public transport, need to specify type
    if (travelMethodData.travelMethod === 'public_transport') {
      if (!travelMethodData.publicTransportType) return false;
      if (travelMethodData.publicTransportType === 'other' && !travelMethodData.publicTransportDetails?.trim()) {
        return false;
      }
    }
    
    return true;
  };

  // Get smart helper text based on Big Idea survey data
  const getHelperText = () => {
    const tripPreferences = localStorage.getItem('tripPreferences');
    if (tripPreferences) {
      try {
        const prefs = JSON.parse(tripPreferences);
        const travelType = prefs.destinationApproach?.travelType;
        const destinationStatus = prefs.destinationApproach?.destinationStatus;
        const destinations = prefs.destinationApproach?.specificDestinations;
        
        if (travelType === 'abroad') {
          return "✈️ International travel typically requires flights";
        }
        
        if (travelType === 'domestic') {
          return "🚗 You have more transportation options for domestic travel";
        }
        
        if (destinations?.some((dest: string) => 
          dest.toLowerCase().includes('hawaii') || 
          dest.toLowerCase().includes('island') ||
          dest.toLowerCase().includes('alaska')
        )) {
          return "🏝️ Some destinations may require specific transportation methods";
        }
        
        if (destinationStatus === 'open') {
          return "🌍 Consider your transportation preferences as we plan your destinations";
        }
      } catch (error) {
        console.error('Error parsing trip preferences:', error);
      }
    }
    
    return "Choose your preferred transportation method for this trip";
  };

  const transportationOptions = [
    {
      id: 'flights',
      emoji: '✈️',
      title: 'I need flights',
      description: 'Flying to my destination(s)'
    },
    {
      id: 'driving',
      emoji: '🚗',
      title: "I'm driving",
      description: 'Road trip or driving to my destination'
    },
    {
      id: 'public_transport',
      emoji: '🚂',
      title: 'Other transportation',
      description: 'Train, bus, ferry, cruise, or other transport'
    },
    {
      id: 'undecided',
      emoji: '🤔',
      title: "Haven't decided yet",
      description: 'I need help choosing - show me all transportation options and get AI guidance'
    }
  ];

  const publicTransportOptions = [
    {
      id: 'train',
      emoji: '🚂',
      title: 'Train',
      description: 'Amtrak, regional rail, international rail'
    },
    {
      id: 'bus',
      emoji: '🚌',
      title: 'Bus',
      description: 'Greyhound, Megabus, local transit'
    },
    {
      id: 'ferry',
      emoji: '🚢',
      title: 'Ferry/Boat',
      description: 'Island ferries, cross-water transport'
    },
    {
      id: 'cruise',
      emoji: '🛳️',
      title: 'Cruise',
      description: 'Cruise ship as primary transport'
    },
    {
      id: 'other',
      emoji: '🚁',
      title: 'Other',
      description: 'Helicopter, charter, or other method'
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
          🚀 How are you getting TO your destination?
        </h2>
        <p className="text-xl text-gray-600 mb-2">
          {getHelperText()}
        </p>
        <p className="text-sm text-gray-500">
          This helps us provide transportation-specific booking advice and strategies
        </p>
      </div>

      {/* Transportation Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {transportationOptions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTravelMethodChange(option.id as any)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              travelMethodData.travelMethod === option.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="text-4xl mb-3">{option.emoji}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {option.title}
            </h3>
            <p className="text-gray-600">{option.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Public Transportation Type Selection */}
      <AnimatePresence>
        {showPublicTransportOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              What type of transportation are you considering?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {publicTransportOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePublicTransportTypeChange(option.id as any)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                    travelMethodData.publicTransportType === option.id
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">
                    {option.title}
                  </h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Other Transportation Details */}
            {travelMethodData.publicTransportType === 'other' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <label htmlFor="transport-details" className="block text-lg font-medium text-gray-700 mb-2">
                  Please specify your transportation method:
                </label>
                <input
                  id="transport-details"
                  type="text"
                  value={travelMethodData.publicTransportDetails}
                  onChange={(e) => handlePublicTransportDetailsChange(e.target.value)}
                  placeholder="e.g., Helicopter, Private charter, RV, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </motion.div>
            )}
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
            <h4 className="text-lg font-semibold text-gray-800 mb-3">✅ Your Travel Method Plan:</h4>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Method:</span> {
                  travelMethodData.travelMethod === 'flights' ? '✈️ Flying' :
                  travelMethodData.travelMethod === 'driving' ? '🚗 Driving' :
                  travelMethodData.travelMethod === 'public_transport' ? '🚂 Public Transportation' :
                  '🤔 Need guidance'
                }
              </p>
              {travelMethodData.travelMethod === 'public_transport' && travelMethodData.publicTransportType && (
                <p>
                  <span className="font-medium">Type:</span> {
                    travelMethodData.publicTransportType === 'train' ? '🚂 Train' :
                    travelMethodData.publicTransportType === 'bus' ? '🚌 Bus' :
                    travelMethodData.publicTransportType === 'ferry' ? '🚢 Ferry/Boat' :
                    travelMethodData.publicTransportType === 'cruise' ? '🛳️ Cruise' :
                    `🚁 ${travelMethodData.publicTransportDetails}`
                  }
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              💡 Our AI will provide specific booking strategies and resources for your transportation method
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          className="btn-secondary text-lg px-8 py-4"
        >
          ← Previous
        </button>
        
        <span className="text-gray-500">
          Section {currentSection} of {totalSections}
        </span>
        
        <motion.button
          whileHover={{ scale: canProceedToNext() ? 1.05 : 1 }}
          whileTap={{ scale: canProceedToNext() ? 0.95 : 1 }}
          onClick={onNext}
          disabled={!canProceedToNext()}
          className={`btn-primary text-lg px-8 py-4 ${
            canProceedToNext()
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {canProceedToNext() ? 
            (travelMethodData.travelMethod === 'flights' || travelMethodData.travelMethod === 'undecided' ? 
              'Continue to Flight Details →' : 
              'Continue to Local Transportation →'
            ) : 
            'Please select your transportation method'
          }
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TravelMethodSection;