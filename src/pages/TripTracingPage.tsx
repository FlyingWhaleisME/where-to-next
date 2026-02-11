import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIPromptDisplay from '../components/AIPromptDisplay';
import promptService from '../services/promptService';
import { TripPreferences, TripTracingState, GeneratedPrompt } from '../types';
import AccommodationSection from '../components/tripTracing/AccommodationSection';
import TravelMethodSection from '../components/tripTracing/TravelMethodSection';
import TransportationSection from '../components/tripTracing/TransportationSection';
import MealPatternsSection from '../components/tripTracing/MealPatternsSection';
import FlightSection from '../components/tripTracing/FlightSection';
import ExpensesSection from '../components/tripTracing/ExpensesSection';
import FoodPreferencesSection from '../components/tripTracing/FoodPreferencesSection';

const TripTracingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(1);
  const [tripPreferences, setTripPreferences] = useState<TripPreferences | null>(null);
  const [tripTracingState, setTripTracingState] = useState<Partial<TripTracingState>>({});
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<GeneratedPrompt | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const totalSections = 7;

  useEffect(() => {
    console.log('🎯 TRIP TRACING PAGE LOADED');
    
    // Check authentication first
    const { getCurrentUser, isAuthenticated } = require('../services/apiService');
    const { getUserData, migrateUserData } = require('../utils/userDataStorage');
    
    if (!isAuthenticated()) {
      console.log('🔒 [DEBUG] TripTracingPage: Not authenticated, redirecting');
      navigate('/');
      return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.log('🔒 [DEBUG] TripTracingPage: No user ID, redirecting');
      navigate('/');
      return;
    }
    
    // Try to migrate old data on first load
    migrateUserData(currentUser.id);
    
    // Load trip preferences from user-specific storage
    const saved = getUserData('tripPreferences');
    const savedPrefs = getUserData('savedTripPreferences');
    
    if (saved) {
      console.log('✅ Trip preferences loaded for user:', currentUser.id);
      setTripPreferences(saved);
    } else if (savedPrefs && Array.isArray(savedPrefs) && savedPrefs.length > 0) {
      console.log('✅ Using saved trip preferences for user:', currentUser.id);
      setTripPreferences(savedPrefs[0].preferences);
    } else {
      console.log('❌ No trip preferences found for user:', currentUser.id, 'redirecting to Big Picture');
      navigate('/big-picture');
    }

  }, [navigate]);


  const handleNext = () => {
    // 1. Check if there are more sections to navigate to
    if (currentSection < totalSections) {
      // 2. Calculate next section (default: current + 1)
      let nextSection = currentSection + 1;
      
      // 3. Check if section 3 (Flight) should be skipped based on travel method
      if (currentSection === 2) {
        // Get the most current transportation method from localStorage as backup
        const savedState = localStorage.getItem('tripTracingState');
        let travelMethod = tripTracingState.travelMethod?.travelMethod;
        
        if (savedState && !travelMethod) {
          try {
            const parsed = JSON.parse(savedState);
            travelMethod = parsed.travelMethod?.travelMethod;
          } catch (error) {
            console.error('Error parsing saved state:', error);
          }
        }
        
        console.log('Navigation Debug - Current section:', currentSection, 'Travel method:', travelMethod, 'Next section will be:', nextSection);
        
        // Only skip section 3 (Flight) if we have a definitive non-flight method
        if (travelMethod === 'driving' || travelMethod === 'public_transport') {
          console.log('Skipping FlightSection - travel method is:', travelMethod);
          nextSection = 4; // Skip to section 4 (Transportation)
        } else {
          console.log('Proceeding to FlightSection - travel method is:', travelMethod || 'undefined (defaulting to show flights)');
        }
      }
      
      // For section 5 (Meal patterns), check if we should skip section 6 (Expenses) for solo travelers
      if (currentSection === 5 && tripPreferences?.groupSize === 'solo') {
        console.log('Skipping ExpensesSection - solo traveler');
        nextSection = 7; // Skip to section 7 (Food preferences)
      }
      
      // 4. Navigate to the calculated next section
      setCurrentSection(nextSection);
      
      // Scroll to top of page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isComplete()) {
      // 5. Save Trip Tracing survey with metadata before showing summary
      saveTripTracingSurvey();
      
      // 6. Show summary review instead of AI prompt
      setShowSummary(true);
      
      // 7. Scroll to top to ensure summary modal is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    // 1. Check if not on the first section
    if (currentSection > 1) {
      // 2. Calculate previous section (default: current - 1)
      let prevSection = currentSection - 1;
      
      // 3. Check if section 3 (Flight) should be skipped when going backwards
      if (currentSection === 4) {
        const savedState = localStorage.getItem('tripTracingState');
        let travelMethod = tripTracingState.travelMethod?.travelMethod;
        
        if (savedState && !travelMethod) {
          try {
            const parsed = JSON.parse(savedState);
            travelMethod = parsed.travelMethod?.travelMethod;
          } catch (error) {
            console.error('Error parsing saved state:', error);
          }
        }
        
        // Only skip section 3 (Flight) if we have a definitive non-flight method
        if (travelMethod === 'driving' || travelMethod === 'public_transport') {
          console.log('Skipping FlightSection going backwards - travel method is:', travelMethod);
          prevSection = 2; // Go back to section 2 (Travel method)
        }
      }
      
      // 4. Check if section 6 (Expenses) should be skipped when going backwards for solo travelers
      if (currentSection === 7 && tripPreferences?.groupSize === 'solo') {
        console.log('Skipping ExpensesSection going backwards - solo traveler');
        prevSection = 5; // Go back to section 5 (Meal patterns)
      }
      
      // 5. Navigate to the calculated previous section
      setCurrentSection(prevSection);
      
      // Scroll to top of page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentSection === 1) {
      // If on first section, navigate back to Big Idea survey summary
      navigate('/summary');
    }
  };

  const handleSectionAnswer = (sectionNumber: number, answer: any) => {
    console.log(`Section ${sectionNumber} answered with:`, answer);
    setTripTracingState(prev => {
      const newState = {
          ...prev,
        ...answer
      };
      console.log('Updated tripTracingState:', newState);
      
      // Save to user-specific storage immediately for navigation logic
      const { setUserData } = require('../utils/userDataStorage');
      const { getCurrentUser, isAuthenticated } = require('../services/apiService');
      
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id) {
          setUserData('tripTracingState', newState);
        }
      }
      
      
      return newState;
    });
  };

  const isComplete = (): boolean => {
    // 1. Check base requirements, always required regardless of user choices
    const baseRequirementsComplete = !!(
      tripTracingState.accommodation?.selectedTypes &&
      tripTracingState.accommodation.selectedTypes.length > 0 &&
      tripTracingState.travelMethod?.travelMethod &&
      tripTracingState.transportation?.selectedMethods &&
      tripTracingState.transportation.selectedMethods.length > 0 &&
      tripTracingState.mealPatterns?.selectedMeals &&
      tripTracingState.mealPatterns.selectedMeals.length > 0 &&
      tripTracingState.foodPreferences?.styles &&
      tripTracingState.foodPreferences.styles.length > 0
    );
    
    // 2. Check conditional requirements, expenses only needed for group travelers (not solo)
    const expensesComplete = tripPreferences?.groupSize === 'solo' 
      ? true // Solo travelers don't need expense sharing
      : !!(tripTracingState.expenses?.type); // Group travelers need expense type
    
    // 3. Check conditional requirements, flight details only needed if travel method requires flights
    const travelMethod = tripTracingState.travelMethod?.travelMethod;
    const flightComplete = (travelMethod === 'flights' || travelMethod === 'undecided')
      ? !!(tripTracingState.flight?.priority && tripTracingState.flight?.flightType)
      : true; // Not required if not flying
    
    return baseRequirementsComplete && expensesComplete && flightComplete;
  };

  const saveTripTracingSurvey = () => {
    if (!isComplete()) return;

    // Create survey with metadata
    const surveyId = `trip_tracing_${Date.now()}`;
    const surveyName = `Trip Tracing Survey - ${new Date().toLocaleDateString()}`;
    const surveyDate = new Date().toISOString();
    
    // Determine which sections were completed
    const sectionsCompleted: string[] = [];
    if (tripTracingState.accommodation) sectionsCompleted.push('accommodation');
    if (tripTracingState.travelMethod) sectionsCompleted.push('travelMethod');
    if (tripTracingState.transportation) sectionsCompleted.push('transportation');
    if (tripTracingState.mealPatterns) sectionsCompleted.push('mealPatterns');
    if (tripTracingState.flight) sectionsCompleted.push('flight');
    if (tripTracingState.expenses) sectionsCompleted.push('expenses');
    if (tripTracingState.foodPreferences) sectionsCompleted.push('foodPreferences');

    // Create enhanced survey data with metadata
    const enhancedSurveyData = {
      ...tripTracingState,
      surveyId,
      surveyName,
      surveyDate,
      groupSize: tripPreferences?.groupSize,
      isSoloTraveler: tripPreferences?.groupSize === 'solo',
      sectionsCompleted
    };

    // Save to user-specific storage as latest Trip Tracing survey
    const { setUserData } = require('../utils/userDataStorage');
    const { getCurrentUser, isAuthenticated } = require('../services/apiService');
    
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id) {
        setUserData('tripTracingState', enhancedSurveyData);
      }
    }

    // Also save to saved surveys list
    const savedSurveys = JSON.parse(localStorage.getItem('savedTripTracingSurveys') || '[]');
    const newSurvey = {
      id: surveyId,
      name: surveyName,
      surveyData: enhancedSurveyData,
      createdAt: surveyDate,
      lastModified: surveyDate
    };

    // Check if this is an update to existing survey or new one
    const existingIndex = savedSurveys.findIndex((s: any) => 
      s.surveyData.groupSize === tripPreferences?.groupSize &&
      s.surveyData.travelMethod?.travelMethod === tripTracingState.travelMethod?.travelMethod
    );

    if (existingIndex >= 0) {
      // Update existing survey
      savedSurveys[existingIndex] = newSurvey;
    } else {
      // Add new survey
      savedSurveys.push(newSurvey);
    }

    localStorage.setItem('savedTripTracingSurveys', JSON.stringify(savedSurveys));
    
    console.log('✅ Trip Tracing survey saved with metadata:', {
      surveyId,
      surveyName,
      groupSize: tripPreferences?.groupSize,
      isSoloTraveler: tripPreferences?.groupSize === 'solo',
      sectionsCompleted,
      hasExpenseSharing: !!tripTracingState.expenses
    });

    // Update existing documents with trip tracing data
    updateDocumentsWithTripTracingData(enhancedSurveyData);

    // Create shared document for non-solo travelers
    if (tripPreferences?.groupSize !== 'solo') {
      createSharedDocument(enhancedSurveyData);
    }
  };

  const updateDocumentsWithTripTracingData = (tripTracingData: any) => {
    try {
      const savedDocs = localStorage.getItem('destinationDocuments');
      if (savedDocs) {
        const docs = JSON.parse(savedDocs);
        const updatedDocs = docs.map((doc: any) => ({
          ...doc,
          tripTracingSurveyData: tripTracingData,
          lastModified: new Date().toISOString()
        }));
        localStorage.setItem('destinationDocuments', JSON.stringify(updatedDocs));
        console.log('✅ Updated documents with trip tracing data');
      }
    } catch (error) {
      console.error('Error updating documents with trip tracing data:', error);
    }
  };

  const createSharedDocument = async (tripTracingData: any) => {
    try {
      const savedDocs = localStorage.getItem('destinationDocuments');
      if (savedDocs) {
        const docs = JSON.parse(savedDocs);
        if (docs.length > 0) {
          // Use the first document as the main document to share
          const mainDocument = docs[0];
          
          // Create a comprehensive document with both big idea and trip tracing data
          const documentToShare = {
            ...mainDocument,
            tripTracingSurveyData: tripTracingData,
            lastModified: new Date().toISOString()
          };

          // Call the backend API to create a shared document
          const response = await fetch('/api/documents/share', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              documentData: documentToShare,
              documentId: mainDocument.id
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Document shared successfully with code:', result.shareCode);
            
            // Store the share code in localStorage for the user to access
            localStorage.setItem('latestSharedDocumentCode', result.shareCode);
            
            // Dispatch an event to notify other components
            window.dispatchEvent(new CustomEvent('documentShared', {
              detail: { shareCode: result.shareCode, documentId: mainDocument.id }
            }));
    } else {
            console.error('Failed to create shared document');
          }
        }
      }
    } catch (error) {
      console.error('Error creating shared document:', error);
    }
  };

  const handlePromptClose = () => {
    setShowAIPrompt(false);
    
    // Check if there are any documents that need editing
    const savedDocs = localStorage.getItem('destinationDocuments');
    if (savedDocs) {
      try {
        const docs = JSON.parse(savedDocs);
        if (docs.length > 0) {
          // Navigate to profile with focus on documents section
          navigate('/profile?section=documents');
        } else {
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error parsing documents:', error);
        navigate('/profile');
      }
    } else {
      navigate('/profile');
    }
  };

  const handleBackToSurvey = () => {
    setShowAIPrompt(false);
    setShowSummary(true);
  };

  const renderSection = () => {
    const commonProps = {
      onAnswer: handleSectionAnswer,
      onNext: handleNext,
      onPrevious: handlePrevious,
      currentSection,
      totalSections,
      canProceed: true
    };

    switch (currentSection) {
      case 1:
        return <AccommodationSection {...commonProps} />;
      case 2:
        return <TravelMethodSection {...commonProps} />;
      case 3:
        return <FlightSection {...commonProps} />;
      case 4:
        return <TransportationSection {...commonProps} />;
      case 5:
        return <MealPatternsSection {...commonProps} />;
      case 6:
        return <ExpensesSection {...commonProps} />;
      case 7:
        return <FoodPreferencesSection {...commonProps} />;
      default:
        return null;
    }
  };

  if (!tripPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hawaii-mint to-white py-20">
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
    <div className="min-h-screen bg-gradient-to-br from-hawaii-mint to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            🔍 Trip Tracing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Dive deeper into your travel preferences for accommodation, transportation, meals, and food styles
          </p>
          
          
        {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <motion.div
              className="bg-gradient-to-r from-hawaii-peach to-hawaii-coral h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentSection / totalSections) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="text-lg text-gray-600">
            Section {currentSection} of {totalSections}
        </div>
        </motion.div>

        {/* Section Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
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
                  Review Your Trip Tracing Responses
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
                    <h3 className="font-semibold text-gray-700 mb-2">Accommodation</h3>
                    <div className="text-gray-900">
                      {tripTracingState.accommodation?.selectedTypes && tripTracingState.accommodation.selectedTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tripTracingState.accommodation.selectedTypes.map((type, index) => {
                            const option = ['hotel', 'hostel', 'airbnb', 'resort', 'guesthouse', 'camping', 'dont-mind']
                              .map(val => ({
                                value: val,
                                label: val === 'hotel' ? 'Hotel' :
                                       val === 'hostel' ? '🛏️ Hostel' :
                                       val === 'airbnb' ? 'Airbnb' :
                                       val === 'resort' ? 'Resort' :
                                       val === 'guesthouse' ? '🏡 Guesthouse' :
                                       val === 'camping' ? '⛺ Camping' :
                                       '🤷‍♂️ I don\'t mind'
                              }))
                              .find(opt => opt.value === type);
                            
                            const isDontMind = type === 'dont-mind';
                            return (
                              <span 
                                key={type} 
                                className={`px-2 py-1 rounded-full text-sm ${
                                  isDontMind 
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {!isDontMind && `#${index + 1} `}{option?.label || type}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Travel Method (To Destination)</h3>
                    <div className="text-gray-900">
                      {tripTracingState.travelMethod?.travelMethod ? (
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium">Method:</span> {
                              tripTracingState.travelMethod.travelMethod === 'flights' ? 'Flying' :
                              tripTracingState.travelMethod.travelMethod === 'driving' ? 'Driving' :
                              tripTracingState.travelMethod.travelMethod === 'public_transport' ? '🚂 Public Transportation' :
                              '🤔 Undecided'
                            }
                          </p>
                          {tripTracingState.travelMethod.travelMethod === 'public_transport' && tripTracingState.travelMethod.publicTransportType && (
                            <p>
                              <span className="font-medium">Type:</span> {
                                tripTracingState.travelMethod.publicTransportType === 'train' ? '🚂 Train' :
                                tripTracingState.travelMethod.publicTransportType === 'bus' ? '🚌 Bus' :
                                tripTracingState.travelMethod.publicTransportType === 'ferry' ? '🚢 Ferry/Boat' :
                                tripTracingState.travelMethod.publicTransportType === 'cruise' ? '🛳️ Cruise' :
                                `🚁 ${tripTracingState.travelMethod.publicTransportDetails}`
                              }
                            </p>
                          )}
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Local Transportation (Within Destination)</h3>
                    <div className="text-gray-900">
                      {tripTracingState.transportation?.selectedMethods && tripTracingState.transportation.selectedMethods.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tripTracingState.transportation.selectedMethods.map((method, index) => {
                            const option = ['rental-car', 'public-transport', 'ride-sharing', 'walking-biking', 'taxis', 'dont-mind']
                              .map(val => ({
                                value: val,
                                label: val === 'rental-car' ? 'Rental Car' :
                                       val === 'public-transport' ? '🚌 Public Transportation' :
                                       val === 'ride-sharing' ? '🚕 Ride Sharing' :
                                       val === 'walking-biking' ? '🚶‍♂️ Walking & Biking' :
                                       val === 'taxis' ? '🚖 Taxis' :
                                       '🤷‍♂️ I don\'t mind'
                              }))
                              .find(opt => opt.value === method);
                            
                            const isDontMind = method === 'dont-mind';
                            return (
                              <span 
                                key={method} 
                                className={`px-2 py-1 rounded-full text-sm ${
                                  isDontMind 
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {!isDontMind && `#${index + 1} `}{option?.label || method}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Meal Patterns</h3>
                    <p className="text-gray-900">{tripTracingState.mealPatterns?.selectedMeals?.join(', ') || 'Not specified'}</p>
                  </div>
                  {/* Only show flight details if travel method requires flights */}
                  {(tripTracingState.travelMethod?.travelMethod === 'flights' || tripTracingState.travelMethod?.travelMethod === 'undecided') && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Flight Priority</h3>
                      <p className="text-gray-900">{tripTracingState.flight?.priority || 'Not specified'}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {/* Only show flight type if travel method requires flights */}
                  {(tripTracingState.travelMethod?.travelMethod === 'flights' || tripTracingState.travelMethod?.travelMethod === 'undecided') && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Flight Type</h3>
                      <p className="text-gray-900">{tripTracingState.flight?.flightType || 'Not specified'}</p>
                    </div>
                  )}
                  {/* Only show expenses for group travelers (not solo) */}
                  {tripPreferences?.groupSize !== 'solo' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Expenses</h3>
                      <p className="text-gray-900">{tripTracingState.expenses?.type || 'Not specified'}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Food Styles</h3>
                    <p className="text-gray-900">{tripTracingState.foodPreferences?.styles?.join(', ') || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <button
                  onClick={() => setShowSummary(false)}
                  className="btn-secondary text-lg px-8 py-4 mr-4"
                >
                  ← Go Back & Edit
                </button>
                
                <button
                  onClick={() => {
                    // Update documents with Trip Tracing survey data
                    const savedDocs = localStorage.getItem('destinationDocuments');
                    if (savedDocs) {
                      try {
                        const docs = JSON.parse(savedDocs);
                        const tripTracingSurveyId = `trip_tracing_${Date.now()}`;
                        const tripTracingSurveyDate = new Date().toISOString();
                        
                        const updatedDocs = docs.map((doc: any) => ({
                          ...doc,
                          bigIdeaSurveyData: tripPreferences,
                          tripTracingSurveyData: tripTracingState,
                          lastModified: new Date().toISOString(),
                          surveyOrigin: {
                            ...doc.surveyOrigin,
                            tripTracingSurveyId: tripTracingSurveyId,
                            tripTracingSurveyDate: tripTracingSurveyDate
                          }
                        }));
                        localStorage.setItem('destinationDocuments', JSON.stringify(updatedDocs));
                        console.log('Documents updated with survey data:', updatedDocs);
                      } catch (error) {
                        console.error('Error updating documents with survey data:', error);
                      }
                    }
                    
                    try {
                      const prompt = promptService.generateTripTracingPrompt({
                        type: 'trip-tracing',
                        tripPreferences: tripPreferences as TripPreferences,
                        tripTracingState: tripTracingState as TripTracingState
                      });
                      setAiPrompt(prompt);
                      setShowAIPrompt(true);
                      setShowSummary(false);
                    } catch (error) {
                      console.error('Error generating AI prompt:', error);
                      alert('Error generating AI prompt. Please try again.');
                    }
                  }}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Continue to AI Prompt
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
          onBackToSurvey={handleBackToSurvey}
          showBackToSurvey={true}
        />
      )}

    </div>
  );
};

export default TripTracingPage;