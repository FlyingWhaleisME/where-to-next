import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyProgress } from '../hooks/useSurveyProgress';
import { authApi, getCurrentUser, logout as apiLogout } from '../services/apiService';
import ChatRoomModal from './collaboration/ChatRoomModal';
import DocumentShareModal from './documents/DocumentShareModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [latestPreferences, setLatestPreferences] = useState<any>(null);
  const [savedPreferences, setSavedPreferences] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [hasActiveRoom, setHasActiveRoom] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showChatRoomModal, setShowChatRoomModal] = useState(false);
  const [showDocumentShareModal, setShowDocumentShareModal] = useState(false);
  const location = useLocation();
  const { safeNavigate, surveyProgress } = useSurveyProgress();

  useEffect(() => {
    // Load latest trip preferences
    const latestPrefs = localStorage.getItem('tripPreferences');
    if (latestPrefs) {
      try {
        setLatestPreferences(JSON.parse(latestPrefs));
      } catch (error) {
        console.error('Error parsing latest preferences:', error);
      }
    }
    
    // Load saved trip preferences
    const savedPrefs = localStorage.getItem('savedTripPreferences');
    if (savedPrefs) {
      try {
        setSavedPreferences(JSON.parse(savedPrefs));
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }

    // Load user from localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Check for active room
    const activeRoomId = localStorage.getItem('current-room-id');
    console.log('🔍 [DEBUG] Header: Initial room check, activeRoomId:', activeRoomId);
    if (activeRoomId) {
      setHasActiveRoom(true);
      setRoomId(activeRoomId);
      console.log('🔍 [DEBUG] Header: Set hasActiveRoom to true, roomId:', activeRoomId);
    } else {
      setHasActiveRoom(false);
      setRoomId(null);
      console.log('🔍 [DEBUG] Header: Set hasActiveRoom to false');
    }
  }, [location]);

  // Listen for room changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current-room-id') {
        console.log('🔍 [DEBUG] Header: Room ID changed:', e.newValue);
        if (e.newValue) {
          setHasActiveRoom(true);
          setRoomId(e.newValue);
        } else {
          setHasActiveRoom(false);
          setRoomId(null);
        }
      }
    };

    // Also listen for custom events from collaboration system
    const handleRoomChange = (event: Event) => {
      const activeRoomId = localStorage.getItem('current-room-id');
      const customEvent = event as CustomEvent;
      console.log('🔍 [DEBUG] Header: Room change event received:', customEvent?.type, 'current room:', activeRoomId);
      console.log('🔍 [DEBUG] Header: Event detail:', customEvent?.detail);
      if (activeRoomId) {
        setHasActiveRoom(true);
        setRoomId(activeRoomId);
        console.log('🔍 [DEBUG] Header: Updated hasActiveRoom to true, roomId:', activeRoomId);
      } else {
        setHasActiveRoom(false);
        setRoomId(null);
        console.log('🔍 [DEBUG] Header: Updated hasActiveRoom to false');
      }
    };

    // Listen for notification updates from chatbox
    const handleNotificationUpdate = (event: CustomEvent) => {
      console.log('🔍 [DEBUG] Header: Notification update received:', event.detail);
      setHasNewMessages(event.detail.hasNewMessages);
      setUnreadMessageCount(event.detail.unreadMessageCount);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roomCreated', handleRoomChange as EventListener);
    window.addEventListener('roomJoined', handleRoomChange as EventListener);
    window.addEventListener('roomDeleted', handleRoomChange as EventListener);
    window.addEventListener('notificationUpdate', handleNotificationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roomCreated', handleRoomChange as EventListener);
      window.removeEventListener('roomJoined', handleRoomChange as EventListener);
      window.removeEventListener('roomDeleted', handleRoomChange as EventListener);
      window.removeEventListener('notificationUpdate', handleNotificationUpdate as EventListener);
    };
  }, []);

  const handleAuth = async (email: string, password: string, name?: string) => {
    try {
      const result = isLogin 
        ? await authApi.login(email, password)
        : await authApi.register(email, password, name);
      
      if (result.data) {
        setUser(result.data.user);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('token', result.data.token);
        setShowAuthModal(false);
        alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('userLogin', {
          detail: { user: result.data.user }
        }));
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    apiLogout();
    
    // Dispatch custom event to notify collaboration system
    window.dispatchEvent(new CustomEvent('userLogout'));
  };


  const handleTripTracingClick = () => {
    setShowDropdown(false);
    
    // If no preferences available, go directly to trip tracing
    if (!latestPreferences && savedPreferences.length === 0) {
      safeNavigate('/trip-tracing');
      return;
    }
    
    // Show preference selection modal
    setShowPreferenceModal(true);
  };

  const handlePreferenceSelect = (preferenceSet: any | 'latest') => {
    if (preferenceSet === 'latest') {
      // Use latest preferences (already in localStorage)
      safeNavigate('/trip-tracing');
    } else {
      // Load selected saved preferences
      localStorage.setItem('tripPreferences', JSON.stringify(preferenceSet.preferences));
      safeNavigate('/trip-tracing');
    }
    setShowPreferenceModal(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="relative">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 z-50 relative"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button onClick={() => safeNavigate('/')}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Where To Next?
              </motion.div>
            </button>

            <nav className="flex items-center space-x-6">
              {/* Authentication Buttons */}
              {user ? (
                <>
                  <span className="text-gray-600 font-medium">Welcome, {user.name}!</span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Register
                  </button>
                </>
              )}

              {/* Shared Document Icon - Show for all users */}
              <button 
                onClick={() => setShowDocumentShareModal(true)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center space-x-1"
                title="View Document by Code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Shared</span>
              </button>

              {/* Chat Button - Show for all users, but require auth for functionality */}
              <button 
                onClick={() => {
                  console.log('🔍 [DEBUG] Header: Chat button clicked');
                  
                  if (!user) {
                    // User not logged in - show auth modal
                    console.log('🔍 [DEBUG] Header: User not logged in - showing auth modal');
                    setIsLogin(true);
                    setShowAuthModal(true);
                    return;
                  }
                  
                  console.log('🔍 [DEBUG] Header: Current room ID:', localStorage.getItem('current-room-id'));
                  console.log('🔍 [DEBUG] Header: Has active room:', hasActiveRoom);
                  console.log('🔍 [DEBUG] Header: Room ID state:', roomId);
                  
                  if (hasActiveRoom) {
                    // User has an active room - show chatbox
                    console.log('🔍 [DEBUG] Header: User has active room - showing chatbox');
                    setHasNewMessages(false);
                    setUnreadMessageCount(0);
                    window.dispatchEvent(new CustomEvent('showChatbox'));
                  } else {
                    // User doesn't have an active room - show chat room modal
                    console.log('🔍 [DEBUG] Header: User has no active room - showing chat room modal');
                    setShowChatRoomModal(true);
                  }
                }}
                className="text-gray-600 hover:text-green-600 transition-colors duration-200 font-medium flex items-center space-x-1 relative"
                title={user ? (hasActiveRoom ? "Open Chat" : "Start Communication") : "Login/Register for Collaboration"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{user ? (hasActiveRoom ? 'Chat' : 'Start Chat') : 'Start Chat'}</span>
                {user && hasActiveRoom && hasNewMessages && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadMessageCount > 0 ? unreadMessageCount : '!'}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => safeNavigate('/profile')}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Profile
              </button>

              {/* Trip Survey Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center space-x-1 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                >
                  Trip Survey
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    >
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          safeNavigate('/big-picture');
                        }}
                        className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-t-lg"
                      >
                        Big Idea
                      </button>
                      {(latestPreferences || savedPreferences.length > 0) && (
                        <button
                          onClick={handleTripTracingClick}
                          className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Trip Tracing
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </nav>
          </div>
        </div>
      </motion.header>

      {/* Preference Selection Modal */}
      <AnimatePresence>
        {showPreferenceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPreferenceModal(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  🎯 Select Trip Preferences
                </h2>
                <button
                  onClick={() => setShowPreferenceModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Choose which trip preferences to use for your Trip Tracing survey:
              </p>

              <div className="space-y-4">
                {/* Latest Preferences Option */}
                {latestPreferences && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 cursor-pointer"
                    onClick={() => handlePreferenceSelect('latest')}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">🌟 Latest Survey Results</h3>
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Current
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <p><strong>Group Size:</strong> {latestPreferences.groupSize || 'Not specified'}</p>
                      <p><strong>Budget:</strong> ${latestPreferences.budget || 'Not specified'}</p>
                      <p><strong>Trip Vibe:</strong> {latestPreferences.tripVibe || 'Not specified'}</p>
                      <p><strong>Planning Style:</strong> {
                        typeof latestPreferences.planningStyle === 'number' 
                          ? `${latestPreferences.planningStyle}%`
                          : latestPreferences.planningStyle || 'Not specified'
                      }</p>
                    </div>
                  </motion.div>
                )}

                {/* Saved Preferences Options */}
                {savedPreferences.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">💾 Your Saved Preferences:</h4>
                    </div>
                    
                    {savedPreferences.map((preferenceSet) => (
                      <motion.div
                        key={preferenceSet.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 cursor-pointer"
                        onClick={() => handlePreferenceSelect(preferenceSet)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-800">{preferenceSet.name}</h3>
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Saved
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <p><strong>Group Size:</strong> {preferenceSet.preferences.groupSize || 'Not specified'}</p>
                          <p><strong>Budget:</strong> ${preferenceSet.preferences.budget || 'Not specified'}</p>
                          <p><strong>Trip Vibe:</strong> {preferenceSet.preferences.tripVibe || 'Not specified'}</p>
                          <p><strong>Created:</strong> {formatDate(preferenceSet.createdAt)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}

                {/* No Preferences Available */}
                {!latestPreferences && savedPreferences.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Preferences Found</h3>
                    <p className="text-gray-600 mb-4">
                      Complete a Big Idea survey first to create trip preferences for Trip Tracing.
                    </p>
                    <button
                      onClick={() => {
                        setShowPreferenceModal(false);
                        navigate('/big-picture-planning');
                      }}
                      className="btn-primary px-6 py-3"
                    >
                      Start Big Idea Survey
                    </button>
                  </div>
                )}
              </div>

              {(latestPreferences || savedPreferences.length > 0) && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowPreferenceModal(false)}
                    className="btn-secondary px-6 py-3"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Authentication Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowAuthModal(false);
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
                    {isLogin ? '🔐 Login' : '📝 Register'}
                  </h2>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <AuthForm 
                  isLogin={isLogin} 
                  onSubmit={handleAuth}
                  onToggleMode={() => setIsLogin(!isLogin)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Room Modal */}
        <ChatRoomModal
          isOpen={showChatRoomModal}
          onClose={() => setShowChatRoomModal(false)}
        />

        {/* Document Share Modal */}
        <DocumentShareModal
          isOpen={showDocumentShareModal}
          onClose={() => setShowDocumentShareModal(false)}
        />

      </AnimatePresence>
    </div>
  );
};

// Authentication Form Component
const AuthForm: React.FC<{
  isLogin: boolean;
  onSubmit: (email: string, password: string, name?: string) => void;
  onToggleMode: () => void;
}> = ({ isLogin, onSubmit, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, isLogin ? undefined : name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={!isLogin}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          minLength={8}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {isLogin ? 'Login' : 'Register'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </form>
  );
};

export default Header; 