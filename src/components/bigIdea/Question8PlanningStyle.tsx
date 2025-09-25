import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Question8PlanningStyleProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

const Question8PlanningStyle: React.FC<Question8PlanningStyleProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  const [planningStyle, setPlanningStyle] = useState<number>(50);
  const [leewayExplanation, setLeewayExplanation] = useState<string>('');
  const [showLeewayInput, setShowLeewayInput] = useState<boolean>(false);

  // Load previous answers on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.planningStyle !== undefined) {
          setPlanningStyle(preferences.planningStyle);
        }
        if (preferences.leewayExplanation) {
          setLeewayExplanation(preferences.leewayExplanation);
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  // Update leeway input visibility when planning style changes
  useEffect(() => {
    // Only show for balanced planning style (26-50%)
    setShowLeewayInput(planningStyle >= 26 && planningStyle <= 50);
  }, [planningStyle]);

  // Send answer whenever planning style or leeway explanation changes
  useEffect(() => {
    const answer = {
      planningStyle,
      leewayExplanation: showLeewayInput ? leewayExplanation : undefined
    };
    onAnswer(8, answer);
  }, [planningStyle, leewayExplanation, showLeewayInput, onAnswer]);

  const handlePlanningStyleChange = (value: number) => {
    setPlanningStyle(value);
  };

  const handleLeewayExplanationChange = (value: string) => {
    setLeewayExplanation(value);
  };

  const getPlanningStyleText = (value: number): string => {
    if (value <= 25) return 'Lazy - Last-minute activity choices';
    if (value <= 50) return 'Balanced - Built-in recess approach';
    if (value <= 75) return 'Organized - Packed activity schedules';
    return 'Very Organized - Multiple options for every situation';
  };

  const getPlanningStyleDescription = (value: number): string => {
    if (value <= 25) return 'No time-slot planning. Choose when to do the listed activities at the last minute based on mood or energy.';
    if (value <= 50) return 'Plan activities with built-in recess time for spontaneity. We need time to take a break and enjoy the moment.';
    if (value <= 75) return 'Packed schedule with activities where rest is planned too. Concrete and detailed plans with specific time slots';
    return 'Multiple options and contingency plans for both expected and unexpected situations. Nothing out of touch';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          How much do you like to plan? 📋
        </h2>
        <p className="text-gray-600 text-lg">
          Help us understand your planning style so we can tailor recommendations to your preferences.
        </p>
      </div>

      {/* Planning Style Slider */}
      <div className="mb-8">
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {planningStyle}%
            </div>
            <div className="text-xl font-semibold text-gray-800 mb-2">
              {getPlanningStyleText(planningStyle)}
            </div>
            <div className="text-gray-600">
              {getPlanningStyleDescription(planningStyle)}
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={planningStyle}
              onChange={(e) => handlePlanningStyleChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${planningStyle}%, #E5E7EB ${planningStyle}%, #E5E7EB 100%)`
              }}
            />
            
            {/* Slider Labels */}
            <div className="flex justify-between mt-4 text-sm text-gray-500">
              <span>Lazy</span>
              <span>Very Organized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leeway Explanation Section */}
      {showLeewayInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Explain your built-in recess approach 🤔
            </h3>
            <p className="text-blue-700 mb-4">
              Since you prefer a balanced planning style with built-in flexibility, help us understand how you like to structure your recess time and spontaneous decision-making.
            </p>
            <textarea
              value={leewayExplanation}
              onChange={(e) => handleLeewayExplanationChange(e.target.value)}
              placeholder="e.g., I plan morning activities but leave afternoons free for spontaneous discoveries. I book accommodation and main attractions but keep meal times flexible. I like to have 2-3 backup options ready for each day..."
              rows={4}
              className="w-full p-4 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-blue-600 mt-2">
              This explanation will be included in your travel companion contract to help your group understand your built-in recess approach.
            </p>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={currentQuestion === 1}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            currentQuestion === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ← Previous
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-500">
            {currentQuestion} of {totalQuestions}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed || (showLeewayInput && !leewayExplanation.trim())}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            canProceed && (!showLeewayInput || leewayExplanation.trim())
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

export default Question8PlanningStyle;
