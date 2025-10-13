import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIPromptDisplay from '../components/AIPromptDisplay';
import promptService from '../services/promptService';
import { TripPreferences, GeneratedPrompt } from '../types';

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [tripPreferences, setTripPreferences] = useState<TripPreferences | null>(null);
  const [showDestinationPrompt, setShowDestinationPrompt] = useState(false);
  const [destinationPrompt, setDestinationPrompt] = useState<GeneratedPrompt | null>(null);
  const [destinationCount, setDestinationCount] = useState<number>(5);
  const [showDestinationInput, setShowDestinationInput] = useState(false);
  const [destinations, setDestinations] = useState<string[]>(['']);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    // Load trip preferences from localStorage
    const saved = localStorage.getItem('tripPreferences');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTripPreferences(parsed);
      } catch (error) {
        console.error('Error parsing trip preferences:', error);
      }
    }
    
    // Load documents from localStorage
    const savedDocs = localStorage.getItem('destinationDocuments');
    
    if (savedDocs) {
      try {
        const allDocs = JSON.parse(savedDocs);
        setDocuments(allDocs);
      } catch (error) {
        console.error('Error parsing destination documents:', error);
      }
    }
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleGetDestinationRecommendations = () => {
    if (tripPreferences) {
      const prompt = promptService.generateDestinationsPrompt({
        type: 'destinations',
        tripPreferences,
        destinationCount
      });
      setDestinationPrompt(prompt);
      setShowDestinationPrompt(true);
    }
  };

  const handleDestinationCountSubmit = () => {
    if (tripPreferences) {
      const prompt = promptService.generateDestinationsPrompt({
        type: 'destinations',
        tripPreferences,
        destinationCount
      });
      setDestinationPrompt(prompt);
      setShowDestinationPrompt(true);
    }
  };

  const handleDestinationsSubmit = () => {
    const validDestinations = destinations.filter(dest => dest.trim() !== '');
    if (validDestinations.length > 0) {
      // Create destination documents in localStorage with survey data
      const surveyId = `big_idea_${Date.now()}`;
      const surveyDate = new Date().toISOString();
      const surveyName = `Big Idea Survey - ${new Date().toLocaleDateString()}`;
      
      const destinationDocs = validDestinations.map(dest => ({
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        destinationName: dest.trim(),
        isAutoCreated: true,
        // Include survey data from Big Picture (legacy support)
        surveyData: {
          groupSize: tripPreferences?.groupSize,
          duration: typeof tripPreferences?.duration === 'string' ? tripPreferences.duration : JSON.stringify(tripPreferences?.duration),
          budget: tripPreferences?.budget,
          destinationStyle: tripPreferences?.destinationStyle,
          tripVibe: tripPreferences?.tripVibe,
          planningStyle: getPlanningStyleText(tripPreferences?.planningStyle),
          priorities: tripPreferences?.priorities || []
        },
        // Enhanced survey data structure
        bigIdeaSurveyData: tripPreferences,
        tripTracingSurveyData: null, // Will be filled when Trip Tracing is completed
        // Survey origin tracking
        surveyOrigin: {
          bigIdeaSurveyId: surveyId,
          bigIdeaSurveyName: surveyName,
          bigIdeaSurveyDate: surveyDate,
          tripTracingSurveyId: null,
          tripTracingSurveyDate: null
        },
        calendarPlanner: {
          duration: typeof tripPreferences?.duration === 'string' ? tripPreferences.duration : 'Complex duration structure',
          dates: [],
          timeSlots: []
        },
        optionsOrganizer: {
          accommodation: [],
          meals: [],
          activities: []
        },
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }));

      // IMPORTANT: Append to existing documents instead of overwriting
      const existingDocs = localStorage.getItem('destinationDocuments');
      let allDocs = destinationDocs;
      
      if (existingDocs) {
        try {
          const parsed = JSON.parse(existingDocs);
          // Add new documents to existing ones
          allDocs = [...parsed, ...destinationDocs];
        } catch (error) {
          console.error('Error parsing existing documents:', error);
        }
      }

      // Save to localStorage
      localStorage.setItem('destinationDocuments', JSON.stringify(allDocs));
      
      // Mark AI planning guide as completed
      localStorage.setItem('ai_planning_guide_completed', 'true');
      
      // Navigate to trip tracing
      console.log('🚀 NAVIGATING TO TRIP TRACING from handleDestinationsSubmit');
      navigate('/trip-tracing');
    }
  };

  const handleChosenDestinationsSubmit = () => {
    console.log('=== handleChosenDestinationsSubmit called ===');
    console.log('tripPreferences:', tripPreferences);
    console.log('destinationApproach:', tripPreferences?.destinationApproach);
    console.log('specificDestinations:', tripPreferences?.destinationApproach?.specificDestinations);
    
    // Check if tripPreferences exists at all
    if (!tripPreferences) {
      console.error('ERROR: tripPreferences is null or undefined');
      return;
    }
    
    // Check if destinationApproach exists
    if (!tripPreferences.destinationApproach) {
      console.error('ERROR: destinationApproach is missing from tripPreferences');
      console.log('Available tripPreferences keys:', Object.keys(tripPreferences));
      return;
    }
    
    // Check if specificDestinations exists
    if (!tripPreferences.destinationApproach.specificDestinations) {
      console.error('ERROR: specificDestinations is missing from destinationApproach');
      console.log('Available destinationApproach keys:', Object.keys(tripPreferences.destinationApproach));
      return;
    }
    
    // For Flow A: Create destination documents quietly for chosen destinations
    if (tripPreferences?.destinationApproach?.specificDestinations) {
      const chosenDestinations = tripPreferences.destinationApproach.specificDestinations;
      console.log('Creating documents for chosen destinations:', chosenDestinations);
      
      // Create destination documents with auto-created flag
      const surveyId = `big_idea_${Date.now()}`;
      const surveyDate = new Date().toISOString();
      const surveyName = `Big Idea Survey - ${new Date().toLocaleDateString()}`;
      
      const destinationDocs = chosenDestinations.map(dest => ({
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        destinationName: dest.trim(),
        isAutoCreated: true, // Flag to identify auto-created docs for hiding from profile
        // Include survey data from Big Picture
        surveyData: {
          groupSize: tripPreferences?.groupSize,
          duration: typeof tripPreferences?.duration === 'string' ? tripPreferences.duration : JSON.stringify(tripPreferences?.duration),
          budget: tripPreferences?.budget,
          destinationStyle: tripPreferences?.destinationStyle,
          tripVibe: tripPreferences?.tripVibe,
          planningStyle: getPlanningStyleText(tripPreferences?.planningStyle),
          priorities: tripPreferences?.priorities || []
        },
        // Enhanced survey data structure
        bigIdeaSurveyData: tripPreferences,
        tripTracingSurveyData: null,
        // Survey origin tracking
        surveyOrigin: {
          bigIdeaSurveyId: surveyId,
          bigIdeaSurveyName: surveyName,
          bigIdeaSurveyDate: surveyDate,
          tripTracingSurveyId: null,
          tripTracingSurveyDate: null
        },
        calendarPlanner: {
          duration: typeof tripPreferences?.duration === 'string' ? tripPreferences.duration : 'Complex duration structure',
          dates: [],
          timeSlots: []
        },
        optionsOrganizer: {
          accommodation: [],
          meals: [],
          activities: []
        },
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }));

      console.log('Destination documents created:', destinationDocs);
      
      // IMPORTANT: Append to existing documents instead of overwriting
      const existingDocs = localStorage.getItem('destinationDocuments');
      let allDocs = destinationDocs;
      
      if (existingDocs) {
        try {
          const parsed = JSON.parse(existingDocs);
          // Add new documents to existing ones
          allDocs = [...parsed, ...destinationDocs];
        } catch (error) {
          console.error('Error parsing existing documents:', error);
        }
      }
      
      // Save to localStorage
      localStorage.setItem('destinationDocuments', JSON.stringify(allDocs));
      console.log('Documents saved to localStorage');
      
      // Update local state to show documents immediately
      setDocuments(allDocs);
      console.log('Documents state updated');
      
      // Mark AI planning guide as completed
      localStorage.setItem('ai_planning_guide_completed', 'true');
      
      // Navigate to trip tracing
      console.log('🚀 NAVIGATING TO TRIP TRACING from handleDestinationsSubmit');
      navigate('/trip-tracing');
    } else {
      console.log('No specific destinations found, cannot create documents');
      console.log('tripPreferences structure:', JSON.stringify(tripPreferences, null, 2));
    }
  };

  const addDestination = () => {
    setDestinations([...destinations, '']);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
  };

  // Convert planning style numeric value to qualitative text
  const getPlanningStyleText = (planningStyle: number | string | undefined): string => {
    if (planningStyle === undefined || planningStyle === null) return 'Not specified';
    
    // Handle string values (planningType)
    if (typeof planningStyle === 'string') {
      switch (planningStyle) {
        case 'lazy': return 'Lazy - Plan with mind of leeways';
        case 'somewhat': return 'Somewhat - Balanced approach';
        case 'well': return 'Well - Good structure with flexibility';
        case 'complete': return 'Complete - Every second planned';
        default: return planningStyle;
      }
    }
    
    // Handle numeric values (planningStyle percentage)
    if (typeof planningStyle === 'number') {
      if (planningStyle <= 20) return 'Very Lazy - Plan with mind of leeways';
      if (planningStyle <= 40) return 'Lazy - Plan with mind of leeways';
      if (planningStyle <= 60) return 'Balanced - Some planning, some flexibility';
      if (planningStyle <= 80) return 'Organized - Detailed planning with some flexibility';
      if (planningStyle <= 100) return 'Very Organized - Meticulous planning';
    }
    
    return 'Not specified';
  };

  if (!tripPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h2>
            <p className="text-gray-600">Please wait while we load your preferences.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            📋 Summary & Next Steps
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Review your preferences and get destination recommendations
          </p>
        </motion.div>

        {/* Trip Preferences Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🎯 Your Travel Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Group Size</h3>
                <p className="text-gray-900">{tripPreferences.groupSize || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Duration & Timing</h3>
                <div className="text-gray-900">
                  {(() => {
                    const duration = tripPreferences.duration;
                    if (!duration || typeof duration === 'string') {
                      return duration || 'Not specified';
                    }
                    
                    const parts = [];
                    
                    // Range information
                    if (duration.range?.status) {
                      const rangeText = duration.range.status === 'decided' ? 'Decided Range' :
                                       duration.range.status === 'in_mind' ? 'Range in Mind' :
                                       'Range Undecided';
                      
                      if (duration.range.startMonth && duration.range.endMonth) {
                        parts.push(`📅 ${rangeText}: ${duration.range.startMonth} ${duration.range.startDay ? duration.range.startDay + ', ' : ''}${duration.range.startYear} → ${duration.range.endMonth} ${duration.range.endDay ? duration.range.endDay + ', ' : ''}${duration.range.endYear}`);
                      } else {
                        parts.push(`📅 ${rangeText}`);
                      }
                    }
                    
                    // Duration information
                    if (duration.duration?.status) {
                      const durationText = duration.duration.status === 'decided' ? 'Decided Duration' :
                                          duration.duration.status === 'in_mind' ? 'Duration in Mind' :
                                          'Duration Undecided';
                      
                      if (duration.duration.status === 'decided') {
                        const durationParts = [];
                        if (duration.duration.months && duration.duration.months !== '0') durationParts.push(`${duration.duration.months} month${duration.duration.months !== '1' ? 's' : ''}`);
                        if (duration.duration.weeks && duration.duration.weeks !== '0') durationParts.push(`${duration.duration.weeks} week${duration.duration.weeks !== '1' ? 's' : ''}`);
                        if (duration.duration.days && duration.duration.days !== '0') durationParts.push(`${duration.duration.days} day${duration.duration.days !== '1' ? 's' : ''}`);
                        
                        if (durationParts.length > 0) {
                          parts.push(`⏱️ ${durationText}: ${durationParts.join(', ')}`);
                        } else {
                          parts.push(`⏱️ ${durationText}`);
                        }
                      } else if (duration.duration.status === 'in_mind') {
                        const minParts = [];
                        const maxParts = [];
                        
                        if (duration.duration.minMonths && duration.duration.minMonths !== '0') minParts.push(`${duration.duration.minMonths} month${duration.duration.minMonths !== '1' ? 's' : ''}`);
                        if (duration.duration.minWeeks && duration.duration.minWeeks !== '0') minParts.push(`${duration.duration.minWeeks} week${duration.duration.minWeeks !== '1' ? 's' : ''}`);
                        if (duration.duration.minDays && duration.duration.minDays !== '0') minParts.push(`${duration.duration.minDays} day${duration.duration.minDays !== '1' ? 's' : ''}`);
                        
                        if (duration.duration.maxMonths && duration.duration.maxMonths !== '0') maxParts.push(`${duration.duration.maxMonths} month${duration.duration.maxMonths !== '1' ? 's' : ''}`);
                        if (duration.duration.maxWeeks && duration.duration.maxWeeks !== '0') maxParts.push(`${duration.duration.maxWeeks} week${duration.duration.maxWeeks !== '1' ? 's' : ''}`);
                        if (duration.duration.maxDays && duration.duration.maxDays !== '0') maxParts.push(`${duration.duration.maxDays} day${duration.duration.maxDays !== '1' ? 's' : ''}`);
                        
                        if (minParts.length > 0 || maxParts.length > 0) {
                          parts.push(`⏱️ ${durationText}: ${minParts.join(', ') || 'No min'} to ${maxParts.join(', ') || 'No max'}`);
                        } else {
                          parts.push(`⏱️ ${durationText}`);
                        }
                      } else {
                        parts.push(`⏱️ ${durationText}`);
                      }
                    }
                    
                    // Dates information
                    if (duration.dates?.status) {
                      const datesText = duration.dates.status === 'decided' ? 'Decided Dates' : 'Dates Undecided';
                      
                      if (duration.dates.startDate && duration.dates.endDate) {
                        parts.push(`📆 ${datesText}: ${new Date(duration.dates.startDate).toLocaleDateString()} → ${new Date(duration.dates.endDate).toLocaleDateString()}`);
                      } else {
                        parts.push(`📆 ${datesText}`);
                      }
                    }
                    
                    return parts.length > 0 ? parts.join('\n') : 'Not specified';
                  })()}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Budget</h3>
                <p className="text-gray-900">${tripPreferences.budget || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Destination Approach</h3>
                <div className="text-gray-900">
                  {tripPreferences.destinationApproach ? (
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Travel Type:</span> {
                          tripPreferences.destinationApproach.travelType === 'abroad' ? '✈️ International Travel' : 
                          tripPreferences.destinationApproach.travelType === 'domestic' ? '🏞️ Domestic Travel' : 
                          'Not specified'
                        }
                      </p>
                      <p>
                        <span className="font-medium">Status:</span> {
                          tripPreferences.destinationApproach.destinationStatus === 'chosen' ? '🎯 Destinations Chosen' :
                          tripPreferences.destinationApproach.destinationStatus === 'in_mind' ? '💭 Destinations in Mind' :
                          tripPreferences.destinationApproach.destinationStatus === 'open' ? '🌍 Open to Suggestions' :
                          'Not specified'
                        }
                      </p>
                      {tripPreferences.destinationApproach.specificDestinations && tripPreferences.destinationApproach.specificDestinations.length > 0 && (
                        <p>
                          <span className="font-medium">Destinations:</span> {tripPreferences.destinationApproach.specificDestinations.join(', ')}
                        </p>
                      )}
                    </div>
                  ) : (
                    'Not specified'
                  )}
                </div>
              </div>
              {/* Only show Destination Style if destination status is 'open' */}
              {tripPreferences.destinationApproach?.destinationStatus === 'open' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Destination Style</h3>
                <p className="text-gray-900">
                  {(() => {
                    // Handle both destinationStyle (string) and destinationStyles (array) formats
                    const styles = tripPreferences.destinationStyles || tripPreferences.destinationStyle;
                    
                    // Style mapping for converting values to labels
                    const styleLabels = {
                      'urban': 'Urban Vibes',
                      'rural': 'Rural Escape', 
                      'coastal': 'Coastal Air',
                      'mountain': 'Mountain Retreat',
                      'tropical': 'Tropical Mood',
                      'snowy': 'Snowy Magic'
                    };
                    
                    if (Array.isArray(styles) && styles.length > 0) {
                      return styles.map((style, index) => {
                        const label = styleLabels[style as keyof typeof styleLabels] || style;
                        return (
                          <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2 mb-1">
                            #{index + 1} {label}
                          </span>
                        );
                      });
                    } else if (typeof styles === 'string' && styles) {
                      return styles.split(',').map((style, index) => {
                        const label = styleLabels[style.trim() as keyof typeof styleLabels] || style.trim();
                        return (
                          <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2 mb-1">
                            #{index + 1} {label}
                          </span>
                        );
                      });
                    } else {
                      return 'Not specified';
                    }
                  })()}
                </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Trip Vibe</h3>
                <p className="text-gray-900">
                  {(() => {
                    const vibes = tripPreferences.tripVibe;
                    
                    // Vibe mapping for converting values to labels
                    const vibeLabels = {
                      'relaxation': '😌 Relaxation',
                      'entertainment': '🎭 Entertainment', 
                      'educational': '📚 Educational Discovery',
                      'cultural': '🏺 Cultural Immersion',
                      'shared': '💘 Shared Escape',
                      'culinary': '🍽️ Culinary Adventure'
                    };
                    
                    if (typeof vibes === 'string' && vibes) {
                      return vibes.split(',').map((vibe, index) => {
                        const label = vibeLabels[vibe.trim() as keyof typeof vibeLabels] || vibe.trim();
                        return (
                          <span key={index} className="inline-block bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm mr-2 mb-2 font-medium">
                            #{index + 1} {label}
                          </span>
                        );
                      });
                    } else {
                      return 'Not specified';
                    }
                  })()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Planning Style</h3>
                <div className="text-gray-900">
                  {(() => {
                    const style = tripPreferences.planningStyle;
                    if (style === undefined || style === null) return 'Not specified';
                    
                    let styleText = '';
                    if (typeof style === 'number') {
                      if (style <= 25) styleText = 'Lazily planned - "Plan with mind of leeways / I am open"';
                      else if (style <= 50) styleText = 'Somewhat planned - "A bit of structure with flexibility"';
                      else if (style <= 75) styleText = 'Well planned - "Good balance of planning and spontaneity"';
                      else styleText = 'Completely planned - "Can\'t waste a single second! / I will be always active"';
                    } else {
                      styleText = style;
                    }
                    
                    const parts = [styleText];
                    
                    // Add leeway amount if provided (for ≤25%)
                    if (tripPreferences.leewayAmount) {
                      parts.push(`💭 Leeway Amount: ${tripPreferences.leewayAmount}`);
                    }
                    
                    // Add leeway explanation if provided (for <50%)
                    if (tripPreferences.leewayExplanation) {
                      parts.push(`📝 Leeway Explanation: ${tripPreferences.leewayExplanation}`);
                    }
                    
                    // Add surprise preference
                    if (tripPreferences.surpriseFromClaude) {
                      parts.push(`🎁 Wants surprise from Claude`);
                    }
                    
                    return parts.join('\n');
                  })()}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Priorities</h3>
                <p className="text-gray-900">
                  {(() => {
                    const priorities = tripPreferences.priorities;
                    
                    // Priority mapping for converting values to labels
                    const priorityLabels = {
                      'eco-friendliness': '🌱 Eco-friendliness',
                      'safety': '🛡️ Safety', 
                      'accessibility': '♿ Accessibility',
                      'cost-efficiency': '💰 Cost-efficiency',
                      'time-efficiency': '⏰ Time-efficiency',
                      'cost-effectiveness': '⚖️ Cost effectiveness',
                      'number-of-options': '📋 Number of options'
                    };
                    
                    if (Array.isArray(priorities) && priorities.length > 0) {
                      return priorities.map((priority, index) => {
                        const label = priorityLabels[priority as keyof typeof priorityLabels] || priority;
                        return (
                          <span key={index} className="inline-block bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm mr-2 mb-2 font-medium">
                            #{index + 1} {label}
                          </span>
                        );
                      });
                    } else {
                      return 'Not specified';
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Debug Section - Hidden but kept in backend for future debugging */}
        {false && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
            <div className="text-yellow-700 text-sm space-y-1">
              <p><strong>tripPreferences exists:</strong> {tripPreferences ? 'Yes' : 'No'}</p>
              <p><strong>destinationApproach exists:</strong> {tripPreferences?.destinationApproach ? 'Yes' : 'No'}</p>
              <p><strong>destinationStatus:</strong> {tripPreferences?.destinationApproach?.destinationStatus || 'undefined'}</p>
              <p><strong>specificDestinations:</strong> {JSON.stringify(tripPreferences?.destinationApproach?.specificDestinations) || 'undefined'}</p>
              <p><strong>Will show chosen destinations section:</strong> {
                (tripPreferences?.destinationApproach?.destinationStatus === 'chosen' && 
                 !showDestinationPrompt && !showDestinationInput) ? 'Yes' : 'No'
              }</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleChosenDestinationsSubmit}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm"
              >
                🔧 Test Document Creation (Debug Button)
              </button>
            </div>
          </div>
        )}

        {/* Flow 1: Direct to Trip Tracing when destinations are already chosen */}
        {tripPreferences?.destinationApproach?.destinationStatus === 'chosen' && 
         !showDestinationPrompt && !showDestinationInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Destinations Already Selected!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Your destination documents have been created automatically. Ready for detailed trip planning!
              </p>
              
              {/* Show chosen destinations */}
              {tripPreferences.destinationApproach.specificDestinations && 
               tripPreferences.destinationApproach.specificDestinations.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Your Chosen Destinations:</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {tripPreferences.destinationApproach.specificDestinations.map((destination, index) => (
                      <span key={index} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                        {destination}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                  console.log('Navigating to Trip Tracing from Summary page');
                  console.log('tripPreferences:', tripPreferences);
                  console.log('ai_planning_guide_completed:', localStorage.getItem('ai_planning_guide_completed'));
                  try {
                    navigate('/trip-tracing');
                  } catch (error) {
                    console.error('Navigation error:', error);
                  }
                  }}
                  className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
                >
                  Continue to Trip Tracing 🚀
                </button>
                <p className="text-sm text-gray-500">
                  Documents were created automatically when you completed the Big Idea survey
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Flow 2: Show destinations in mind after AI prompt */}
        {tripPreferences?.destinationApproach?.destinationStatus === 'in_mind' && 
         !showDestinationPrompt && !showDestinationInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">💭</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Destinations You're Considering
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Documents have been created for your potential destinations. Use the AI guidance to help finalize your choices!
              </p>
              
              {/* Show destinations in mind */}
              {tripPreferences.destinationApproach.specificDestinations && 
               tripPreferences.destinationApproach.specificDestinations.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Destinations You're Considering:</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {tripPreferences.destinationApproach.specificDestinations.map((destination, index) => (
                      <span key={index} className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                        {destination}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                  console.log('Navigating to Trip Tracing from Summary page');
                  console.log('tripPreferences:', tripPreferences);
                  console.log('ai_planning_guide_completed:', localStorage.getItem('ai_planning_guide_completed'));
                  try {
                    navigate('/trip-tracing');
                  } catch (error) {
                    console.error('Navigation error:', error);
                  }
                  }}
                  className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
                >
                  Continue to Trip Tracing 🚀
                </button>
                <p className="text-sm text-gray-500">
                  You can edit or delete destination documents based on AI recommendations
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Flow 3: Destination Count Selection - Only show for 'open' status */}
        {!showDestinationPrompt && !showDestinationInput && 
         tripPreferences?.destinationApproach?.destinationStatus === 'open' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              🌍 How Many Destinations?
            </h2>
            <p className="text-lg text-gray-600 mb-6 text-center">
              Choose how many destination recommendations you'd like to receive
            </p>
            
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {[2, 3, 4, 5, 6, 7].map((count) => (
                  <button
                    key={count}
                    onClick={() => setDestinationCount(count)}
                    className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
                      destinationCount === count
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={handleDestinationCountSubmit}
                className="btn-primary text-lg px-8 py-4"
              >
                Get Destination Recommendations 🚀
              </button>
            </div>
          </motion.div>
        )}

        {/* Destination Names Input */}
        {showDestinationInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              ✍️ Enter Your Chosen Destinations
            </h2>
            <p className="text-lg text-gray-600 mb-6 text-center">
              Type the names of the destinations you'd like to plan for (minimum 1, no maximum limit)
            </p>
            
            <div className="space-y-4 mb-6">
              {destinations.map((destination, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => updateDestination(index, e.target.value)}
                    placeholder={`Destination ${index + 1}`}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {destinations.length > 1 && (
                    <button
                      onClick={() => removeDestination(index)}
                      className="px-3 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={addDestination}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
              >
                + Add Another Destination
              </button>
            </div>
            
            <div className="text-center space-y-4">
              <button
                onClick={() => {
                  console.log('Submitting destinations and navigating to Trip Tracing');
                  console.log('destinations:', destinations);
                  console.log('tripPreferences:', tripPreferences);
                  handleDestinationsSubmit();
                }}
                disabled={destinations.every(dest => dest.trim() === '')}
                className={`text-lg px-8 py-4 rounded-xl font-semibold transition-all ${
                  destinations.some(dest => dest.trim() !== '')
                    ? 'btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Trip Tracing 🚀
              </button>
              
              <div className="text-sm text-gray-600">
                {destinations.length === 0 && (
                  <p>Please add at least one destination to continue</p>
                )}
              </div>
            </div>
        </motion.div>
        )}

        {/* Documents Section for Debugging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📚 Your Documents (Debug View)
          </h2>
          
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No documents yet</h3>
              <p className="text-gray-600">
                Documents should be created automatically when you click "Continue to Trip Tracing"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {doc.destinationName}
                    </h3>
                    {doc.isAutoCreated && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Auto-Created
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <strong>Created:</strong> {formatDate(doc.createdAt)}
                    </div>
                    <div>
                      <strong>Last Modified:</strong> {formatDate(doc.lastModified)}
                    </div>
                    <div>
                      <strong>Auto-Created:</strong> {doc.isAutoCreated ? 'Yes' : 'No'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/big-picture')}
              className="btn-secondary text-lg px-8 py-4"
            >
              ← Back to Big Picture
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary text-lg px-8 py-4"
            >
              View Documents 📋
            </button>
        </div>
          
          <p className="text-sm text-gray-600">
            View your documents or continue planning your trip
          </p>
        </motion.div>
      </div>

      {/* AI Prompt Display */}
      {showDestinationPrompt && destinationPrompt && (
        <AIPromptDisplay
          prompt={destinationPrompt}
          onClose={() => {
            setShowDestinationPrompt(false);
            setShowDestinationInput(true);
          }}
        />
      )}
    </div>
  );
};

export default SummaryPage; 