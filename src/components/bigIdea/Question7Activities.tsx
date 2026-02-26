import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Question7ActivitiesProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
  tripPreferences?: any;
}

const Question7Activities: React.FC<Question7ActivitiesProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed,
  tripPreferences: tripPreferencesProp
}) => {
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [vibeActivities, setVibeActivities] = useState<{[key: string]: string[]}>({});


  // Load vibes when this question becomes active AND whenever tripVibe changes.
  // React state updates are async, check both prop and localStorage
  // to handle the race condition where Q7 mounts before parent state updates.
  useEffect(() => {
    // Only run when we're actually on question 7
    if (currentQuestion !== 7) {
      return;
    }

    const loadVibes = () => {
      console.log('🔵🔵🔵 Q7 LOAD VIBES START 🔵🔵🔵');
      console.log('Question7 useEffect running. currentQuestion:', currentQuestion);
      console.log('Question7: tripPreferencesProp:', tripPreferencesProp);
      console.log('Question7: tripPreferencesProp?.tripVibe:', tripPreferencesProp?.tripVibe);
      console.log('Question7: selectedVibes.length (before load) =', selectedVibes.length);

      // Get preferences - check prop first, then localStorage as fallback
      let preferences = tripPreferencesProp;
      let tripVibe = preferences?.tripVibe;
      
      // If prop doesn't have tripVibe yet (race condition), check localStorage
      if (!tripVibe) {
        console.log('Question7: tripVibe not in prop, checking localStorage...');
        const { getUserData } = require('../../utils/userDataStorage');
        const savedPrefs = getUserData('tripPreferences');
        if (savedPrefs?.tripVibe) {
          tripVibe = savedPrefs.tripVibe;
          preferences = savedPrefs;
          console.log('Question7: Found tripVibe in localStorage:', tripVibe);
        }
      }

      console.log('Question7: Final tripVibe value:', tripVibe);

      // Parse vibes from the comma-separated string (or array)
      if (tripVibe) {
        const validVibeOptions = ['relaxation', 'entertainment', 'educational', 'cultural', 'shared', 'culinary'];

        // Support legacy stored formats:
        // - Values: "relaxation, entertainment"
        // - Labels: "Relaxation, Entertainment"
        // - Emoji labels: "😌 Relaxation, 🎭 Entertainment"
        const normalizeVibeToken = (raw: string): string | null => {
          const token = (raw ?? '').toString().trim();
          if (!token) return null;

          // Remove leading emoji/symbols and normalize whitespace/case
          const cleaned = token
            .replace(/^[^\w\s]+/, '') // drop leading non-letter/number (emoji etc)
            .replace(/\s+/g, ' ')
            .trim();

          const lower = cleaned.toLowerCase();

          // Already a valid internal value?
          if (validVibeOptions.includes(lower)) return lower;

          // Legacy label -> value mapping
          const labelMap: Record<string, string> = {
            'relaxation': 'relaxation',
            'entertainment': 'entertainment',
            'educational discovery': 'educational',
            'educational': 'educational',
            'cultural immersion': 'cultural',
            'cultural': 'cultural',
            'shared escape': 'shared',
            'shared': 'shared',
            'culinary adventure': 'culinary',
            'culinary': 'culinary',
          };

          // Try exact label map
          if (labelMap[lower]) return labelMap[lower];

          // Try stripping any trailing words (e.g., "Relaxation Activities")
          const firstWord = lower.split(' ')[0];
          if (labelMap[firstWord]) return labelMap[firstWord];

          return null;
        };

        const rawTokens: string[] =
          typeof tripVibe === 'string'
            ? tripVibe.split(',').map((v: string) => v.trim())
            : Array.isArray(tripVibe)
              ? tripVibe.map((v: any) => String(v).trim())
              : [];

        const vibes = rawTokens
          .map(normalizeVibeToken)
          .filter((v): v is string => !!v && validVibeOptions.includes(v));

        const parsedVibes = vibes.slice(0, 3);
        console.log('Question7: Parsed vibes:', parsedVibes, 'from tripVibe:', tripVibe);
        if (parsedVibes.length > 0) {
          console.log('🟢🟢🟢 Q7 SUCCESS: selectedVibes.length (parsed) =', parsedVibes.length, 'values =', parsedVibes, '🟢🟢🟢');
          setSelectedVibes(parsedVibes);
          console.log('🔵🔵🔵 Q7 LOAD VIBES END (SUCCESS) 🔵🔵🔵');
          return true; // Successfully loaded
        } else {
          console.error('🔴🔴🔴 Q7 FAILED: Parsed vibes array is empty! 🔴🔴🔴');
          console.log('Question7: selectedVibes.length (parsed) = 0');
          console.log('🔵🔵🔵 Q7 LOAD VIBES END (FAILED - NO VIBES) 🔵🔵🔵');
          setSelectedVibes([]);
          return false;
        }
      } else {
        console.error('🔴🔴🔴 Q7 FAILED: No tripVibe found in prop or localStorage. 🔴🔴🔴');
        console.log('🔵🔵🔵 Q7 LOAD VIBES END (FAILED - NO TRIPVIBE) 🔵🔵🔵');
        return false;
      }
    };

    // Try loading immediately
    const loaded = loadVibes();
    
    // If not loaded and we're on Q7, retry after a short delay (handles race condition)
    if (!loaded && currentQuestion === 7) {
      console.log('Question7: Retrying load after 100ms delay...');
      const retryTimer = setTimeout(() => {
        loadVibes();
      }, 100);
      return () => clearTimeout(retryTimer);
    }
  }, [currentQuestion, tripPreferencesProp?.tripVibe]); // Re-run when tripVibe arrives/changes

  // Ensure vibeActivities always has at least one textbox per selected vibe,
  // and (if available) hydrate from previously saved vibeActivities.
  useEffect(() => {
    if (selectedVibes.length === 0) return;
    console.log('Question7: selectedVibes.length (init activities) =', selectedVibes.length, 'values =', selectedVibes);

    // Prefer prop-provided activities (already in parent state), otherwise fallback to persisted
    let persistedActivities: any = null;
    try {
      const { getUserData } = require('../../utils/userDataStorage');
      const persisted = getUserData('tripPreferences');
      persistedActivities = persisted?.vibeActivities ?? null;
    } catch {
      persistedActivities = null;
    }

    setVibeActivities(prev => {
      const base =
        (prev && Object.keys(prev).length > 0) ? prev :
        (tripPreferencesProp?.vibeActivities && typeof tripPreferencesProp.vibeActivities === 'object' ? tripPreferencesProp.vibeActivities : null) ??
        (persistedActivities && typeof persistedActivities === 'object' ? persistedActivities : {}) ??
        {};

      const next: {[key: string]: string[]} = {};
      selectedVibes.forEach(vibe => {
        const existing = (base as any)[vibe];
        next[vibe] = Array.isArray(existing) && existing.length > 0 ? existing : [''];
      });
      console.log('Question7: vibeActivities keys after init =', Object.keys(next));
      return next;
    });
  }, [selectedVibes, tripPreferencesProp?.vibeActivities]);

  // Save activities to parent state (tripPreferences)
  const saveToParent = (activities: {[key: string]: string[]}) => {
    onAnswer(7, { vibeActivities: activities });
  };

  const addActivity = (vibe: string) => {
    const updated = {
      ...vibeActivities,
      [vibe]: [...(vibeActivities[vibe] || []), '']
    };
    setVibeActivities(updated);
    saveToParent(updated);
  };

  const removeActivity = (vibe: string, index: number) => {
    const current = vibeActivities[vibe] || [''];
    const filtered = current.filter((_, i) => i !== index);
    // Always keep at least one textbox visible
    const nextArr = filtered.length > 0 ? filtered : [''];
    const updated = { ...vibeActivities, [vibe]: nextArr };
    setVibeActivities(updated);
    saveToParent(updated);
  };

  const updateActivity = (vibe: string, index: number, value: string) => {
    const updated = {
      ...vibeActivities,
      [vibe]: vibeActivities[vibe]?.map((activity, i) => i === index ? value : activity) || []
    };
    setVibeActivities(updated);
    saveToParent(updated);
  };

  const getVibeLabel = (vibe: string) => {
    const vibeMap: {[key: string]: string} = {
      'relaxation': 'Relaxation',
      'entertainment': 'Entertainment',
      'educational': 'Educational Discovery',
      'cultural': 'Cultural Immersion',
      'shared': 'Shared Escape',
      'culinary': 'Culinary Adventure'
    };
    return vibeMap[vibe] || vibe;
  };

  const getVibeEmoji = (vibe: string) => {
    const emojiMap: {[key: string]: string} = {
      'relaxation': '😌',
      'entertainment': '🎭',
      'educational': '📚',
      'cultural': '🏺',
      'shared': '💘',
      'culinary': '🍽️'
    };
    return emojiMap[vibe] || '🎯';
  };

  const getVibePlaceholder = (vibe: string) => {
    const placeholderMap: {[key: string]: string} = {
      'relaxation': 'e.g., Visit local hot springs and spa treatments (relaxing and authentic)',
      'entertainment': 'e.g., Attend a live music performance at a local venue (energetic and memorable)',
      'educational': 'e.g., Explore historical museums and landmarks (learn about local culture)',
      'cultural': 'e.g., Participate in a traditional festival (immerse in local customs)',
      'shared': 'e.g., Take a scenic boat ride together at sunset (romantic and memorable)',
      'culinary': 'e.g., Take a cooking class with local chefs (authentic food experience)'
    };
    return placeholderMap[vibe] || 'e.g., Describe your activity idea';
  };

  const canProceedToNext = () => {
    // First check if vibes are selected
    if (selectedVibes.length === 0) {
      return false;
    }
    // Check if at least one activity is provided for each selected vibe
    return selectedVibes.every(vibe => 
      vibeActivities[vibe] && 
      vibeActivities[vibe].length > 0 && 
      vibeActivities[vibe].some(activity => activity.trim() !== '')
    );
  };

  const handleNext = () => {
    if (selectedVibes.length === 0) {
      return;
    }
    if (!canProceedToNext()) {
      return;
    }
    // Save activities before navigating
    saveToParent(vibeActivities);
    onNext();
  };

  const handlePreviousClick = () => {
    // Save current activities before navigating back
    if (selectedVibes.length > 0 && Object.keys(vibeActivities).length > 0) {
      saveToParent(vibeActivities);
    }
    onPrevious();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            
          </motion.div>
          <p className="text-gray-600 text-lg">
            Tell us about the specific activities you're excited about for each trip vibe you selected.
          </p>
        </div>

        {/* Activities for each selected vibe */}
        <div className="space-y-6">
          {selectedVibes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🤔</div>
              <p className="text-gray-600 text-lg">
                Please go back and select some trip vibes first!
              </p>
            </div>
          ) : (
            selectedVibes.map((vibe, vibeIndex) => (
              <motion.div
                key={vibe}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: vibeIndex * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{getVibeEmoji(vibe)}</span>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {getVibeLabel(vibe)} Activities
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">
                  What specific activities are you excited about for {getVibeLabel(vibe).toLowerCase()}? 
                  Add examples with brief explanations.
                </p>

                <div className="space-y-3">
                  {(vibeActivities[vibe] || ['']).map((activity, activityIndex) => (
                    <div key={activityIndex} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => updateActivity(vibe, activityIndex, e.target.value)}
                          placeholder={getVibePlaceholder(vibe)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => removeActivity(vibe, activityIndex)}
                        className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addActivity(vibe)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">+</span>
                    Add another activity
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousClick}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            ← Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceedToNext() || selectedVibes.length === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              canProceedToNext() && selectedVibes.length > 0
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 text-white hover:from-emerald-700 hover:to-emerald-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedVibes.length === 0 
              ? 'Please go back and select trip vibes' 
              : canProceedToNext() 
                ? 'Next →' 
                : 'Please add activities for each vibe'}
          </button>
        </div>
    </motion.div>
  );
};

export default Question7Activities;
