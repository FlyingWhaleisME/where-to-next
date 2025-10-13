import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DocumentData } from '../types';
import promptService from '../services/promptService';
import AIPromptDisplay from '../components/AIPromptDisplay';

// Tooltip component
const Tooltip: React.FC<{ children: React.ReactNode; text: string }> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [tripPreferences, setTripPreferences] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [savedTripPreferences, setSavedTripPreferences] = useState<any[]>([]);
  const [flightStrategies, setFlightStrategies] = useState<any[]>([]);
  const [expensePolicySets, setExpensePolicySets] = useState<any[]>([]);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<any>(null);

  // Helper function to format budget with currency and type
  const formatBudget = (preferences: any): string => {
    if (preferences.isNotSure) {
      return 'User is unsure about budget - needs guidance';
    }
    
    if (!preferences.budget || preferences.budget === 0) {
      return 'Budget not specified';
    }
    
    const budget = preferences.budget;
    const currency = preferences.currency || 'USD';
    const budgetType = preferences.budgetType || 'total';
    
    // Format currency symbol
    const currencySymbols: {[key: string]: string} = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'KRW': '₩',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'BRL': 'R$',
      'MXN': '$',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NZD': 'NZ$',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RUB': '₽',
      'TRY': '₺',
      'ZAR': 'R',
      'ILS': '₪',
      'AED': 'د.إ',
      'SAR': '﷼',
      'THB': '฿',
      'MYR': 'RM',
      'PHP': '₱',
      'IDR': 'Rp',
      'VND': '₫'
    };
    
    const symbol = currencySymbols[currency] || currency;
    const formattedBudget = budget.toLocaleString();
    
    if (budgetType === 'perDay') {
      return `${symbol}${formattedBudget} per day (${currency})`;
    } else {
      return `${symbol}${formattedBudget} total budget (${currency})`;
    }
  };

  useEffect(() => {
    // Check if we should focus on documents section after Trip Tracing
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    
    if (section === 'documents') {
      // Scroll to documents section after a short delay
      setTimeout(() => {
        const documentsSection = document.getElementById('documents-section');
        if (documentsSection) {
          documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [location]);

  // Helper function to load all user data
  const loadUserData = () => {
    try {
      const savedDocs = localStorage.getItem('destinationDocuments');
      if (savedDocs) {
        const allDocs = JSON.parse(savedDocs);
        console.log('ProfilePage: All documents loaded:', allDocs);
        // Show ALL documents on profile page (including auto-created ones)
        setDocuments(allDocs);
      }

      const savedPrefs = localStorage.getItem('tripPreferences');
      if (savedPrefs) {
        setTripPreferences(JSON.parse(savedPrefs));
      }

      const savedStrategies = localStorage.getItem('flightStrategies');
      if (savedStrategies) {
        setFlightStrategies(JSON.parse(savedStrategies));
      }

      const savedPolicySets = localStorage.getItem('expensePolicySets');
      if (savedPolicySets) {
        setExpensePolicySets(JSON.parse(savedPolicySets));
      }

      const savedTripPrefs = localStorage.getItem('savedTripPreferences');
      if (savedTripPrefs) {
        setSavedTripPreferences(JSON.parse(savedTripPrefs));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    // Load user data on mount
    loadUserData();

    // Listen for user login to reload data
    const handleUserLogin = () => {
      console.log('ProfilePage: User logged in, reloading data');
      loadUserData();
    };

    // Listen for user logout to clear all data
    const handleUserLogout = () => {
      console.log('ProfilePage: User logged out, clearing all data');
      setDocuments([]);
      setTripPreferences(null);
      setSelectedDestination('');
      setSavedTripPreferences([]);
      setFlightStrategies([]);
      setExpensePolicySets([]);
      setShowAIPrompt(false);
      setAiPrompt(null);
    };

    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);

    // Cleanup
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, []);

  const handleCreateDocument = () => {
    if (!selectedDestination.trim()) return;

    // Check if document already exists for this destination
    const existingDoc = documents.find(doc => doc.destinationName === selectedDestination.trim());
    if (existingDoc) {
      navigate(`/edit-document/${existingDoc.id}`);
      return;
    }

    // Pass the destination name as a URL parameter
    navigate(`/edit-document/new?destination=${encodeURIComponent(selectedDestination.trim())}`);
  };

  const handleEditDocument = (document: DocumentData) => {
    navigate(`/edit-document/${document.id}`);
  };


  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      const updatedDocs = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocs);
      localStorage.setItem('destinationDocuments', JSON.stringify(updatedDocs));
    }
  };

  const resumeFromSavedPreferences = (preferenceSet: any) => {
    // Load the saved preferences into current trip preferences
    localStorage.setItem('tripPreferences', JSON.stringify(preferenceSet.preferences));
    
    // Check if the user has completed the Big Idea survey
    const preferences = preferenceSet.preferences;
    const isBigIdeaComplete = !!(
      preferences.groupSize &&
      preferences.duration &&
      (preferences.budget !== undefined && preferences.budget !== null) &&
      preferences.destinationApproach &&
      preferences.destinationApproach.travelType &&
      preferences.destinationApproach.destinationStatus &&
      preferences.tripVibe &&
      preferences.planningStyle &&
      preferences.priorities &&
      preferences.priorities.length > 0 &&
      // Check destination style completion
      ((preferences.destinationApproach.destinationStatus === 'open' || 
        preferences.destinationApproach.destinationStatus === 'in_mind')
        ? !!(preferences.destinationStyle || (preferences.destinationStyles && preferences.destinationStyles.length > 0))
        : true)
    );
    
    if (isBigIdeaComplete) {
      // If Big Idea survey is complete, go to Trip Tracing
      navigate('/trip-tracing');
    } else {
      // If not complete, go to Big Idea survey to continue
      navigate('/big-picture');
    }
  };

  const deleteSavedPreferences = (preferenceId: string) => {
    if (window.confirm('Are you sure you want to delete this saved preference set?')) {
      const updated = savedTripPreferences.filter(pref => pref.id !== preferenceId);
      setSavedTripPreferences(updated);
      localStorage.setItem('savedTripPreferences', JSON.stringify(updated));
    }
  };

  const generateAIPrompt = (preferences: any) => {
    try {
      const prompt = promptService.generateBigPicturePrompt({
        type: 'big-picture',
        tripPreferences: preferences
      });
      setAiPrompt(prompt);
      setShowAIPrompt(true);
    } catch (error) {
      console.error('Error generating AI prompt:', error);
      alert('Error generating AI prompt. Please try again.');
    }
  };

  const handlePromptClose = () => {
    setShowAIPrompt(false);
    setAiPrompt(null);
  };

  const handleFinalizeDocument = (document: DocumentData) => {
    // Open the finalized document page in a new tab
    window.open(`/finalized-document/${document.id}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            👤 Profile & Documents
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your travel planning documents and organize AI responses
          </p>
        </motion.div>

        {/* Saved Trip Preferences Section */}
        {savedTripPreferences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              💾 Your Saved Trip Preferences
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Resume from any of your saved Big Idea survey preferences (up to 4 most recent)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedTripPreferences.map((preferenceSet) => (
                <motion.div
                  key={preferenceSet.id}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{preferenceSet.name}</h3>
                    <div className="flex space-x-2">
                      <Tooltip text="Resume from this survey">
                        <button
                          onClick={() => resumeFromSavedPreferences(preferenceSet)}
                          className="text-blue-500 hover:text-blue-700 transition-colors text-xl"
                        >
                          ▶️
                        </button>
                      </Tooltip>
                      <Tooltip text="Get AI Prompt">
                        <button
                          onClick={() => generateAIPrompt(preferenceSet.preferences)}
                          className="text-purple-500 hover:text-purple-700 transition-colors text-xl"
                        >
                          🤖
                        </button>
                      </Tooltip>
                      <Tooltip text="Delete preference set">
                        <button
                          onClick={() => deleteSavedPreferences(preferenceSet.id)}
                          className="text-red-500 hover:text-red-700 transition-colors text-xl"
                        >
                          🗑️
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <p><strong>Group Size:</strong> {preferenceSet.preferences.groupSize || 'Not specified'}</p>
                    <p><strong>Duration:</strong> {
                      typeof preferenceSet.preferences.duration === 'string' 
                        ? preferenceSet.preferences.duration 
                        : preferenceSet.preferences.duration 
                          ? 'Complex duration structure'
                          : 'Not specified'
                    }</p>
                    <p><strong>Budget:</strong> {formatBudget(preferenceSet.preferences)}</p>
                    <p><strong>Created:</strong> {formatDate(preferenceSet.createdAt)}</p>
                  </div>
                  
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Continue from Last Big Idea Survey Section */}
        {tripPreferences ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                🎯 Latest Big Idea Survey Results
              </h2>
              <div className="flex space-x-2">
                <Tooltip text="Continue to Trip Tracing">
                  <button
                    onClick={() => navigate('/trip-tracing')}
                    className="text-green-500 hover:text-green-700 transition-colors text-xl"
                  >
                    🚀
                  </button>
                </Tooltip>
                <Tooltip text="Get AI Prompt">
                  <button
                    onClick={() => generateAIPrompt(tripPreferences)}
                    className="text-purple-500 hover:text-purple-700 transition-colors text-xl"
                  >
                    🤖
                  </button>
                </Tooltip>
              </div>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Your most recent Big Idea survey preferences - continue to Trip Tracing or edit
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
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
                  <p className="text-gray-900">{formatBudget(tripPreferences)}</p>
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
            
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              🎯 Continue from Last Big Idea Survey
            </h2>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Big Idea Survey Data Found</h3>
              <p className="text-gray-600 mb-4">
                You haven't completed the Big Idea survey yet, or the data wasn't saved properly.
              </p>
              <button
                onClick={() => navigate('/big-picture')}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Big Idea Survey 🚀
              </button>
            </div>
          </motion.div>
        )}

        {/* Create New Document Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📝 Create New Document
          </h2>
          
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Name
              </label>
              <input
                type="text"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                placeholder="e.g., Tokyo, Japan"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleCreateDocument}
              disabled={!selectedDestination.trim()}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                selectedDestination.trim()
                  ? 'btn-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Document 📋
            </button>
          </div>
        </motion.div>

        {/* Documents List */}
              <motion.div
          id="documents-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📚 Your Documents
          </h2>
          
          {/* Trip Tracing Completion Banner */}
          {new URLSearchParams(location.search).get('section') === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎉</div>
                <div>
                  <h3 className="font-semibold text-green-800">Trip Tracing Complete!</h3>
                  <p className="text-green-700 text-sm">
                    Your documents are ready for editing. Click on any document below to start planning your itinerary.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No documents yet</h3>
              <p className="text-gray-600">
                Create your first document to start organizing your travel plans!
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditDocument(doc)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit document"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleFinalizeDocument(doc)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Finalize document"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete document"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <strong>Created:</strong> {formatDate(doc.createdAt)}
                    </div>
                    <div>
                      <strong>Last Modified:</strong> {formatDate(doc.lastModified)}
                    </div>
                    <div>
                      <strong>Time Slots:</strong> {doc.calendarPlanner.timeSlots.length}
                    </div>
                    <div>
                      <strong>Accommodation Options:</strong> {doc.optionsOrganizer.accommodation.length}
                    </div>
                    <div>
                      <strong>Meal Options:</strong> {doc.optionsOrganizer.meals.length}
                    </div>
                    <div>
                      <strong>Activity Options:</strong> {doc.optionsOrganizer.activities.length}
                    </div>
                  </div>
                  
                  {/* Survey Origin Information */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">📋 Survey Origin</h4>
                    <div className="space-y-1 text-xs text-blue-700">
                      {doc.surveyOrigin?.bigIdeaSurveyName ? (
                        <div>
                          <strong>Big Idea:</strong> {doc.surveyOrigin.bigIdeaSurveyName}
                          <br />
                          <span className="text-blue-600">
                            {new Date(doc.surveyOrigin.bigIdeaSurveyDate || '').toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-blue-600">
                          <strong>Big Idea:</strong> Legacy survey (no tracking)
                        </div>
                      )}
                      
                      {doc.surveyOrigin?.tripTracingSurveyId ? (
                        <div className="mt-1">
                          <strong>Trip Tracing:</strong> Completed
                          <br />
                          <span className="text-blue-600">
                            {new Date(doc.surveyOrigin.tripTracingSurveyDate || '').toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 text-blue-500">
                          <strong>Trip Tracing:</strong> Not completed
                        </div>
                      )}
                      
                      {/* Group Travel Indicator for Companion Contract */}
                      {(doc.bigIdeaSurveyData?.groupSize || doc.surveyData?.groupSize) !== 'solo' && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <div className="text-green-700 text-xs">
                            🤝 <strong>Group Travel:</strong> Companion contract available in finalized document
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>
        )}
        </motion.div>

        {/* Flight Strategies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            ✈️ Your Flight Booking Strategies
          </h2>
          
          {flightStrategies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No flight strategies yet</h3>
              <p className="text-gray-600">
                Create custom flight booking strategies during Trip Tracing to reuse them later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {flightStrategies.map((strategy) => (
                <motion.div
                  key={strategy.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {strategy.name}
                    </h3>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this strategy?')) {
                          const updatedStrategies = flightStrategies.filter(s => s.id !== strategy.id);
                          setFlightStrategies(updatedStrategies);
                          localStorage.setItem('flightStrategies', JSON.stringify(updatedStrategies));
                        }
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete strategy"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div>
                      <strong>Created:</strong> {formatDate(strategy.createdAt)}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {strategy.strategy}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Expense Policy Sets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            💰 Your Expense Sharing Policy Sets
          </h2>
          
          {expensePolicySets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No expense policy sets yet</h3>
              <p className="text-gray-600">
                Create custom expense sharing policies during Trip Tracing to reuse them later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {expensePolicySets.map((policySet) => (
                <motion.div
                  key={policySet.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {policySet.name}
                    </h3>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this policy set?')) {
                          const updatedPolicySets = expensePolicySets.filter(p => p.id !== policySet.id);
                          setExpensePolicySets(updatedPolicySets);
                          localStorage.setItem('expensePolicySets', JSON.stringify(updatedPolicySets));
                        }
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete policy set"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div>
                      <strong>Created:</strong> {formatDate(policySet.createdAt)}
                    </div>
                    <div>
                      <strong>Policies:</strong> {policySet.policies.length}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Policies:</h4>
                    <ul className="space-y-1">
                      {policySet.policies.map((policy: string, index: number) => (
                        <li key={index} className="text-gray-700 text-sm flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {policy}
                        </li>
                      ))}
                    </ul>
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
          className="text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="btn-secondary text-lg px-8 py-4 mr-4"
          >
            ← Back to homepage
          </button>
          
          <button
            onClick={() => navigate('/big-picture')}
            className="btn-primary text-lg px-8 py-4"
          >
            Start planning a new trip.
          </button>
        </motion.div>
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

export default ProfilePage;