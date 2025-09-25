import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Question2DurationProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

interface DurationData {
  dates: {
    status: 'decided' | 'in_mind' | 'undecided' | '';
    startDate: string;
    endDate: string;
    seasonPreference?: 'peak' | 'off' | 'flexible' | '';
  };
  duration: {
    status: 'decided' | 'in_mind' | 'undecided' | '';
    days: string;
    weeks: string;
    months: string;
    minDays: string;
    minWeeks: string;
    minMonths: string;
    maxDays: string;
    maxWeeks: string;
    maxMonths: string;
  };
}

const Question2Duration: React.FC<Question2DurationProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  const [durationData, setDurationData] = useState<DurationData>({
    dates: {
      status: '',
      startDate: '',
      endDate: '',
      seasonPreference: ''
    },
    duration: {
      status: '',
      days: '',
      weeks: '',
      months: '',
      minDays: '',
      minWeeks: '',
      minMonths: '',
      maxDays: '',
      maxWeeks: '',
      maxMonths: ''
    }
  });

  // Function to calculate duration from dates
  const calculateDurationFromDates = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return {
        months: months.toString(),
        days: remainingDays.toString(),
        weeks: Math.floor(remainingDays / 7).toString()
      };
    } else if (diffDays >= 7) {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      return {
        weeks: weeks.toString(),
        days: remainingDays.toString(),
        months: '0'
      };
    } else {
      return {
        days: diffDays.toString(),
        weeks: '0',
        months: '0'
      };
    }
  };

  useEffect(() => {
    console.log('Question2Duration - Saving duration data:', durationData);
    onAnswer(currentQuestion, { duration: durationData });
  }, [durationData, onAnswer, currentQuestion]);

  // Auto-calculate duration when dates are decided
  useEffect(() => {
    if (durationData.dates.status === 'decided' && durationData.dates.startDate && durationData.dates.endDate) {
      const calculatedDuration = calculateDurationFromDates(durationData.dates.startDate, durationData.dates.endDate);
      if (calculatedDuration) {
        setDurationData(prev => ({
          ...prev,
          duration: {
            ...prev.duration,
            status: 'decided',
            days: calculatedDuration.days,
            weeks: calculatedDuration.weeks,
            months: calculatedDuration.months,
            minDays: calculatedDuration.days,
            minWeeks: calculatedDuration.weeks,
            minMonths: calculatedDuration.months,
            maxDays: calculatedDuration.days,
            maxWeeks: calculatedDuration.weeks,
            maxMonths: calculatedDuration.months
          }
        }));
      }
    }
  }, [durationData.dates.status, durationData.dates.startDate, durationData.dates.endDate]);

  // Auto-reset dates when duration changes from decided to in_mind/undecided
  useEffect(() => {
    if (durationData.dates.status === 'decided' && 
        (durationData.duration.status === 'in_mind' || durationData.duration.status === 'undecided')) {
      // Show a brief warning and then reset dates
      const timer = setTimeout(() => {
        setDurationData(prev => ({
          ...prev,
          dates: {
            ...prev.dates,
            status: '',
            startDate: '',
            endDate: '',
            seasonPreference: ''
          }
        }));
      }, 100); // Small delay to show the change
      
      return () => clearTimeout(timer);
    }
  }, [durationData.duration.status, durationData.dates.status]);

  // Load previous answers on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        console.log('Question2Duration - Loading saved preferences:', preferences);
        if (preferences.duration) {
          console.log('Question2Duration - Setting duration data:', preferences.duration);
          setDurationData(preferences.duration);
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  const handleDatesStatusChange = (status: 'decided' | 'in_mind' | 'undecided') => {
    setDurationData(prev => ({
      ...prev,
      dates: {
        ...prev.dates,
        status,
        startDate: '',
        endDate: '',
        seasonPreference: ''
      }
    }));
  };

  const handleDurationStatusChange = (status: 'decided' | 'in_mind' | 'undecided') => {
    setDurationData(prev => ({
      ...prev,
      duration: {
        ...prev.duration,
        status,
        days: '',
        weeks: '',
        months: '',
        minDays: '',
        minWeeks: '',
        minMonths: '',
        maxDays: '',
        maxWeeks: '',
        maxMonths: ''
      }
    }));
  };

  const handleDatesChange = (field: 'startDate' | 'endDate', value: string) => {
    setDurationData(prev => ({
      ...prev,
      dates: { ...prev.dates, [field]: value }
    }));
  };

  const handleDurationChange = (field: keyof DurationData['duration'], value: string) => {
    setDurationData(prev => ({
      ...prev,
      duration: { ...prev.duration, [field]: value }
    }));
  };

  const canProceedToNext = () => {
    // Both categories must have a status selected
    return durationData.duration.status !== '' && 
           durationData.dates.status !== '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          📅 Trip Duration & Timing
        </h2>
        <p className="text-lg text-gray-600">
          Help us understand your timing preferences and constraints
        </p>
        
        {/* Progress Indicators */}
        <div className="flex justify-center space-x-6 mt-6">
          <div className={`flex items-center space-x-2 ${durationData.dates.status ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${durationData.dates.status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Dates</span>
          </div>
          <div className={`flex items-center space-x-2 ${durationData.duration.status ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${durationData.duration.status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Duration</span>
          </div>
        </div>
      </div>

      {/* 3x3 Grid Layout */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Header Row */}
        <div className="bg-gray-100 p-4 rounded-lg text-center font-bold text-gray-800">
          Category
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center font-bold text-green-800">
          <div>📅 Dates</div>
          <div className="text-xs font-normal text-green-600 mt-1">
            When you'll travel
          </div>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg text-center font-bold text-blue-800">
          <div>⏱️ Duration</div>
          <div className="text-xs font-normal text-blue-600 mt-1">
            How long you'll stay
          </div>
        </div>

        {/* Status Options Row 1: Decided */}
        <div className="bg-gray-50 p-4 rounded-lg font-semibold text-gray-700">
          ✅ Decided
        </div>
        <div className="p-2">
          <button
            onClick={() => handleDatesStatusChange('decided')}
            className={`w-full p-3 rounded-lg transition-all ${
              durationData.dates.status === 'decided'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {durationData.dates.status === 'decided' ? '✓' : 'Select'}
          </button>
        </div>
        <div className="p-2">
          <button
            onClick={() => handleDurationStatusChange('decided')}
            className={`w-full p-3 rounded-lg transition-all relative ${
              durationData.duration.status === 'decided'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {durationData.duration.status === 'decided' ? '✓' : 'Select'}
            {durationData.dates.status === 'decided' && durationData.duration.status !== 'decided' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">🔄</span>
              </div>
            )}
          </button>
        </div>

        {/* Status Options Row 2: In Mind */}
        <div className="bg-gray-50 p-4 rounded-lg font-semibold text-gray-700">
          💭 In Mind
        </div>
        <div className="p-2">
          <button
            onClick={() => handleDatesStatusChange('in_mind')}
            className={`w-full p-3 rounded-lg transition-all ${
              durationData.dates.status === 'in_mind'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {durationData.dates.status === 'in_mind' ? '✓' : 'Select'}
          </button>
        </div>
        <div className="p-2">
          <button
            onClick={() => handleDurationStatusChange('in_mind')}
            className={`w-full p-3 rounded-lg transition-all relative ${
              durationData.duration.status === 'in_mind'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {durationData.duration.status === 'in_mind' ? '✓' : 'Select'}
            {durationData.dates.status === 'decided' && durationData.duration.status !== 'in_mind' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">🔄</span>
              </div>
            )}
          </button>
        </div>

        {/* Status Options Row 3: Undecided */}
        <div className="bg-gray-50 p-4 rounded-lg font-semibold text-gray-700">
          🤷‍♂️ Undecided
        </div>
        <div className="p-2">
          <button
            onClick={() => handleDatesStatusChange('undecided')}
            className={`w-full p-3 rounded-lg transition-all ${
              durationData.dates.status === 'undecided'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {durationData.dates.status === 'undecided' ? '✓' : 'Select'}
          </button>
        </div>
        <div className="p-2">
          <button
            onClick={() => handleDurationStatusChange('undecided')}
            className={`w-full p-3 rounded-lg transition-all relative ${
              durationData.duration.status === 'undecided'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {durationData.duration.status === 'undecided' ? '✓' : 'Select'}
            {durationData.dates.status === 'decided' && durationData.duration.status !== 'undecided' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">🔄</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Dates Details */}
      {(durationData.dates.status === 'decided' || durationData.dates.status === 'in_mind') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-green-50 rounded-xl"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            📆 {durationData.dates.status === 'decided' ? 'Select your travel dates:' : 'When might you travel?'}
          </h4>
          <p className="text-sm text-green-700 mb-4">
            {durationData.dates.status === 'decided' 
              ? 'Choose the exact start and end dates for your trip'
              : 'Give us a general idea of when you\'re considering travel'
            }
          </p>
          
          {/* Info message for decided dates */}
          {durationData.dates.status === 'decided' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> When you select specific dates, the trip duration will be automatically calculated. 
                You can still change the duration status if you prefer a different approach.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {durationData.dates.status === 'decided' ? 'Start Date' : 'Earliest Start Date'}
              </label>
              <input
                type="date"
                value={durationData.dates.startDate}
                onChange={(e) => handleDatesChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {durationData.dates.status === 'decided' ? 'End Date' : 'Latest End Date'}
              </label>
              <input
                type="date"
                value={durationData.dates.endDate}
                onChange={(e) => handleDatesChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Dates Details - Undecided */}
      {durationData.dates.status === 'undecided' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-green-50 rounded-xl"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            📆 When are you available to travel?
          </h4>
          <p className="text-sm text-green-700 mb-4">
            Let us know your general availability for travel
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Season Preference</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setDurationData(prev => ({
                    ...prev,
                    dates: { ...prev.dates, seasonPreference: 'peak' }
                  }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    durationData.dates.seasonPreference === 'peak'
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🌞</div>
                  <div className="font-medium">Peak Season</div>
                  <div className="text-xs text-gray-600">Summer, Holidays</div>
                </button>
                <button
                  onClick={() => setDurationData(prev => ({
                    ...prev,
                    dates: { ...prev.dates, seasonPreference: 'off' }
                  }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    durationData.dates.seasonPreference === 'off'
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🍂</div>
                  <div className="font-medium">Off Season</div>
                  <div className="text-xs text-gray-600">Shoulder, Low</div>
                </button>
                <button
                  onClick={() => setDurationData(prev => ({
                    ...prev,
                    dates: { ...prev.dates, seasonPreference: 'flexible' }
                  }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    durationData.dates.seasonPreference === 'flexible'
                      ? 'border-purple-500 bg-purple-50 text-purple-800'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🔄</div>
                  <div className="font-medium">Flexible</div>
                  <div className="text-xs text-gray-600">Any time</div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Duration Details */}
      {durationData.duration.status === 'decided' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-blue-50 rounded-xl"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            ⏱️ How long will you stay?
          </h4>
          <p className="text-sm text-blue-700 mb-4">
            Specify the exact duration of your trip
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
              <input
                type="number"
                min="0"
                value={durationData.duration.days}
                onChange={(e) => handleDurationChange('days', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weeks</label>
              <input
                type="number"
                min="0"
                value={durationData.duration.weeks}
                onChange={(e) => handleDurationChange('weeks', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Months</label>
              <input
                type="number"
                min="0"
                value={durationData.duration.months}
                onChange={(e) => handleDurationChange('months', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
          
          {/* Auto-conversion display */}
          {(parseInt(durationData.duration.days) > 0 || parseInt(durationData.duration.weeks) > 0 || parseInt(durationData.duration.months) > 0) && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Total Duration:</span> {
                  [
                    durationData.duration.months && parseInt(durationData.duration.months) > 0 ? `${durationData.duration.months} month${parseInt(durationData.duration.months) > 1 ? 's' : ''}` : '',
                    durationData.duration.weeks && parseInt(durationData.duration.weeks) > 0 ? `${durationData.duration.weeks} week${parseInt(durationData.duration.weeks) > 1 ? 's' : ''}` : '',
                    durationData.duration.days && parseInt(durationData.duration.days) > 0 ? `${durationData.duration.days} day${parseInt(durationData.duration.days) > 1 ? 's' : ''}` : ''
                  ].filter(Boolean).join(', ') || 'No duration specified'
                }
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Duration Details - In Mind */}
      {durationData.duration.status === 'in_mind' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-blue-50 rounded-xl"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            ⏱️ How long might you stay?
          </h4>
          <p className="text-sm text-blue-700 mb-4">
            Give us a range of possible durations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-md font-medium text-green-700 mb-3">Minimum Duration:</h5>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                  <input
                    type="number"
                    min="0"
                    value={durationData.duration.minDays}
                    onChange={(e) => handleDurationChange('minDays', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weeks</label>
                  <input
                    type="number"
                    min="0"
                    value={durationData.duration.minWeeks}
                    onChange={(e) => handleDurationChange('minWeeks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Months</label>
                  <input
                    type="number"
                    min="0"
                    value={durationData.duration.minMonths}
                    onChange={(e) => handleDurationChange('minMonths', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-md font-medium text-red-700 mb-3">Maximum Duration:</h5>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                  <input
                    type="number"
                    min="0"
                    value={durationData.duration.maxDays}
                    onChange={(e) => handleDurationChange('maxDays', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weeks</label>
                  <input
                    type="number"
                    min="0"
                    value={durationData.duration.maxWeeks}
                    onChange={(e) => handleDurationChange('maxWeeks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Months</label>
                  <input
                    type="number"
                    min="0"
                    value={durationData.duration.maxMonths}
                    onChange={(e) => handleDurationChange('maxMonths', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        
        <div className="text-sm text-gray-500">
          Question {currentQuestion} of {totalQuestions}
        </div>
        
        <button
          onClick={onNext}
          disabled={!canProceedToNext()}
          className={`px-6 py-3 rounded-xl transition-colors ${
            canProceedToNext()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canProceedToNext() ? 'Next' : 'Complete Both Sections'}
        </button>
      </div>
    </motion.div>
  );
};

export default Question2Duration;