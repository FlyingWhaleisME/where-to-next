import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentData } from '../types';

const DocumentEditingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [documentName, setDocumentName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [budgetAmount, setBudgetAmount] = useState<number | ''>('');
  const [budgetPerDay, setBudgetPerDay] = useState(false);
  const [budgetCurrency, setBudgetCurrency] = useState('USD');
  const [budgetNotes, setBudgetNotes] = useState('');
  const [transportationTo, setTransportationTo] = useState('');
  const [transportationWithin, setTransportationWithin] = useState('');
  const [transportationToNotes, setTransportationToNotes] = useState('');
  const [transportationWithinNotes, setTransportationWithinNotes] = useState('');
  const [expenseSharingPolicy, setExpenseSharingPolicy] = useState('');
  const [customExpensePolicies, setCustomExpensePolicies] = useState<string[]>(['']);
  const [groupMembers, setGroupMembers] = useState<string[]>(['']);
  const [groupRules, setGroupRules] = useState<string[]>(['']);
  const [showGroupRules, setShowGroupRules] = useState(false);
  const [travelerName, setTravelerName] = useState('');
  
  // Additional state for options organizer
  const [accommodationOptions, setAccommodationOptions] = useState<string[]>([]);
  const [mealOptions, setMealOptions] = useState<string[]>([]);
  const [activityOptions, setActivityOptions] = useState<string[]>([]);
  
  // State for preference switching
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [savedPreferences, setSavedPreferences] = useState<any[]>([]);
  const [selectedPreference, setSelectedPreference] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      navigate('/profile');
      return;
    }

    // Handle creating a new document
    if (id === 'new') {
      // Get destination name from URL parameters
      const urlParams = new URLSearchParams(location.search);
      const destinationName = urlParams.get('destination') || '';
      
      // Create a new document with default values
      const newDocument: DocumentData = {
        id: `doc_${Date.now()}`,
        destinationName: destinationName,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        editableFields: {},
        bigIdeaSurveyData: undefined,
        tripTracingSurveyData: undefined,
        surveyOrigin: undefined,
        optionsOrganizer: {
          accommodation: [],
          meals: [],
          activities: []
        },
        calendarPlanner: {
          duration: '',
          dates: [],
          timeSlots: []
        }
      };
      
      setDocument(newDocument);
      setDocumentName(destinationName);
      setLoading(false);
      return;
    }

    // Load document from localStorage
    const savedDocs = localStorage.getItem('destinationDocuments');
    if (savedDocs) {
      try {
        const docs: DocumentData[] = JSON.parse(savedDocs);
        const foundDoc = docs.find(doc => doc.id === id);
        
        if (foundDoc) {
          setDocument(foundDoc);
          
          // Initialize document name
          setDocumentName(foundDoc.destinationName || '');
          
          // Initialize form with existing data or Big Idea survey defaults
          const editableFields = foundDoc.editableFields || {};
          const bigIdeaData = foundDoc.bigIdeaSurveyData;
          
          // Dates and Duration - use editable fields first, then survey data
          let surveyStartDate = '';
          let surveyEndDate = '';
          let surveyDuration = '';
          
          if (bigIdeaData?.duration) {
            // Handle complex duration structure
            if (typeof bigIdeaData.duration === 'object') {
              const durationData = bigIdeaData.duration;
              
              // Use dates if they were decided
              if (durationData.dates?.status === 'decided' && durationData.dates.startDate && durationData.dates.endDate) {
                surveyStartDate = durationData.dates.startDate;
                surveyEndDate = durationData.dates.endDate;
              }
              
              // Use duration if it was decided
              if (durationData.duration?.status === 'decided') {
                const days = parseInt(durationData.duration.days) || 0;
                const weeks = parseInt(durationData.duration.weeks) || 0;
                const months = parseInt(durationData.duration.months) || 0;
                
                const parts = [];
                if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
                if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
                if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
                
                surveyDuration = parts.join(', ') || 'Not specified';
              }
            } else if (typeof bigIdeaData.duration === 'string') {
              surveyDuration = bigIdeaData.duration;
            }
          }
          
          setStartDate(editableFields.dates?.startDate || surveyStartDate);
          setEndDate(editableFields.dates?.endDate || surveyEndDate);
          setDuration(editableFields.dates?.duration || surveyDuration);
          
          // Budget - use editable fields first, then Big Idea survey data
          const budgetFromSurvey = bigIdeaData?.budget ? Number(bigIdeaData.budget) : '';
          const currencyFromSurvey = bigIdeaData?.currency || 'USD';
          const budgetTypeFromSurvey = bigIdeaData?.budgetType === 'perDay';
          
          setBudgetAmount(editableFields.budget?.amount || budgetFromSurvey || '');
          setBudgetPerDay(editableFields.budget?.perDay !== undefined ? editableFields.budget.perDay : budgetTypeFromSurvey);
          setBudgetCurrency(editableFields.budget?.currency || currencyFromSurvey);
          setBudgetNotes(editableFields.budget?.notes || '');
          
          // Transportation - use editable fields first, then Trip Tracing data
          const tripTracingData = foundDoc.tripTracingSurveyData;
          setTransportationTo(editableFields.transportation?.toDestination || 
            tripTracingData?.travelMethod?.travelMethod || '');
          setTransportationWithin(editableFields.transportation?.withinDestination || 
            (tripTracingData?.transportation?.selectedMethods ? 
              tripTracingData.transportation.selectedMethods.join(', ') : ''));
          setTransportationToNotes(editableFields.transportation?.toNotes || '');
          setTransportationWithinNotes(editableFields.transportation?.withinNotes || '');
          
          // Expense sharing and group rules
          setExpenseSharingPolicy(editableFields.expenseSharing?.policy || 
            tripTracingData?.expenses?.type || '');
          
          // Load custom expense policies
          const savedCustomPolicies = editableFields.expenseSharing?.customPolicies || 
            tripTracingData?.expenses?.customPolicies || [''];
          setCustomExpensePolicies(savedCustomPolicies.length > 0 ? savedCustomPolicies : ['']);
          
          // Load group members
          const savedGroupMembers = editableFields.groupMembers || [''];
          setGroupMembers(savedGroupMembers.length > 0 ? savedGroupMembers : ['']);
          
          // Load traveler name for solo travel
          const savedTravelerName = editableFields.travelerName || '';
          setTravelerName(savedTravelerName);
          
          // Load group rules
          const savedGroupRules = editableFields.groupRules?.rules || [''];
          setGroupRules(Array.isArray(savedGroupRules) ? savedGroupRules : [savedGroupRules || '']);
          setShowGroupRules(savedGroupRules && savedGroupRules.length > 0 && savedGroupRules[0] !== '');
          
          
          // Options Organizer
          console.log('Loading options organizer:', foundDoc.optionsOrganizer);
          const accommodation = foundDoc.optionsOrganizer?.accommodation || [];
          const meals = foundDoc.optionsOrganizer?.meals || [];
          const activities = foundDoc.optionsOrganizer?.activities || [];
          
          // Add at least one empty slot if none exist
          setAccommodationOptions(accommodation.length > 0 ? accommodation : ['']);
          setMealOptions(meals.length > 0 ? meals : ['']);
          setActivityOptions(activities.length > 0 ? activities : ['']);
          
          // Calendar planner removed - no longer needed
        } else {
          console.error('Document not found');
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error loading document:', error);
        navigate('/profile');
      }
    } else {
      console.error('No documents found');
      navigate('/profile');
    }
    
    // Load saved preferences and latest preferences
    const savedPrefs = localStorage.getItem('savedTripPreferences');
    const latestPrefs = localStorage.getItem('tripPreferences');
    
    let allPreferences = [];
    
    // Add latest preferences first
    if (latestPrefs) {
      try {
        const latest = JSON.parse(latestPrefs);
        allPreferences.push({
          id: 'latest',
          name: 'Latest Big Idea Survey',
          preferences: latest,
          createdAt: new Date().toISOString(),
          isLatest: true
        });
      } catch (error) {
        console.error('Error loading latest preferences:', error);
      }
    }
    
    // Add saved preferences
    if (savedPrefs) {
      try {
        const saved = JSON.parse(savedPrefs);
        allPreferences = [...allPreferences, ...saved];
      } catch (error) {
        console.error('Error loading saved preferences:', error);
      }
    }
    
    setSavedPreferences(allPreferences);
    console.log('Loaded preferences:', allPreferences);

    
    setLoading(false);
  }, [id, navigate]);

  const handleSave = async () => {
    if (!document) return;
    
    setSaving(true);
    
    try {
      const savedDocs = localStorage.getItem('destinationDocuments');
      let docs: DocumentData[] = savedDocs ? JSON.parse(savedDocs) : [];
      
      // Check if this is a new document (not in localStorage yet)
      const existingDocIndex = docs.findIndex(doc => doc.id === document.id);
      
      if (existingDocIndex >= 0) {
        // Update existing document
        docs[existingDocIndex] = {
          ...docs[existingDocIndex],
          destinationName: documentName,
          editableFields: {
            dates: {
              startDate,
              endDate,
              duration
            },
            budget: {
              amount: budgetAmount || undefined,
              perDay: budgetPerDay,
              currency: budgetCurrency,
              notes: budgetNotes
            },
            transportation: {
              toDestination: transportationTo,
              withinDestination: transportationWithin,
              toNotes: transportationToNotes,
              withinNotes: transportationWithinNotes
            },
            expenseSharing: {
              policy: expenseSharingPolicy,
              customPolicies: expenseSharingPolicy === 'custom' ? customExpensePolicies : undefined
            },
            groupMembers: groupMembers,
            groupRules: {
              rules: showGroupRules ? groupRules : []
            },
            travelerName: travelerName,
          },
          optionsOrganizer: {
            accommodation: accommodationOptions,
            meals: mealOptions,
            activities: activityOptions
          },
          calendarPlanner: {
            ...docs[existingDocIndex].calendarPlanner
          },
          lastModified: new Date().toISOString()
        };
        console.log('Document updated successfully');
      } else {
        // Create new document
        const newDocument: DocumentData = {
          ...document,
          destinationName: documentName,
          editableFields: {
            dates: {
              startDate,
              endDate,
              duration
            },
            budget: {
              amount: budgetAmount || undefined,
              perDay: budgetPerDay,
              currency: budgetCurrency,
              notes: budgetNotes
            },
            transportation: {
              toDestination: transportationTo,
              withinDestination: transportationWithin,
              toNotes: transportationToNotes,
              withinNotes: transportationWithinNotes
            },
            expenseSharing: {
              policy: expenseSharingPolicy,
              customPolicies: expenseSharingPolicy === 'custom' ? customExpensePolicies : undefined
            },
            groupMembers: groupMembers,
            groupRules: {
              rules: showGroupRules ? groupRules : []
            },
            travelerName: travelerName,
          },
          optionsOrganizer: {
            accommodation: accommodationOptions,
            meals: mealOptions,
            activities: activityOptions
          },
          calendarPlanner: {
            duration: '',
            dates: [],
            timeSlots: []
          },
          lastModified: new Date().toISOString()
        };
        
        docs.push(newDocument);
        console.log('Document created successfully');
      }
      
      localStorage.setItem('destinationDocuments', JSON.stringify(docs));
      
      // Show success message briefly before navigating
      alert('Document saved successfully! Returning to profile...');
      
      // Navigate back to profile
      navigate('/profile?section=documents');
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceSwitch = (preference: any) => {
    setSelectedPreference(preference);
    setShowPreferenceModal(true);
  };

  const confirmPreferenceSwitch = () => {
    if (!selectedPreference || !document) return;
    
    // Update document with new preference data
    const updatedDoc = {
      ...document,
      bigIdeaSurveyData: selectedPreference.preferences,
      surveyOrigin: {
        ...document.surveyOrigin,
        bigIdeaSurveyId: selectedPreference.id || `switched_${Date.now()}`,
        bigIdeaSurveyName: selectedPreference.name,
        bigIdeaSurveyDate: selectedPreference.createdAt
      }
    };
    
    setDocument(updatedDoc);
    
    // Re-initialize form with new preference data
    const newPrefs = selectedPreference.preferences;
    setBudgetAmount(newPrefs?.budget ? Number(newPrefs.budget) : '');
    setBudgetCurrency(newPrefs?.currency || 'USD');
    setBudgetPerDay(newPrefs?.budgetType === 'perDay');
    setDuration(typeof newPrefs?.duration === 'string' ? newPrefs.duration : 'Complex duration from survey');
    
    setShowPreferenceModal(false);
    setSelectedPreference(null);
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€', 
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$', 
      'KRW': '₩',
      'CNY': '¥'
    };
    return currencyMap[currencyCode] || currencyCode;
  };

  // Helper function to format numbers with thousand separators
  const formatNumberWithSeparators = (value: number | string) => {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return value.toString();
    return num.toLocaleString();
  };

  // Helper function to parse number from formatted string
  const parseFormattedNumber = (value: string) => {
    if (!value) return '';
    const cleaned = value.replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? '' : num;
  };

  // Helper functions for managing arrays
  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Helper function to check if this is group travel
  const isGroupTravel = () => {
    const bigIdeaData = document?.bigIdeaSurveyData;
    const tripTracingData = document?.tripTracingSurveyData;
    
    // Check Big Idea survey data
    if (bigIdeaData?.groupSize && bigIdeaData.groupSize !== 'solo') {
      return true;
    }
    
    // Check Trip Tracing survey data
    if (tripTracingData?.groupSize && tripTracingData.groupSize !== 'solo') {
      return true;
    }
    
    // Check legacy survey data
    if (document?.surveyData?.groupSize && document.surveyData.groupSize !== 'solo') {
      return true;
    }
    
    return false;
  };

  // Helper function to humanize transportation data
  const humanizeTransportation = (transportation: string) => {
    if (!transportation) return '';
    
    const humanizedMap: { [key: string]: string } = {
      'public_transport': 'Public Transportation',
      'rental_car': 'Rental Car',
      'taxi': 'Taxi/Uber',
      'walking': 'Walking',
      'bicycle': 'Bicycle',
      'scooter': 'Scooter',
      'flight': 'Flight',
      'train': 'Train',
      'bus': 'Bus',
      'ferry': 'Ferry',
      'cruise': 'Cruise Ship'
    };
    
    // If it's already human-readable, return as is
    if (Object.values(humanizedMap).includes(transportation)) {
      return transportation;
    }
    
    // If it's a key, return the humanized version
    if (humanizedMap[transportation]) {
      return humanizedMap[transportation];
    }
    
    // If it's a comma-separated list, humanize each item
    if (transportation.includes(',')) {
      return transportation.split(',').map(item => 
        humanizedMap[item.trim()] || item.trim()
      ).join(', ');
    }
    
    // Return as is if no mapping found
    return transportation;
  };

  const renderSurveySummary = (surveyData: any, type: 'bigIdea' | 'tripTracing') => {
    if (!surveyData) return <div className="text-gray-500 text-sm">No data available</div>;
    
    if (type === 'bigIdea') {
      return (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Travel Party:</span>
            <span className="font-medium">{surveyData.groupSize || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Budget Allocation:</span>
            <span className="font-medium">
              {surveyData.budget 
                ? `${getCurrencySymbol(surveyData.currency || 'USD')}${formatNumberWithSeparators(surveyData.budget)}${surveyData.budgetType === 'perDay' ? '/day' : ''}`
                : 'Not specified'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Travel Philosophy:</span>
            <span className="font-medium">{surveyData.tripVibe || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Planning Approach:</span>
            <span className="font-medium">
              {typeof surveyData.planningStyle === 'number' 
                ? `${surveyData.planningStyle}% structured planning`
                : surveyData.planningStyle || 'Not specified'
              }
            </span>
          </div>
          {surveyData.priorities && surveyData.priorities.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Key Priorities:</span>
              <span className="font-medium text-right max-w-48">
                {surveyData.priorities.slice(0, 2).join(', ')}{surveyData.priorities.length > 2 ? '...' : ''}
              </span>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-2 text-sm">
          <div><strong>Group Size:</strong> {surveyData.groupSize || 'Not specified'}</div>
          <div><strong>Travel Type:</strong> {surveyData.isSoloTraveler ? 'Solo Travel' : 'Group Travel'}</div>
          <div><strong>Travel Method:</strong> {surveyData.travelMethod?.travelMethod || 'Not specified'}</div>
          <div><strong>Accommodation:</strong> {
            surveyData.accommodation?.selectedTypes ? 
              surveyData.accommodation.selectedTypes.slice(0, 2).join(', ') : 'Not specified'
          }</div>
          <div><strong>Food Preferences:</strong> {
            surveyData.foodPreferences?.styles ? 
              surveyData.foodPreferences.styles.slice(0, 2).join(', ') : 'Not specified'
          }</div>
          <div><strong>Transportation:</strong> {
            surveyData.transportation?.selectedMethods ? 
              surveyData.transportation.selectedMethods.slice(0, 2).join(', ') : 'Not specified'
          }</div>
          {!surveyData.isSoloTraveler && surveyData.expenses && (
            <div><strong>Expense Sharing:</strong> {
              surveyData.expenses.type === 'custom' 
                ? `Custom (${surveyData.expenses.customPolicies?.length || 0} policies)`
                : surveyData.expenses.type
            }</div>
          )}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-xl text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600">Document not found</p>
        </div>
      </div>
    );
  }

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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Name
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter destination name..."
              className="text-4xl font-bold text-gray-800 text-center bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-4 py-2 w-full max-w-2xl mx-auto"
            />
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Document your AI discussions and finalize your travel details
          </p>
        </motion.div>

        {/* Survey Origin Info with Summaries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-200"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-blue-800">📋 Survey Origin & Summary</h3>
            <div className="flex space-x-3">
              {savedPreferences.length > 0 && (
                <button
                  onClick={() => {
                    console.log('Switch Preferences clicked, savedPreferences:', savedPreferences);
                    setShowPreferenceModal(true);
                  }}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Switch Preferences ({savedPreferences.length})
                </button>
              )}
            </div>
          </div>
          
          {/* Big Idea Survey - Full Width */}
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-blue-800">🎯 Big Idea Survey</h4>
              <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {document.surveyOrigin?.bigIdeaSurveyDate ? 
                  new Date(document.surveyOrigin.bigIdeaSurveyDate).toLocaleDateString() : 
                  'Legacy survey'
                }
              </span>
            </div>
            <div className="text-sm text-blue-700 mb-4">
              <strong>Survey Name:</strong> {document.surveyOrigin?.bigIdeaSurveyName || 'Legacy survey'}
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              {renderSurveySummary(document.bigIdeaSurveyData, 'bigIdea')}
            </div>
          </div>
        </motion.div>

        {/* Group Members Section - Only for Group Travel */}
        {isGroupTravel() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Group Members</h2>
            
            <div className="space-y-4">
              {groupMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => updateArrayItem(setGroupMembers, index, e.target.value)}
                    placeholder={`Group member ${index + 1} name`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {groupMembers.length > 1 && (
                    <button
                      onClick={() => removeArrayItem(setGroupMembers, index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => addArrayItem(setGroupMembers)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>+</span>
                <span>Add Group Member</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Traveler's Name Section - Only for Solo Travel */}
        {!isGroupTravel() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 The Traveler's Name</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  placeholder="Enter your name for the Travel Handbook"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <p className="text-sm text-gray-600">
                This name will be used in your personalized Travel Handbook document.
              </p>
            </div>
          </motion.div>
        )}

        {/* Dates & Duration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📅 Dates & Duration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration Description
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 2 weeks, 10 days, 1 month"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default from Big Idea survey. Update based on your AI discussions.
            </p>
          </div>
        </motion.div>

        {/* Budget Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Budget</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Amount
              </label>
              <div className="flex">
                <select
                  value={budgetCurrency}
                  onChange={(e) => setBudgetCurrency(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                >
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option>
                  <option value="JPY">¥ JPY - Japanese Yen</option>
                  <option value="CAD">C$ CAD - Canadian Dollar</option>
                  <option value="AUD">A$ AUD - Australian Dollar</option>
                  <option value="KRW">₩ KRW - Korean Won</option>
                  <option value="CNY">¥ CNY - Chinese Yuan</option>
                </select>
                <input
                  type="text"
                  value={formatNumberWithSeparators(budgetAmount)}
                  onChange={(e) => {
                    const parsed = parseFormattedNumber(e.target.value);
                    setBudgetAmount(parsed);
                  }}
                  placeholder="Enter amount"
                  className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!budgetPerDay}
                    onChange={() => setBudgetPerDay(false)}
                    className="mr-2"
                  />
                  Total Budget
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={budgetPerDay}
                    onChange={() => setBudgetPerDay(true)}
                    className="mr-2"
                  />
                  Per Day
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Planning Notes
            </label>
            <textarea
              value={budgetNotes}
              onChange={(e) => {
                setBudgetNotes(e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Document key insights from your budget planning discussions, special considerations, or detailed financial breakdowns..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px]"
              style={{ height: 'auto', minHeight: '80px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Capture important financial planning insights and decisions from your comprehensive budget discussions.
            </p>
          </div>
        </motion.div>

        {/* Transportation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🚗 Transportation</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Transportation Method
              </label>
              <input
                type="text"
                value={humanizeTransportation(transportationTo)}
                onChange={(e) => setTransportationTo(e.target.value)}
                placeholder="e.g., Flight from JFK to ICN, Train from Paris to London"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your chosen method for reaching the destination. Intelligently populated from your comprehensive travel survey.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transportation Planning Notes
              </label>
              <textarea
                value={transportationToNotes}
                onChange={(e) => {
                  setTransportationToNotes(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="Document key insights and decisions from your transportation planning discussions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px]"
                style={{ height: 'auto', minHeight: '80px' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Transportation Preferences
              </label>
              <input
                type="text"
                value={humanizeTransportation(transportationWithin)}
                onChange={(e) => setTransportationWithin(e.target.value)}
                placeholder="e.g., Public Transportation, Rental Car, Walking, Taxi/Uber"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your preferred methods for exploring the destination locally. Pre-populated from your detailed survey responses.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Transportation Planning Notes
              </label>
              <textarea
                value={transportationWithinNotes}
                onChange={(e) => {
                  setTransportationWithinNotes(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="Document insights and decisions from your local transportation planning discussions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px]"
                style={{ height: 'auto', minHeight: '80px' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Expense Sharing Section - Only for Group Travel */}
        {isGroupTravel() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Expense Sharing</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Sharing Policy
                </label>
                <select
                  value={expenseSharingPolicy}
                  onChange={(e) => setExpenseSharingPolicy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select expense sharing policy...</option>
                  <option value="split">Split Equally</option>
                  <option value="individual">Individual</option>
                  <option value="alternating">Alternating</option>
                  <option value="category">By Category</option>
                  <option value="income">By Income</option>
                  <option value="custom">Custom Policies</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How will you handle shared expenses during the trip?
                </p>
              </div>
              
              {/* Custom Expense Policies */}
              {expenseSharingPolicy === 'custom' && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Custom Expense Policies
                  </label>
                  <div className="space-y-3">
                    {customExpensePolicies.map((policy, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={policy}
                          onChange={(e) => updateArrayItem(setCustomExpensePolicies, index, e.target.value)}
                          placeholder={`Custom policy ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {customExpensePolicies.length > 1 && (
                          <button
                            onClick={() => removeArrayItem(setCustomExpensePolicies, index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addArrayItem(setCustomExpensePolicies)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <span>+</span>
                      <span>Add Policy</span>
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </motion.div>
        )}

        {/* Group Rules Section - Only for Group Travel */}
        {isGroupTravel() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <input
                type="checkbox"
                id="showGroupRules"
                checked={showGroupRules}
                onChange={(e) => setShowGroupRules(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showGroupRules" className="text-2xl font-bold text-gray-800 cursor-pointer">
                📋 Group Rules
              </label>
            </div>
            
            {showGroupRules && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-gray-600 mb-4">
                  Add any special rules, agreements, or guidelines for your group travel. These will be included in your travel companion contract.
                </p>
                
                {groupRules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateArrayItem(setGroupRules, index, e.target.value)}
                      placeholder={`Group rule ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {groupRules.length > 1 && (
                      <button
                        onClick={() => removeArrayItem(setGroupRules, index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={() => addArrayItem(setGroupRules)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>+</span>
                  <span>Add Group Rule</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}


        {/* Options Organizer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Options Organizer</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Accommodation Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏨 Accommodation Options
              </label>
              <div className="space-y-2">
                {accommodationOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...accommodationOptions];
                        newOptions[index] = e.target.value;
                        setAccommodationOptions(newOptions);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Hotel name, Airbnb, etc."
                    />
                    <button
                      onClick={() => {
                        const newOptions = accommodationOptions.filter((_, i) => i !== index);
                        setAccommodationOptions(newOptions);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setAccommodationOptions([...accommodationOptions, ''])}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  + Add Accommodation Option
                </button>
              </div>
            </div>

            {/* Meal Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🍽️ Meal Options
              </label>
              <div className="space-y-2">
                {mealOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...mealOptions];
                        newOptions[index] = e.target.value;
                        setMealOptions(newOptions);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Restaurant, cuisine type, etc."
                    />
                    <button
                      onClick={() => {
                        const newOptions = mealOptions.filter((_, i) => i !== index);
                        setMealOptions(newOptions);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setMealOptions([...mealOptions, ''])}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  + Add Meal Option
                </button>
              </div>
            </div>

            {/* Activity Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Activity Options
              </label>
              <div className="space-y-2">
                {activityOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...activityOptions];
                        newOptions[index] = e.target.value;
                        setActivityOptions(newOptions);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Museum, tour, activity, etc."
                    />
                    <button
                      onClick={() => {
                        const newOptions = activityOptions.filter((_, i) => i !== index);
                        setActivityOptions(newOptions);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setActivityOptions([...activityOptions, ''])}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  + Add Activity Option
                </button>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-end items-center"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
        </motion.div>
        
        {/* Preference Switching Modal */}
        {showPreferenceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Switch Trip Preferences</h3>
                <button
                  onClick={() => {
                    console.log('Closing preference modal');
                    setShowPreferenceModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              
              {selectedPreference && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-red-600 text-lg mr-2">⚠️</span>
                    <h4 className="font-semibold text-red-800">Warning</h4>
                  </div>
                  <p className="text-red-700 text-sm">
                    Switching preferences will replace the current survey data for this document. 
                    If the current preferences are not saved or not the latest one, they will be lost permanently.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Available Saved Preferences:</h4>
                {savedPreferences.map((pref, index) => (
                  <div
                    key={pref.id || index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPreference?.id === pref.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPreference(pref)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-gray-800">{pref.name}</h5>
                      <span className="text-xs text-gray-500">
                        {new Date(pref.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div><strong>Group Size:</strong> {pref.preferences?.groupSize || 'Not specified'}</div>
                      <div><strong>Budget:</strong> {
                        pref.preferences?.budget 
                          ? `${getCurrencySymbol(pref.preferences?.currency || 'USD')}${pref.preferences.budget}${pref.preferences?.budgetType === 'perDay' ? '/day' : ''}`
                          : 'Not specified'
                      }</div>
                      <div><strong>Trip Vibe:</strong> {pref.preferences?.tripVibe || 'Not specified'}</div>
                      <div><strong>Planning:</strong> {
                        typeof pref.preferences?.planningStyle === 'number' 
                          ? `${pref.preferences.planningStyle}% planned`
                          : pref.preferences?.planningStyle || 'Not specified'
                      }</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPreferenceModal(false);
                    setSelectedPreference(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPreferenceSwitch}
                  disabled={!selectedPreference}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Switch Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEditingPage;
