import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlightSectionProps {
  onAnswer: (sectionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentSection: number;
  totalSections: number;
  canProceed: boolean;
}

const FlightSection: React.FC<FlightSectionProps> = ({
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
        return state.flight || {};
      } catch (error) {
        console.error('Error parsing trip tracing state:', error);
      }
    }
    return {};
  };

  const existingData = getExistingData();

  const [priority, setPriority] = useState<string>(existingData.priority || '');
  const [explanation, setExplanation] = useState<string>(existingData.explanation || '');
  const [flightType, setFlightType] = useState<string>(existingData.flightType || '');
  const [strategyChoice, setStrategyChoice] = useState<'provide' | 'get_ai' | ''>('');
  const [customStrategy, setCustomStrategy] = useState<string>('');
  const [strategyName, setStrategyName] = useState<string>('');
  const [savedStrategies, setSavedStrategies] = useState<any[]>([]);
  const [selectedSavedStrategy, setSelectedSavedStrategy] = useState<string>('');

  useEffect(() => {
    // Load saved flight strategies from localStorage
    const saved = localStorage.getItem('flightStrategies');
    if (saved) {
      try {
        setSavedStrategies(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing flight strategies:', error);
      }
    }
  }, []);

  useEffect(() => {
    const answer = {
      flight: {
        priority,
        explanation,
        flightType,
        strategyChoice,
        customStrategy,
        selectedSavedStrategy
      }
    };
    onAnswer(currentSection, answer);
  }, [priority, explanation, flightType, strategyChoice, customStrategy, selectedSavedStrategy, currentSection, onAnswer]);

  const saveStrategy = () => {
    if (customStrategy.trim() && strategyName.trim()) {
      const newStrategy = {
        id: `strategy_${Date.now()}`,
        name: strategyName.trim(),
        strategy: customStrategy.trim(),
        createdAt: new Date().toISOString()
      };

      const updatedStrategies = [...savedStrategies, newStrategy];
      setSavedStrategies(updatedStrategies);
      localStorage.setItem('flightStrategies', JSON.stringify(updatedStrategies));
      
      // Clear the input fields
      setCustomStrategy('');
      setStrategyName('');
      
      alert(`Flight strategy "${newStrategy.name}" saved successfully!`);
    }
  };

  const loadSavedStrategy = (strategyId: string) => {
    const strategy = savedStrategies.find(s => s.id === strategyId);
    if (strategy) {
      setCustomStrategy(strategy.strategy);
      setSelectedSavedStrategy(strategyId);
    }
  };

  const priorityOptions = [
    { value: 'time', label: 'Time Efficiency', emoji: '⏰', description: 'Fastest route possible' },
    { value: 'cost', label: 'Cost Savings', emoji: '💰', description: 'Cheapest option available' },
    { value: 'costEffectiveness', label: 'Cost-Effectiveness', emoji: '⚖️', description: 'Best value for money' }
  ];

  const flightTypeOptions = [
    { 
      value: 'direct', 
      label: 'Direct Flights', 
      emoji: '✈️', 
      description: 'Non-stop flights to destination',
      costInfo: 'Generally $200-800+ depending on distance and season',
      website: 'Check Google Flights, Skyscanner, or airline websites'
    },
    { 
      value: 'connecting', 
      label: 'Connecting Flights', 
      emoji: '🔄', 
      description: 'Flights with layovers',
      costInfo: 'Usually $150-600+ with potential savings of 20-40%',
      website: 'Compare on Kayak, Momondo, or Google Flights'
    },
    { 
      value: 'undecided', 
      label: 'Undecided', 
      emoji: '🤔', 
      description: 'Open to both options based on price/time',
      costInfo: 'Will compare both options when booking',
      website: 'Use comparison tools to decide'
    }
  ];

  const canProceedToNext = () => {
    // Basic requirements
    if (!priority || !flightType) return false;
    
    // Strategy requirements
    if (strategyChoice === 'provide') {
      // If providing strategy, need either custom strategy or selected saved strategy
      return customStrategy.trim() || selectedSavedStrategy;
    } else if (strategyChoice === 'get_ai') {
      // If getting AI strategy, no additional requirements
      return true;
    }
    
    // No strategy choice made yet
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ✈️ Flight Preferences
        </h2>
        <p className="text-lg text-gray-600">
          What's most important to you when booking flights?
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">What's your top priority for flights?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityOptions.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`option-card ${priority === option.value ? 'selected' : ''}`}
              onClick={() => setPriority(option.value)}
            >
              <div className="text-4xl mb-3">{option.emoji}</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{option.label}</h4>
              <p className="text-gray-600">{option.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">What type of flights do you prefer?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {flightTypeOptions.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`option-card ${flightType === option.value ? 'selected' : ''}`}
              onClick={() => setFlightType(option.value)}
            >
              <div className="text-4xl mb-3">{option.emoji}</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{option.label}</h4>
              <p className="text-gray-600 text-sm mb-2">{option.description}</p>
              <div className="text-xs text-blue-600 font-medium">
                <div>💰 {option.costInfo}</div>
                <div>🌐 {option.website}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Flight Strategy Choice */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Flight booking strategy approach:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStrategyChoice('provide')}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              strategyChoice === 'provide'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="text-3xl mb-3">✍️</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">I'll provide my strategy</h4>
            <p className="text-gray-600">I have my own flight booking approach I want to use</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStrategyChoice('get_ai')}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              strategyChoice === 'get_ai'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
            }`}
          >
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Get AI strategy</h4>
            <p className="text-gray-600">Let AI provide flight booking strategy and recommendations</p>
          </motion.button>
        </div>

        {/* Custom Strategy Input */}
        <AnimatePresence>
          {strategyChoice === 'provide' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Saved Strategies Selection */}
              {savedStrategies.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Use a saved strategy:</h4>
                  <select
                    value={selectedSavedStrategy}
                    onChange={(e) => {
                      setSelectedSavedStrategy(e.target.value);
                      if (e.target.value) {
                        loadSavedStrategy(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a saved strategy...</option>
                    {savedStrategies.map((strategy) => (
                      <option key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Strategy Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy Name (for saving):
                </label>
                <input
                  type="text"
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  placeholder="e.g., 'Budget International Flights', 'Last-Minute Domestic'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Custom Strategy Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Flight Booking Strategy:
                </label>
                <textarea
                  value={customStrategy}
                  onChange={(e) => setCustomStrategy(e.target.value)}
                  placeholder="Describe your flight booking approach, life-hacks, preferred websites, timing strategies, etc..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Save Strategy Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveStrategy}
                  disabled={!customStrategy.trim() || !strategyName.trim()}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    customStrategy.trim() && strategyName.trim()
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  💾 Save Strategy
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Flight Booking Strategy Footer */}
      <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-800 mb-3">Maybe check out some infos?</h4>
        <p className="text-blue-700 mb-3">
          Search for tips on flight booking strategies, best times to book, and money-saving hacks you wish your AI assistant would know.
        </p>
        <a
          href="https://www.google.com/search?q=flight+booking+strategy&oq=flight+booking+strategy&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgFGB4yCAgCEAAYBRgeMgcIAxAAGO8FMgcIBBAAGO8FMgcIBRAAGO8FMgcIBhAAGO8FMgcIBxAAGO8F0gEINDMzM2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔍 Flight Booking Strategies
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

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
          {canProceedToNext() ? 'Continue →' : 'Please complete flight preferences and strategy choice'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FlightSection; 