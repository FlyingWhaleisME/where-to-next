import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AccommodationSectionProps {
  onAnswer: (sectionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentSection: number;
  totalSections: number;
  canProceed: boolean;
}

const AccommodationSection: React.FC<AccommodationSectionProps> = ({
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
        return state.accommodation || {};
      } catch (error) {
        console.error('Error parsing trip tracing state:', error);
      }
    }
    return {};
  };

  const existingData = getExistingData();

  const [selectedAccommodation, setSelectedAccommodation] = useState<string[]>(existingData.selectedTypes || []);
  const [changeThroughTrip, setChangeThroughTrip] = useState<boolean>(existingData.changeThroughTrip || false);
  const [changeType, setChangeType] = useState<boolean>(existingData.changeType || false);

  const accommodationOptions = [
    { value: 'hotel', label: 'Hotel', emoji: '🏨', description: 'Traditional hotel accommodation' },
    { value: 'hostel', label: 'Hostel', emoji: '🛏️', description: 'Budget-friendly shared accommodation' },
    { value: 'airbnb', label: 'Airbnb', emoji: '🏠', description: 'Private home or apartment rental' },
    { value: 'resort', label: 'Resort', emoji: '🏖️', description: 'All-inclusive resort experience' },
    { value: 'guesthouse', label: 'Guesthouse', emoji: '🏡', description: 'Local family-run accommodation' },
    { value: 'camping', label: 'Camping', emoji: '⛺', description: 'Outdoor camping experience' },
    { value: 'dont-mind', label: 'I don\'t mind', emoji: '🤷‍♂️', description: 'Open to any accommodation type' }
  ];

  const handleAccommodationToggle = (value: string) => {
    if (value === 'dont-mind') {
      if (selectedAccommodation.includes('dont-mind')) {
        // Deselect "I don't mind" if already selected
        setSelectedAccommodation([]);
      } else {
        // "I don't mind" is exclusive - clear all other selections
        setSelectedAccommodation(['dont-mind']);
      }
    } else {
      // Remove "I don't mind" if selecting specific options
      const withoutDontMind = selectedAccommodation.filter(item => item !== 'dont-mind');
      
      if (selectedAccommodation.includes(value)) {
        // Remove if already selected
        setSelectedAccommodation(selectedAccommodation.filter(item => item !== value));
      } else {
        // Add to selection
        setSelectedAccommodation([...withoutDontMind, value]);
      }
    }
  };

  useEffect(() => {
    const answer = {
      accommodation: {
        selectedTypes: selectedAccommodation,
        changeThroughTrip,
        changeType
      }
    };
    onAnswer(currentSection, answer);
  }, [selectedAccommodation, changeThroughTrip, changeType, currentSection, onAnswer]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🏨 What accommodation styles do you prefer?
        </h2>
        <p className="text-lg text-gray-600">
          Select your preferences in order of priority (may vary by destination)
        </p>
      </div>

      {/* Accommodation Type Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Select your accommodation preferences (in order of priority):</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accommodationOptions.map((option) => {
            const isSelected = selectedAccommodation.includes(option.value);
            const rank = selectedAccommodation.indexOf(option.value) + 1;
            const isDontMind = option.value === 'dont-mind';
            const dontMindSelected = selectedAccommodation.includes('dont-mind');
            
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccommodationToggle(option.value)}
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
                <div className="text-4xl mb-3">{option.emoji}</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{option.label}</h4>
                <p className="text-gray-600">{option.description}</p>
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

      {/* Flexibility Options */}
      {selectedAccommodation.length > 0 && (
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">How flexible are you with accommodation?</h3>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="changeThroughTrip"
            checked={changeThroughTrip}
            onChange={(e) => setChangeThroughTrip(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="changeThroughTrip" className="text-lg text-gray-700">
            Change accommodations through the trip
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="changeType"
            checked={changeType}
            onChange={(e) => setChangeType(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="changeType" className="text-lg text-gray-700">
            Change accommodation type too
          </label>
        </div>
        </div>
      )}

      {/* Summary */}
      {selectedAccommodation.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-8"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-3">✅ Your Accommodation Preferences:</h4>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Preferences:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedAccommodation.map((value, index) => {
                const option = accommodationOptions.find(opt => opt.value === value);
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
                    {!isDontMind && `#${index + 1} `}{option?.emoji} {option?.label || value}
                  </span>
                );
              })}
            </div>
            {changeThroughTrip && (
              <p className="text-sm">💡 Open to changing accommodations during the trip</p>
            )}
            {changeType && (
              <p className="text-sm">🔄 Open to changing accommodation types</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
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

        <motion.button
          whileHover={{ scale: selectedAccommodation.length > 0 ? 1.05 : 1 }}
          whileTap={{ scale: selectedAccommodation.length > 0 ? 0.95 : 1 }}
          onClick={onNext}
          disabled={selectedAccommodation.length === 0}
          className={`btn-primary text-lg px-8 py-4 ${
            selectedAccommodation.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {selectedAccommodation.length > 0 ? 'Continue →' : 'Please select at least one accommodation preference'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AccommodationSection; 