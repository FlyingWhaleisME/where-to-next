import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyProgress } from '../hooks/useSurveyProgress';
import { authApi, getCurrentUser, logout as apiLogout } from '../services/apiService';
import ChatRoomModal from './collaboration/ChatRoomModal';
import DocumentShareModal from './documents/DocumentShareModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
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
  const { safeNavigate } = useSurveyProgress();

  useEffect(() => {
    // Load user from localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Check for active room
    const activeRoomId = localStorage.getItem('current-room-id');
    if (activeRoomId) {
      setHasActiveRoom(true);
      setRoomId(activeRoomId);
    } else {
      setHasActiveRoom(false);
      setRoomId(null);
    }
  }, [location]);

  // Listen for room changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current-room-id') {
        if (e.newValue) {
          setHasActiveRoom(true);
          setRoomId(e.newValue);
        } else {
          setHasActiveRoom(false);
          setRoomId(null);
        }
      }
    };

    const handleRoomChange = (event: Event) => {
      const activeRoomId = localStorage.getItem('current-room-id');
      if (activeRoomId) {
        setHasActiveRoom(true);
        setRoomId(activeRoomId);
      } else {
        setHasActiveRoom(false);
        setRoomId(null);
      }
    };

    const handleNotificationUpdate = (event: CustomEvent) => {
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
        const userData = result.data.user;
        const token = result.data.token;
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        setUser(userData);
        setShowAuthModal(false);
        alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
        
        // Migrate old data to user-specific storage on login
        try {
          const { migrateUserData } = require('../utils/userDataStorage');
          migrateUserData(userData.id);
        } catch (e) {
          console.error('Error migrating user data:', e);
        }
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('userLogin', {
          detail: { user: userData }
        }));
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    // Check if user is on a survey page or has unsaved data
    const isOnSurveyPage = location.pathname.includes('/big-picture') || 
                           location.pathname.includes('/trip-tracing') ||
                           location.pathname.includes('/summary');
    
    const { getUserData } = require('../utils/userDataStorage');
    const hasUnsavedData = getUserData('tripPreferences') || 
                          getUserData('tripTracingState') ||
                          getUserData('savedTripPreferences');
    
    let confirmMessage = 'Are you sure you want to log out?';
    if (isOnSurveyPage || hasUnsavedData) {
      confirmMessage = 'WARNING: You are in the middle of completing a survey.\n\n' +
                      'If you log out now, your unsaved progress will be lost and will NOT be saved.\n\n' +
                      'Are you sure you want to log out?';
    }
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;
    
    apiLogout(true);
    setUser(null);
    
    window.dispatchEvent(new CustomEvent('userLogout'));
    window.location.href = '/';
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
            <button onClick={() => safeNavigate('/')} className="flex items-center space-x-2">
              <img src="/logo512.png" alt="Logo" className="h-9 w-9 rounded-lg" />
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-hawaii-coral to-rose-300 bg-clip-text text-transparent"
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
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 font-medium"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
                  >
                    Register
                  </button>
                </>
              )}

              {/* Shared Document Icon */}
              <button 
                onClick={() => setShowDocumentShareModal(true)}
                className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 font-medium flex items-center space-x-1"
                title="View Document by Code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Shared</span>
              </button>

              {/* Chat Button */}
              <button 
                onClick={() => {
                  if (!user) {
                    setIsLogin(true);
                    setShowAuthModal(true);
                    return;
                  }
                  
                  if (hasActiveRoom) {
                    setHasNewMessages(false);
                    setUnreadMessageCount(0);
                    window.dispatchEvent(new CustomEvent('showChatbox'));
                  } else {
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
                className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 font-medium flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>
            </nav>
          </div>
        </div>
      </motion.header>

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
                  {isLogin ? 'Login' : 'Register'}
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          required
          minLength={8}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
      >
        {isLogin ? 'Login' : 'Register'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </form>
  );
};

export default Header;
