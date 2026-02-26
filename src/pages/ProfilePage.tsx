import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentData } from '../types';
import promptService from '../services/promptService';
import AIPromptDisplay from '../components/AIPromptDisplay';
import { getCurrentUser, isAuthenticated, documentsApi, preferencesApi, userApi } from '../services/apiService';
import { getUserData, setUserData } from '../utils/userDataStorage';

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
  const [savedTripPreferences, setSavedTripPreferences] = useState<any[]>([]);
  const [flightStrategies, setFlightStrategies] = useState<any[]>([]);
  const [expensePolicySets, setExpensePolicySets] = useState<any[]>([]);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<any>(null);
  const [showNameChangeModal, setShowNameChangeModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

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

  const isPreferencesComplete = (prefs: any): boolean => {
    return !!(
      prefs.groupSize &&
      ((prefs.budget !== undefined && prefs.budget !== null) || prefs.isNotSure) &&
      prefs.destinationApproach &&
      prefs.destinationApproach.travelType &&
      prefs.destinationApproach.destinationStatus &&
      prefs.tripVibe &&
      (typeof prefs.tripVibe === 'string' && prefs.tripVibe.trim().length > 0) &&
      prefs.planningStyle &&
      prefs.priorities &&
      prefs.priorities.length > 0 &&
      ((prefs.destinationApproach.destinationStatus === 'open' || 
        prefs.destinationApproach.destinationStatus === 'in_mind')
        ? !!(prefs.destinationStyle || (prefs.destinationStyles && prefs.destinationStyles.length > 0))
        : true)
    );
  };

  // Helper function to load all user data
  const loadUserData = async () => {
    // Get current logged-in user
    const currentUser = getCurrentUser();
    // If user is not authenticated or user ID is not found,
    // return null
    if (!isAuthenticated() || !currentUser) {
      setDocuments([]);
      setTripPreferences(null);
      setSavedTripPreferences([]);
      setFlightStrategies([]);
      setExpensePolicySets([]);
      return;
    }

    // Log user ID for debugging
    
    // Load current user name
    setCurrentUserName(currentUser.name || '');

    // PRIORITY: Load latest preferences from localStorage FIRST (synchronous, immediate display)
    const cachedPrefs = getUserData<any>('tripPreferences');
    if (cachedPrefs && isPreferencesComplete(cachedPrefs)) {
      setTripPreferences(cachedPrefs);
    }

    // Load other cached data immediately
    const savedStrategies = getUserData<any[]>('flightStrategies');
    if (savedStrategies && Array.isArray(savedStrategies)) {
      setFlightStrategies(savedStrategies);
    }

    const savedPolicySets = getUserData<any[]>('expensePolicySets');
    if (savedPolicySets && Array.isArray(savedPolicySets)) {
      setExpensePolicySets(savedPolicySets);
    }

    const savedTripPrefs = getUserData<any[]>('savedTripPreferences');
    if (savedTripPrefs && Array.isArray(savedTripPrefs)) {
      const completeSurveys = savedTripPrefs.filter((prefSet: any) => {
        const prefs = prefSet.preferences;
        if (!prefs) return false;
        return isPreferencesComplete(prefs);
      });
      setSavedTripPreferences(completeSurveys);
    }

    // PRIORITY: Load documents from localStorage FIRST (synchronous, immediate display)
    const savedDocs = localStorage.getItem('destinationDocuments');
    if (savedDocs) {
      try {
        const allDocs = JSON.parse(savedDocs) as DocumentData[];
        const userDocs = allDocs.filter((doc: DocumentData) => {
          const creatorId = (doc as any).creatorId;
          return creatorId && creatorId === currentUser.id;
        });
        setDocuments(userDocs);
      } catch (e) {
        console.warn('Failed to parse cached documents');
      }
    }

    // Filters documents to show only those owned by current user
    // 1. Re-verify authentication before loading documents (prevents race conditions)
    const currentUserCheck = getCurrentUser();
    if (!isAuthenticated() || !currentUserCheck || currentUserCheck.id !== currentUser.id) {
      setDocuments([]);
      return;
    }

    try {
      // 2. Load documents and preferences from MongoDB in parallel (background update)
      const [documentsResult, prefsResult] = await Promise.all([
        documentsApi.getAll(),
        preferencesApi.getAll()
      ]);
      
      // Re-verify authentication before processing results
      const verifyUser = getCurrentUser();
      if (!isAuthenticated() || !verifyUser || verifyUser.id !== currentUser.id) {
        setDocuments([]);
        return;
      }

      // Process documents
      if (documentsResult.error) {
        console.error('Error loading documents from MongoDB');
        // Fallback to localStorage if MongoDB fails
        const savedDocs = localStorage.getItem('destinationDocuments');
        if (savedDocs) {
          const allDocs = JSON.parse(savedDocs) as DocumentData[];
          const userDocs = allDocs.filter((doc: DocumentData) => {
            const creatorId = (doc as any).creatorId;
            return creatorId && creatorId === currentUser.id;
          });
          setDocuments(userDocs);
        }
      } else {
        // For each document: extract creatorId and verify ownership
        // MongoDB documents have userId field, convert to creatorId for consistency
        const allDocs = (documentsResult.data || []).map((doc: any) => ({
          ...doc,
          id: doc._id || doc.id,
          creatorId: doc.userId || (doc as any).creatorId
        })) as DocumentData[];
        
        const userDocs = allDocs.filter((doc: DocumentData) => {
          const creatorId = (doc as any).creatorId || (doc as any).userId;
          if (!creatorId) {
            console.warn('Document missing creatorId');
            return false;
          }
          return creatorId === currentUser.id;
        });
        
        // Final verification before setting state
        const finalUserCheck = getCurrentUser();
        if (isAuthenticated() && finalUserCheck && finalUserCheck.id === currentUser.id) {
          setDocuments(userDocs);
          // Also sync to localStorage as cache
          localStorage.setItem('destinationDocuments', JSON.stringify(userDocs));
        }
      }

      // Process preferences from MongoDB (update if newer than localStorage)
      if (prefsResult.data && prefsResult.data.length > 0) {
        const mongoPrefs = prefsResult.data[0]; // Already sorted by lastModified desc
        
        // Final check before updating preferences
        const finalCheck = getCurrentUser();
        if (isAuthenticated() && finalCheck && finalCheck.id === currentUser.id) {
          if (isPreferencesComplete(mongoPrefs)) {
            // Update preferences from MongoDB (may be newer than localStorage)
            setTripPreferences(mongoPrefs);
            
            // Cache to localStorage for next time
            try {
              const { setUserData } = require('../utils/userDataStorage');
              setUserData('tripPreferences', mongoPrefs);
            } catch (e) { /* ignore cache errors */ }
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    const authenticated = isAuthenticated();
    
    if (!authenticated || !currentUser) {
      navigate('/', { replace: true });
      return;
    }

    const initialUserId = currentUser.id;
    
    // Load user data on mount (only if authenticated)
    loadUserData();

    // Listen for user login to reload data
    const handleUserLogin = () => {
      const user = getCurrentUser();
      if (user) {
        loadUserData();
      }
    };

    // Listen for user logout to clear all data and redirect immediately
    const handleUserLogout = () => {
      // Clear all state immediately
      setDocuments([]);
      setTripPreferences(null);
      setSavedTripPreferences([]);
      setFlightStrategies([]);
      setExpensePolicySets([]);
      setShowAIPrompt(false);
      setAiPrompt(null);
      // Force redirect with full page reload
      window.location.href = '/';
    };

    // Listen for storage changes (detects logout from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      // If token or user is removed, user logged out
      if (e.key === 'token' && !e.newValue) {
        handleUserLogout();
      }
      if (e.key === 'user' && !e.newValue) {
        handleUserLogout();
      }
    };

    // Periodic auth check every 1 second (catches logout in same tab)
    const authCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = getCurrentUser();
      const authenticated = isAuthenticated();
      
      if (!authenticated || !user) {
        handleUserLogout();
        return;
      } else {
        // Verify user ID matches (in case of user switch)
        if (user.id !== initialUserId) {
          handleUserLogout();
          return;
        }
      }
    }, 1000);

    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const handleEditDocument = (document: DocumentData) => {
    if (!isAuthenticated() || !getCurrentUser()) {
      alert('Please log in to edit documents');
      navigate('/');
      return;
    }

    // Verify user owns this document
    const currentUser = getCurrentUser();
    if (currentUser && (document as any).creatorId !== currentUser.id) {
      alert('You do not have permission to edit this document');
      return;
    }

    navigate(`/edit-document/${document.id}`);
  };

  // Function updates state when document is deleted
  const handleDeleteDocument = async (documentId: string) => {
    if (!isAuthenticated() || !getCurrentUser()) {
      alert('Please log in to delete documents');
      navigate('/');
      return;
    }

    // Verify user owns this document
    const currentUser = getCurrentUser();
    const doc = documents.find(d => d.id === documentId);
    if (currentUser && doc && (doc as any).creatorId !== currentUser.id) {
      alert('You do not have permission to delete this document');
      return;
    }

    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      // Delete from MongoDB (persistent cloud storage)
      if (documentId && !documentId.startsWith('doc_')) {
        try {
          const result = await documentsApi.delete(documentId);
          if (result.error) {
            console.error('Failed to delete document from MongoDB:', result.error);
            alert('Failed to delete document from cloud storage. Deleted locally only.');
          } else {
          }
        } catch (error) {
          console.error('Error deleting document from MongoDB:', error);
        }
      }
      
      const updatedDocs = documents.filter(doc => doc.id !== documentId);
      // Update state: filter removes document from array
      // Component re-renders automatically with updated list
      setDocuments(updatedDocs);
      
      // Also update localStorage cache
      const allDocs = JSON.parse(localStorage.getItem('destinationDocuments') || '[]') as DocumentData[];
      const updatedAllDocs = allDocs.filter((doc: DocumentData) => doc.id !== documentId);
      localStorage.setItem('destinationDocuments', JSON.stringify(updatedAllDocs));
    }
  };

  const resumeFromSavedPreferences = (preferenceSet: any) => {
    if (!isAuthenticated() || !getCurrentUser()) {
      alert('Please log in to resume preferences');
      navigate('/');
      return;
    }

    // Load the saved preferences into current trip preferences (user-specific)
    setUserData('tripPreferences', preferenceSet.preferences);
    
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
    if (!isAuthenticated() || !getCurrentUser()) {
      alert('Please log in to delete preferences');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this saved preference set?')) {
      const updated = savedTripPreferences.filter(pref => pref.id !== preferenceId);
      setSavedTripPreferences(updated);
      setUserData('savedTripPreferences', updated);
    }
  };

  const generateAIPrompt = (preferences: any) => {
    if (!isAuthenticated() || !getCurrentUser()) {
      alert('Please log in to generate AI prompts');
      navigate('/');
      return;
    }

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
    if (!isAuthenticated() || !getCurrentUser()) {
      alert('Please log in to view finalized documents');
      navigate('/');
      return;
    }

    // Verify user owns this document
    const currentUser = getCurrentUser();
    if (currentUser && (document as any).creatorId !== currentUser.id) {
      alert('You do not have permission to view this document');
      return;
    }

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

  const handleChangeName = async () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        alert('Please log in to change your name');
        return;
      }

      const result = await userApi.updateProfile(newName.trim(), currentUser.email);
      if (result.data) {
        // Update localStorage
        const updatedUser = { ...currentUser, name: newName.trim() };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUserName(newName.trim());
        setShowNameChangeModal(false);
        setNewName('');
        alert('Name updated successfully!');
        
        // Dispatch event to update header
        window.dispatchEvent(new CustomEvent('userLogin', {
          detail: { user: updatedUser }
        }));
      } else {
        alert(`Failed to update name: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error updating name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isAuthenticated() || !getCurrentUser()) {
      alert('Please log in to delete your account');
      return;
    }

    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete your account and ALL associated data:\n\n' +
      '• All your documents\n' +
      '• All your saved trip preferences\n' +
      '• All your flight strategies\n' +
      '• All your expense policies\n' +
      '• Your account information\n\n' +
      'This action CANNOT be undone.\n\n' +
      'Are you absolutely sure you want to delete your account?'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your last chance. Type "DELETE" in the next prompt to confirm.\n\n' +
      'Are you sure you want to proceed?'
    );

    if (!doubleConfirm) return;

    try {
      const result = await userApi.deleteAccount();
      if (result.data?.success) {
        // Clear all local storage
        localStorage.clear();
        // Redirect to home
        window.location.href = '/';
        alert('Your account has been deleted successfully.');
      } else {
        alert(`Failed to delete account: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error deleting account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Manage your travel preferences and planning documents
          </h1>
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
              Your Saved Trip Preferences
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Resume from any of your saved big idea survey preferences (up to 4 most recent)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedTripPreferences.map((preferenceSet) => (
                <motion.div
                  key={preferenceSet.id}
                  className="bg-gradient-to-r from-rose-50 to-white rounded-2xl p-6 border border-emerald-100"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{preferenceSet.name}</h3>
                    <div className="flex space-x-2">
                      <Tooltip text="Resume from this survey">
                        <button
                          onClick={() => resumeFromSavedPreferences(preferenceSet)}
                          className="text-emerald-500 hover:text-emerald-700 transition-colors text-xl"
                        >
                          ▶️
                        </button>
                      </Tooltip>
                      <Tooltip text="Get AI prompt">
                        <button
                          onClick={() => generateAIPrompt(preferenceSet.preferences)}
                          className="text-rose-500 hover:text-rose-600 transition-colors text-xl"
                        >
                          🤖
                        </button>
                      </Tooltip>
                      <Tooltip text="Delete preference set">
                        <button
                          onClick={() => deleteSavedPreferences(preferenceSet.id)}
                          className="text-red-500 hover:text-red-700 transition-colors text-xl"
                        >
                          ❌
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
                Latest big idea survey results
              </h2>
              <div className="flex space-x-2">
                <Tooltip text="Continue to trip tracing">
                  <button
                    onClick={() => navigate('/trip-tracing')}
                    className="text-green-500 hover:text-green-700 transition-colors text-xl"
                  >
                    ▶️
                  </button>
                </Tooltip>
                <Tooltip text="Get AI prompt">
            <button
                    onClick={() => generateAIPrompt(tripPreferences)}
                    className="text-rose-500 hover:text-rose-600 transition-colors text-xl"
            >
                    🤖
            </button>
                </Tooltip>
              </div>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Your most recent big idea survey preferences - continue to trip tracing or edit
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
                            tripPreferences.destinationApproach.travelType === 'abroad' ? 'International Travel' : 
                            tripPreferences.destinationApproach.travelType === 'domestic' ? 'Domestic Travel' : 
                            'Not specified'
                          }
                        </p>
                        <p>
                          <span className="font-medium">Status:</span> {
                            tripPreferences.destinationApproach.destinationStatus === 'chosen' ? 'Destinations Chosen' :
                            tripPreferences.destinationApproach.destinationStatus === 'in_mind' ? 'Destinations in Mind' :
                            tripPreferences.destinationApproach.destinationStatus === 'open' ? 'Open to Suggestions' :
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
                            <span key={index} className="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm mr-2 mb-1">
                              #{index + 1} {label}
                            </span>
                          );
                        });
                      } else if (typeof styles === 'string' && styles) {
                        return styles.split(',').map((style, index) => {
                          const label = styleLabels[style.trim() as keyof typeof styleLabels] || style.trim();
                          return (
                            <span key={index} className="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm mr-2 mb-1">
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
                        'relaxation': 'Relaxation',
                        'entertainment': 'Entertainment', 
                        'educational': 'Educational Discovery',
                        'cultural': 'Cultural Immersion',
                        'shared': 'Shared Escape',
                        'culinary': 'Culinary Adventure'
                      };
                      
                      if (typeof vibes === 'string' && vibes) {
                        return vibes.split(',').map((vibe, index) => {
                          const label = vibeLabels[vibe.trim() as keyof typeof vibeLabels] || vibe.trim();
                          return (
                            <span key={index} className="inline-block bg-rose-100 text-rose-700 px-3 py-2 rounded-full text-sm mr-2 mb-2 font-medium">
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
                        'eco-friendliness': 'Eco-friendliness',
                        'safety': 'Safety', 
                        'accessibility': 'Accessibility',
                        'cost-efficiency': 'Cost-efficiency',
                        'time-efficiency': 'Time-efficiency',
                        'cost-effectiveness': 'Cost-effectiveness',
                        'number-of-options': 'Number of options'
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
              Continue from last big idea survey
            </h2>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You haven't completed the big idea survey yet, or the data wasn't saved properly.
              </p>
              <button
                onClick={() => navigate('/big-picture')}
                className="btn-primary text-lg px-8 py-4"
              >
                Start big idea survey
              </button>
            </div>
          </motion.div>
        )}

        {/* Documents List */}
              <motion.div
          id="documents-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Your Documents
          </h2>
          
          {/* Trip Tracing Completion Banner */}
          {new URLSearchParams(location.search).get('section') === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-green-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="text-lg font-bold text-emerald-600">Complete</div>
                <div>
                  <h3 className="font-semibold text-green-800">Trip tracing complete!</h3>
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
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
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
                        ❌
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
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-2 text-sm">Survey Origin</h4>
                    <div className="space-y-1 text-xs text-emerald-700">
                      {doc.surveyOrigin?.bigIdeaSurveyName ? (
                        <div>
                          <strong>Big idea:</strong> {doc.surveyOrigin.bigIdeaSurveyName}
                          <br />
                          <span className="text-emerald-600">
                            {new Date(doc.surveyOrigin.bigIdeaSurveyDate || '').toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-emerald-600">
                          <strong>Big idea:</strong> Legacy survey (no tracking)
                        </div>
                      )}
                      
                      {doc.surveyOrigin?.tripTracingSurveyId ? (
                        <div className="mt-1">
                          <strong>Trip tracing:</strong> Completed
                          <br />
                          <span className="text-emerald-600">
                            {new Date(doc.surveyOrigin.tripTracingSurveyDate || '').toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 text-emerald-500">
                          <strong>Trip tracing:</strong> Not completed
                        </div>
                      )}
                      
                      {/* Group Travel Indicator for Companion Contract */}
                      {(doc.bigIdeaSurveyData?.groupSize || doc.surveyData?.groupSize) !== 'solo' && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <div className="text-green-700 text-xs">
                            <strong>Group Travel:</strong> Companion contract available in finalized document
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
            Flight Booking Strategies
          </h2>
          
          {flightStrategies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Create custom flight booking strategies during trip tracing to reuse them later!
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
                        if (!isAuthenticated() || !getCurrentUser()) {
                          alert('Please log in to delete strategies');
                          return;
                        }
                        if (window.confirm('Are you sure you want to delete this strategy?')) {
                          const updatedStrategies = flightStrategies.filter(s => s.id !== strategy.id);
                          setFlightStrategies(updatedStrategies);
                          setUserData('flightStrategies', updatedStrategies);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete strategy"
                    >
                      Delete
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
            Expense Sharing Policy Sets
          </h2>
          
          {expensePolicySets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Create custom expense sharing policies during trip tracing to reuse them later!
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
                        if (!isAuthenticated() || !getCurrentUser()) {
                          alert('Please log in to delete policy sets');
                          return;
                        }
                        if (window.confirm('Are you sure you want to delete this policy set?')) {
                          const updatedPolicySets = expensePolicySets.filter(p => p.id !== policySet.id);
                          setExpensePolicySets(updatedPolicySets);
                          setUserData('expensePolicySets', updatedPolicySets);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete policy set"
                    >
                      Delete
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
                          <span className="text-emerald-500 mr-2">•</span>
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
            className="text-lg px-8 py-4 bg-gradient-to-r from-hawaii-coral to-rose-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-rose-500 hover:to-rose-400 transform hover:-translate-y-1 transition-all duration-200"
          >
            Start planning a new trip.
          </button>
        </motion.div>
          </div>

          {/* Sidebar - Delete Account */}
          <div className="lg:w-64 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-6 sticky top-8"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Account settings</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current name: <strong>{currentUserName || 'Not set'}</strong></p>
                <button
                  onClick={() => {
                    setNewName(currentUserName);
                    setShowNameChangeModal(true);
                  }}
                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                >
                  Change name
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                >
                  Delete account
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  This will permanently delete your account and all associated data.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Prompt Display */}
      {showAIPrompt && aiPrompt && (
        <AIPromptDisplay
          prompt={aiPrompt}
          onClose={handlePromptClose}
        />
      )}

      {/* Name Change Modal */}
      <AnimatePresence>
        {showNameChangeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNameChangeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Change name</h2>
                <button
                  onClick={() => setShowNameChangeModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNameChangeModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangeName}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;