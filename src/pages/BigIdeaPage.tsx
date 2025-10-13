import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIPromptDisplay from '../components/AIPromptDisplay';
import promptService from '../services/promptService';
import { TripPreferences, GeneratedPrompt } from '../types';
import { useSurveyProgress } from '../hooks/useSurveyProgress';
import Question1GroupSize from '../components/bigIdea/Question1GroupSize';
import Question2Duration from '../components/bigIdea/Question2Duration';
import Question3Budget from '../components/bigIdea/Question3Budget';
import Question4DestinationApproach from '../components/bigIdea/Question4DestinationApproach';
import Question5DestinationStyle from '../components/bigIdea/Question5DestinationStyle';
import Question6TripVibe from '../components/bigIdea/Question6TripVibe';
import Question7Activities from '../components/bigIdea/Question7Activities';
import Question8PlanningStyle from '../components/bigIdea/Question8PlanningStyle';
import Question9Priorities from '../components/bigIdea/Question9Priorities';

const BigIdeaPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [tripPreferences, setTripPreferences] = useState<Partial<TripPreferences>>({});
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<GeneratedPrompt | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showSavePreferences, setShowSavePreferences] = useState(false);
  const [preferencesName, setPreferencesName] = useState('');
  const { updateProgress, markCompleted } = useSurveyProgress();

  const totalQuestions = 9;

  useEffect(() => {
    // Load trip preferences from localStorage
    const saved = localStorage.getItem('tripPreferences');
    if (saved) {
      try {
        setTripPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing trip preferences:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Update survey progress
    updateProgress(currentQuestion, totalQuestions);
  }, [currentQuestion, totalQuestions, updateProgress]);

  const savePreferencesSet = () => {
    if (preferencesName.trim() && tripPreferences) {
      // Load existing saved preferences
      const saved = localStorage.getItem('savedTripPreferences');
      let savedPreferences = [];
      
      if (saved) {
        try {
          savedPreferences = JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing saved preferences:', error);
        }
      }

      // Create new preference set
      const newPreferenceSet = {
        id: `pref_${Date.now()}`,
        name: preferencesName.trim(),
        preferences: { ...tripPreferences },
        createdAt: new Date().toISOString()
      };

      // Keep only the 4 most recent (remove oldest if necessary)
      const updatedPreferences = [newPreferenceSet, ...savedPreferences].slice(0, 4);
      
      localStorage.setItem('savedTripPreferences', JSON.stringify(updatedPreferences));
      
      // Clear form and close modal
      setPreferencesName('');
      setShowSavePreferences(false);
      
      alert(`Trip preferences "${newPreferenceSet.name}" saved successfully!`);
    }
  };

  const createDestinationDocuments = (destinationNames: string[], preferences: Partial<TripPreferences>) => {
    console.log('Creating destination documents for:', destinationNames);
    
    const surveyId = `big_idea_${Date.now()}`;
    const surveyDate = new Date().toISOString();
    const surveyName = `Big Idea Survey - ${new Date().toLocaleDateString()}`;
    
    const destinationDocs = destinationNames.map(dest => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      destinationName: dest.trim(),
      isAutoCreated: true, // Flag to identify auto-created docs
      // Include survey data from Big Picture (legacy support)
      surveyData: {
        groupSize: preferences?.groupSize,
        duration: typeof preferences?.duration === 'string' ? preferences.duration : JSON.stringify(preferences?.duration),
        budget: preferences?.budget,
        destinationStyle: preferences?.destinationStyle,
        tripVibe: preferences?.tripVibe,
        planningStyle: typeof preferences?.planningStyle === 'number' ? 
          (preferences.planningStyle <= 25 ? 'Spontaneous Explorer' :
           preferences.planningStyle <= 50 ? 'Flexible Planner' :
           preferences.planningStyle <= 75 ? 'Structured Planner' : 'Detail-Oriented Organizer') :
          preferences?.planningStyle,
        priorities: preferences?.priorities || []
      },
      // Enhanced survey data structure
      bigIdeaSurveyData: preferences,
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
        duration: typeof preferences?.duration === 'string' ? preferences.duration : 'Complex duration structure',
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

    console.log('Documents created:', destinationDocs);
    
    // IMPORTANT: Append to existing documents instead of overwriting
    const existingDocs = localStorage.getItem('destinationDocuments');
    let allDocs = destinationDocs;
    
    if (existingDocs) {
      try {
        const parsed = JSON.parse(existingDocs);
        // Add new documents to existing ones
        allDocs = [...parsed, ...destinationDocs];
        console.log('Appending to existing documents. Existing count:', parsed.length, 'New count:', destinationDocs.length);
      } catch (error) {
        console.error('Error parsing existing documents:', error);
      }
    }
    
    // Save to localStorage
    localStorage.setItem('destinationDocuments', JSON.stringify(allDocs));
    console.log('Documents saved to localStorage. Total documents:', allDocs.length);
    
    // Mark AI planning guide as completed
    localStorage.setItem('ai_planning_guide_completed', 'true');
  };

  const handleNext = () => {
    console.log('🚀 handleNext called! Current question:', currentQuestion, 'Total questions:', totalQuestions);
    console.log('🚀 Current tripPreferences:', tripPreferences);
    console.log('🚀 isComplete() result:', isComplete());
    
    if (currentQuestion < totalQuestions) {
      let nextQuestion = currentQuestion + 1;
      
      // Skip Question 5 (Destination Style) only if destination status is 'chosen' (not 'open' or 'in_mind')
      if (currentQuestion === 4 && tripPreferences.destinationApproach?.destinationStatus === 'chosen') {
        console.log('Skipping Question 5 (Destination Style) - destination status is chosen');
        nextQuestion = 6; // Skip to Question 6 (Trip Vibe)
      }
      
      // Skip Question 5 if we're on Question 4 and going backwards through navigation
      if (nextQuestion === 5 && tripPreferences.destinationApproach?.destinationStatus === 'chosen') {
        console.log('Skipping Question 5 (Destination Style) - destination status is chosen');
        nextQuestion = 6;
      }
      
      console.log('Moving to next question:', nextQuestion);
      setCurrentQuestion(nextQuestion);
      
      // Scroll to top of page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log('All questions completed, checking if complete...');
      // All questions completed, check if we can show summary
      if (isComplete()) {
        console.log('All questions complete, showing summary...');
        
        // For Flow 1 & 2: Create documents immediately if destinations are provided
        if ((tripPreferences.destinationApproach?.destinationStatus === 'chosen' || 
             tripPreferences.destinationApproach?.destinationStatus === 'in_mind') && 
            tripPreferences.destinationApproach?.specificDestinations && 
            tripPreferences.destinationApproach.specificDestinations.length > 0) {
          console.log(`Flow ${tripPreferences.destinationApproach.destinationStatus === 'chosen' ? '1' : '2'}: Creating documents immediately`);
          createDestinationDocuments(tripPreferences.destinationApproach.specificDestinations, tripPreferences);
        }
        
        // Show summary instead of AI prompt
        console.log('🚀 Setting showSummary to true...');
        setShowSummary(true);
        console.log('🚀 Marking survey as completed...');
        markCompleted(); // Mark survey as completed
        console.log('✅ Summary should now be visible');
        
        // Scroll to top to ensure summary modal is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.log('Not complete yet. Current state:', tripPreferences);
        console.log('isComplete() result:', isComplete());
        
        // Force check localStorage for the latest data
        const saved = localStorage.getItem('tripPreferences');
        if (saved) {
          try {
            const latestPreferences = JSON.parse(saved);
            console.log('Latest preferences from localStorage:', latestPreferences);
            
            // Check if the latest data makes it complete
            const latestBaseComplete = !!(
              latestPreferences.groupSize &&
              latestPreferences.duration &&
              (latestPreferences.budget !== undefined && latestPreferences.budget !== null) && // Allow 0 budget
              latestPreferences.destinationApproach &&
              latestPreferences.destinationApproach.travelType &&
              latestPreferences.destinationApproach.destinationStatus &&
              latestPreferences.tripVibe &&
              latestPreferences.planningStyle &&
              latestPreferences.priorities &&
              latestPreferences.priorities.length > 0
            );
            
            // Conditional requirement: destination style only needed if status is 'open' or 'in_mind'
            const latestDestinationStyleComplete = (latestPreferences.destinationApproach?.destinationStatus === 'open' || 
                                                   latestPreferences.destinationApproach?.destinationStatus === 'in_mind')
              ? !!(latestPreferences.destinationStyle || (latestPreferences.destinationStyles && latestPreferences.destinationStyles.length > 0))
              : true;
              
            const latestComplete = latestBaseComplete && latestDestinationStyleComplete;
            
            if (latestComplete) {
              console.log('Data from localStorage is complete, showing summary...');
              setTripPreferences(latestPreferences);
              
              // For Flow 1 & 2: Create documents immediately if destinations are provided
              if ((latestPreferences.destinationApproach?.destinationStatus === 'chosen' || 
                   latestPreferences.destinationApproach?.destinationStatus === 'in_mind') && 
                  latestPreferences.destinationApproach?.specificDestinations && 
                  latestPreferences.destinationApproach.specificDestinations.length > 0) {
                console.log(`Flow ${latestPreferences.destinationApproach.destinationStatus === 'chosen' ? '1' : '2'}: Creating documents from localStorage`);
                createDestinationDocuments(latestPreferences.destinationApproach.specificDestinations, latestPreferences);
              }
              
              setShowSummary(true);
              markCompleted(); // Mark survey as completed
              
              // Scroll to top to ensure summary modal is visible
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } catch (error) {
            console.error('Error parsing latest preferences:', error);
          }
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      let prevQuestion = currentQuestion - 1;
      
      // Skip Question 5 (Destination Style) if destination status is not 'open'
      if (currentQuestion === 6 && tripPreferences.destinationApproach?.destinationStatus !== 'open') {
        console.log('Skipping Question 5 (Destination Style) going backwards - destination status is not open');
        prevQuestion = 4; // Go back to Question 4 (Destination Approach)
      }
      
      console.log('Moving to previous question:', prevQuestion);
      setCurrentQuestion(prevQuestion);
      
      // Scroll to top of page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnswer = (questionNumber: number, answer: any) => {
    console.log(`Question ${questionNumber} received answer:`, answer);
    
    let newPreferences;
    
    // Handle different question types
    if (questionNumber === 4) {
      // Question 4 is destinationApproach - answer already contains destinationApproach and duration
      newPreferences = {
        ...tripPreferences,
        ...answer  // answer already has the correct structure
      };
    } else {
      // All other questions
      newPreferences = {
        ...tripPreferences,
        ...answer
      };
    }
    
    console.log('Previous preferences:', tripPreferences);
    console.log('New preferences:', newPreferences);
    
    setTripPreferences(newPreferences);
    
    // Save to localStorage after each answer
    localStorage.setItem('tripPreferences', JSON.stringify(newPreferences));
    
    // Debug logging
    console.log(`Question ${questionNumber} answered:`, answer);
    console.log('Updated preferences:', newPreferences);
    
    // Special check for Question 8 completion (was Question 7)
    if (questionNumber === 8) {
      console.log('Question 8 completed! Checking if we can proceed...');
      console.log('Current tripPreferences after Q8:', newPreferences);
      console.log('isComplete() result:', isComplete());
    }
  };

  const isComplete = (): boolean => {
    // Base requirements
    const baseComplete = !!(
      tripPreferences.groupSize &&
      tripPreferences.duration &&
      (tripPreferences.budget !== undefined && tripPreferences.budget !== null) && // Allow 0 budget
      tripPreferences.destinationApproach &&
      tripPreferences.destinationApproach.travelType &&
      tripPreferences.destinationApproach.destinationStatus &&
      tripPreferences.tripVibe &&
      tripPreferences.planningStyle &&
      tripPreferences.priorities &&
      tripPreferences.priorities.length > 0
    );
    
    // Conditional requirement: destination style needed if status is 'open' or 'in_mind'
    const destinationStyleComplete = (tripPreferences.destinationApproach?.destinationStatus === 'open' || 
                                     tripPreferences.destinationApproach?.destinationStatus === 'in_mind')
      ? !!(tripPreferences.destinationStyle || (tripPreferences.destinationStyles && tripPreferences.destinationStyles.length > 0))
      : true; // Not required if status is 'chosen'
    
    const complete = baseComplete && destinationStyleComplete;
    
    console.log('isComplete check:', {
      groupSize: tripPreferences.groupSize,
      duration: tripPreferences.duration,
      budget: tripPreferences.budget,
      destinationApproach: tripPreferences.destinationApproach,
      destinationStyle: tripPreferences.destinationStyle,
      destinationStyles: tripPreferences.destinationStyles,
      tripVibe: tripPreferences.tripVibe,
      planningStyle: tripPreferences.planningStyle,
      priorities: tripPreferences.priorities,
      prioritiesLength: tripPreferences.priorities?.length,
      baseComplete,
      destinationStyleComplete,
      destinationStatusIsOpen: tripPreferences.destinationApproach?.destinationStatus === 'open',
      complete
    });
    
    return complete;
  };

  const handlePromptClose = () => {
    setShowAIPrompt(false);
    navigate('/summary');
  };

  console.log('Current Question:', currentQuestion);
  console.log('Total Questions:', totalQuestions);
  console.log('Can Proceed:', isComplete());

  const renderQuestion = () => {
    const commonProps = {
      onAnswer: handleAnswer,
      onNext: handleNext,
      onPrevious: handlePrevious,
      currentQuestion,
      totalQuestions,
      canProceed: true
    };

    switch (currentQuestion) {
      case 1:
        return <Question1GroupSize {...commonProps} />;
      case 2:
        return <Question2Duration {...commonProps} />;
      case 3:
        return <Question3Budget {...commonProps} />;
      case 4:
        return <Question4DestinationApproach {...commonProps} />;
      case 5:
        return <Question5DestinationStyle {...commonProps} />;
      case 6:
        return <Question6TripVibe {...commonProps} />;
      case 7:
        return <Question7Activities {...commonProps} />;
      case 8:
        return <Question8PlanningStyle {...commonProps} />;
      case 9:
        return <Question9Priorities 
          {...commonProps} 
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            🎯 Big Picture Planning
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Answer these 7 key questions to get personalized AI prompts for your dream trip!
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="text-lg text-gray-600">
            Question {currentQuestion} of {totalQuestions}
          </div>
        </motion.div>

        {/* Question Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderQuestion()}
          </motion.div>
        </AnimatePresence>

        {/* Summary Review Modal */}
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSummary(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  📋 Review Your Big Idea Survey Responses
                </h2>
                <button
                  onClick={() => setShowSummary(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Group Size</h3>
                    <p className="text-gray-900">{tripPreferences.groupSize || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Duration</h3>
                    <p className="text-gray-900">
                      {typeof tripPreferences.duration === 'string' 
                        ? tripPreferences.duration 
                        : tripPreferences.duration 
                          ? 'Complex duration structure (see details in survey)'
                          : 'Not specified'
                      }
                    </p>
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
                    <p className="text-gray-900">
                      {(() => {
                        const style = tripPreferences.planningStyle;
                        if (style === undefined || style === null) return 'Not specified';
                        
                        if (typeof style === 'number') {
                          if (style <= 25) return 'Lazily planned - "Plan with mind of leeways / I am open"';
                          if (style <= 50) return 'Somewhat planned - "A bit of structure with flexibility"';
                          if (style <= 75) return 'Well planned - "Good balance of planning and spontaneity"';
                          return 'Completely planned - "Can\'t waste a single second! / I will be always active"';
                        }
                        
                        return style;
                      })()}
                    </p>
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
              
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowSavePreferences(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all"
                  >
                    💾 Save These Preferences
                  </button>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="btn-secondary text-lg px-8 py-4 mr-4"
                  >
                    ← Go Back & Edit
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🚀 AI Summary button clicked - EVENT FIRED!');
                      console.log('Button element:', e.currentTarget);
                      console.log('Current tripPreferences:', tripPreferences);
                      console.log('isComplete() result:', isComplete());
                      console.log('showAIPrompt state:', showAIPrompt);
                      console.log('aiPrompt state:', aiPrompt);
                      
                      // Check if data is complete
                      if (!isComplete()) {
                        console.error('❌ Cannot generate AI prompt - survey not complete');
                        alert('Please complete all questions before generating AI summary.');
                        return;
                      }
                      
                      // Mark AI planning guide as completed
                      localStorage.setItem('ai_planning_guide_completed', 'true');
                      
                      try {
                        console.log('🔄 Generating AI prompt...');
                        const prompt = promptService.generateBigPicturePrompt({
                          type: 'big-picture',
                          tripPreferences: tripPreferences as TripPreferences
                        });
                        console.log('✅ Generated prompt:', prompt);
                        setAiPrompt(prompt);
                        setShowAIPrompt(true);
                        setShowSummary(false);
                        console.log('✅ AI Prompt modal should be showing');
                        console.log('✅ State updated - showAIPrompt:', true, 'aiPrompt set:', !!prompt);
                      } catch (error) {
                        console.error('❌ Error generating AI prompt:', error);
                        alert('Error generating AI prompt. Please try again.');
                      }
                    }}
                    className="btn-primary text-lg px-8 py-4"
                    style={{ zIndex: 1000, position: 'relative' }}
                  >
                    Continue to AI Prompt 🚀
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Save Preferences Modal */}
        {showSavePreferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSavePreferences(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  💾 Save Trip Preferences
                </h2>
                <button
                  onClick={() => setShowSavePreferences(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Give your preferences a memorable name so you can reuse them for future trips:
                </p>
                <input
                  type="text"
                  value={preferencesName}
                  onChange={(e) => setPreferencesName(e.target.value)}
                  placeholder="e.g., Family Summer Vacation, Solo Adventure, etc."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && preferencesName.trim()) {
                      savePreferencesSet();
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowSavePreferences(false)}
                  className="px-6 py-3 rounded-xl font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={savePreferencesSet}
                  disabled={!preferencesName.trim()}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    preferencesName.trim()
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  💾 Save Preferences
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* AI Prompt Display */}
      {showAIPrompt && aiPrompt && (
        <AIPromptDisplay
          prompt={aiPrompt}
          onClose={handlePromptClose}
        />
      )}
    </div>
  );
};

export default BigIdeaPage; 