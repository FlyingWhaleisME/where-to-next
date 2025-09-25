import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TransportationSectionProps {
  onAnswer: (sectionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentSection: number;
  totalSections: number;
  canProceed: boolean;
}

const TransportationSection: React.FC<TransportationSectionProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentSection,
  totalSections,
  canProceed
}) => {
  // Load existing data from localStorage
  const getExistingData = () => {
    const saved = localStorage.getItem('tripTracingState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        return state.transportation || {};
      } catch (error) {
        console.error('Error parsing trip tracing state:', error);
      }
    }
    return {};
  };

  const existingData = getExistingData();

  const [selectedTransportation, setSelectedTransportation] = useState<string[]>(existingData.selectedMethods || []);

  const handleTransportationToggle = (value: string) => {
    if (value === 'dont-mind') {
      if (selectedTransportation.includes('dont-mind')) {
        // Deselect "I don't mind" if already selected
        setSelectedTransportation([]);
      } else {
        // "I don't mind" is exclusive - clear all other selections
        setSelectedTransportation(['dont-mind']);
      }
    } else {
      // Remove "I don't mind" if selecting specific options
      const withoutDontMind = selectedTransportation.filter(item => item !== 'dont-mind');
      
      if (selectedTransportation.includes(value)) {
        // Remove if already selected
        setSelectedTransportation(selectedTransportation.filter(item => item !== value));
      } else {
        // Add to selection
        setSelectedTransportation([...withoutDontMind, value]);
      }
    }
  };
  const [changeThroughTrip, setChangeThroughTrip] = useState(existingData.changeThroughTrip || false);
  const [changeType, setChangeType] = useState(existingData.changeType || false);

  useEffect(() => {
    const answer = {
      transportation: {
        selectedMethods: selectedTransportation,
        changeThroughTrip,
        changeType
      }
    };
    onAnswer(currentSection, answer);
  }, [selectedTransportation, changeThroughTrip, changeType, currentSection, onAnswer]);

  const transportationOptions = [
    { value: 'rental-car', label: '🚗 Rental Car', description: 'Freedom to explore at your own pace' },
    { value: 'public-transport', label: '🚌 Public Transportation', description: 'Buses, trains, metro systems' },
    { value: 'ride-sharing', label: '🚕 Ride Sharing', description: 'Uber, Lyft, local ride apps' },
    { value: 'walking-biking', label: '🚶‍♂️ Walking & Biking', description: 'Explore on foot or rent bikes' },
    { value: 'taxis', label: '🚖 Taxis', description: 'Traditional taxi services' },
    { value: 'dont-mind', label: '🤷‍♂️ I don\'t mind', description: 'Open to any transportation method' }
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
          🚌 What would you prefer for getting around WITHIN your destination?
        </h2>
        <p className="text-xl text-gray-600">
          Select your preferences in order of priority (may vary by destination)
        </p>
      </div>

      {/* Transportation Type Selection */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Select your transportation preferences (in order of priority):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transportationOptions.map((option) => {
            const isSelected = selectedTransportation.includes(option.value);
            const rank = selectedTransportation.indexOf(option.value) + 1;
            const isDontMind = option.value === 'dont-mind';
            const dontMindSelected = selectedTransportation.includes('dont-mind');
            
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTransportationToggle(option.value)}
                disabled={!isDontMind && dontMindSelected}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative ${
                  isSelected
                    ? isDontMind 
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-blue-500 bg-blue-50 shadow-lg'
                    : (!isDontMind && dontMindSelected)
                      ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {isSelected && !isDontMind && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    #{rank}
                  </div>
                )}
                <div className="text-3xl mb-3">{option.label.split(' ')[0]}</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {option.label.split(' ').slice(1).join(' ')}
                </h4>
                <p className="text-gray-600 text-sm">{option.description}</p>
                {isDontMind && dontMindSelected && (
                  <div className="mt-2 text-purple-600 text-sm font-medium">
                    ✨ Other options disabled
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Additional Options */}
      {selectedTransportation.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-8"
        >
          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Transportation Flexibility</h4>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={changeThroughTrip}
                  onChange={(e) => setChangeThroughTrip(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  I might change transportation methods during my trip
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={changeType}
                  onChange={(e) => setChangeType(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  I'm open to changing my transportation preference based on recommendations
                </span>
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {selectedTransportation.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-8"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-3">✅ Your Local Transportation Preferences:</h4>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Preferences:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTransportation.map((value, index) => {
                const option = transportationOptions.find(opt => opt.value === value);
                const isDontMind = value === 'dont-mind';
                return (
                  <span 
                    key={value} 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDontMind 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {!isDontMind && `#${index + 1} `}{option?.label || value}
                  </span>
                );
              })}
            </div>
            {changeThroughTrip && (
              <p className="text-sm">💡 Open to changing methods during the trip</p>
            )}
            {changeType && (
              <p className="text-sm">🔄 Open to recommendation-based changes</p>
            )}
          </div>
        </motion.div>
      )}

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
          whileHover={{ scale: selectedTransportation.length > 0 ? 1.05 : 1 }}
          whileTap={{ scale: selectedTransportation.length > 0 ? 0.95 : 1 }}
          onClick={onNext}
          disabled={selectedTransportation.length === 0}
          className={`btn-primary text-lg px-8 py-4 ${
            selectedTransportation.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {selectedTransportation.length > 0 ? 'Continue →' : 'Please select at least one transportation preference'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TransportationSection;
