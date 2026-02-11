// Importing React and its hooks for state management and routing
import React, { useState, useEffect } from 'react';
// Importing React Router for client-side navigation
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Importing Framer Motion for animations
import { AnimatePresence } from 'framer-motion';
// Importing React components made
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
// Importing React pages made
import HomePage from './pages/HomePage';
import BigIdeaPage from './pages/BigIdeaPage';
import SummaryPage from './pages/SummaryPage';
import ProfilePage from './pages/ProfilePage';
import TripTracingPage from './pages/TripTracingPage';
import FinalizedDocumentPage from './pages/FinalizedDocumentPage';
import DocumentEditingPage from './pages/DocumentEditingPage';
// Importing React collaboration components made
import { DraggableCollaborationPanel } from './components/collaboration';
// Importing API service for authentication and user data
import { getCurrentUser } from './services/apiService';

// Custom component using React Router's useLocation hook (Tool 4: React hooks)
function RouteChangeHandler({ onRouteChange }: { onRouteChange: (pathname: string) => void }) {
  const location = useLocation();  // React Router hook to get current route
  
  useEffect(() => {  // React useEffect hook to handle route changes
    onRouteChange(location.pathname);
  }, [location.pathname, onRouteChange]);
  
  return null;
}

// React Framework - Main App component with routing
function App() {
  // React useState hooks for component state management
  const [showGlobalChatbox, setShowGlobalChatbox] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Handle route changes (for future use if needed)
  const handleRouteChange = (pathname: string) => {
    console.log('🔍 [DEBUG] Route changed to:', pathname);
    // Don't auto-close chatbox - let users control it manually
  };

  useEffect(() => {
    console.log('🔍 [APP] App component mounted/updated');
    console.log('🔍 [APP] Timestamp:', new Date().toISOString());
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const currentUser = getCurrentUser();
    const { isAuthenticated } = require('./services/apiService');
    const authenticated = isAuthenticated();
    
    console.log('🔍 [APP] Initial authentication check:', {
      hasToken: !!token,
      hasUserStr: !!userStr,
      authenticated,
      hasCurrentUser: !!currentUser,
      userId: currentUser?.id,
      userEmail: currentUser?.email
    });
    
    if (currentUser) {
      console.log('✅ [APP] User found, setting user state:', currentUser.id);
      setUser(currentUser);
    } else {
      console.log('❌ [APP] No user found - user is NOT logged in');
      setUser(null);
    }

    // Check if there's an active room and chatbox state
    const shouldStayOpen = localStorage.getItem('chatbox-stay-open') === 'true';
    const savedRoomId = localStorage.getItem('current-room-id');
    
    // Always mount chatbox if there's an active room
    if (savedRoomId) {
      setRoomId(savedRoomId);
      // Chatbox should be hidden by default (closed)
      // Only show it if explicitly set to stay open
      setShowGlobalChatbox(false); // Always start closed
    }

    // ADVANCED TECHNIQUE 56: CROSS-TAB STORAGE EVENT SYNCHRONIZATION
    // Complex localStorage event handling for synchronizing state across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatbox-stay-open') {
        const newStayOpen = e.newValue === 'true';
        if (!newStayOpen) {
          setShowGlobalChatbox(false);
        }
      }
      if (e.key === 'current-room-id') {
        const newRoomId = e.newValue;
        if (newRoomId) {
          setRoomId(newRoomId);
          // Always start closed when joining a room
          setShowGlobalChatbox(false);
        } else {
          setRoomId(null);
          setShowGlobalChatbox(false);
        }
      }
    };

            // Listen for showChatbox event from header
            const handleShowChatbox = () => {
              console.log('🔍 [DEBUG] App: showChatbox event received');
              const currentRoomId = localStorage.getItem('current-room-id');
              console.log('🔍 [DEBUG] App: Current room ID:', currentRoomId);
              if (currentRoomId) {
                setRoomId(currentRoomId);
                setShowGlobalChatbox(true);
              } else {
                console.warn('❌ [DEBUG] App: No room ID found when trying to show chatbox');
              }
            };


            // Listen for user logout event
            const handleUserLogout = () => {
              console.log('🚪 [DEBUG] App: User logged out event received. Current roomId:', roomId);
              setUser(null);
              setRoomId(null); // Clear room ID to unmount chatbox
              setShowGlobalChatbox(false); // Hide chatbox
              console.log('🚪 [DEBUG] App: After logout, roomId set to:', null, 'showGlobalChatbox set to:', false);
            };

            // Listen for room deleted event
            const handleRoomDeleted = (event: CustomEvent) => {
              console.log('🗑️ [DEBUG] App: Room deleted event received:', event.detail);
              try {
                const deletedRoomId = event.detail?.roomId;
                
                // If the deleted room is the current room, clean up state
                if (roomId === deletedRoomId || !deletedRoomId) {
                  console.log('🗑️ [DEBUG] App: Current room was deleted, cleaning up state');
                  setRoomId(null);
                  setShowGlobalChatbox(false);
                }
              } catch (error) {
                console.error('Error handling room deleted event:', error);
                // Clean up state anyway to be safe
                setRoomId(null);
                setShowGlobalChatbox(false);
              }
            };

            // Listen for user login event
            const handleUserLogin = (event: CustomEvent) => {
              console.log('🔑 [DEBUG] App: User logged in event received:', event.detail);
              
              // Safety check to ensure event.detail and event.detail.user exist
              if (event.detail && event.detail.user) {
                setUser(event.detail.user);
                // Check for existing room on login
                const savedRoomIdOnLogin = localStorage.getItem('current-room-id');
                if (savedRoomIdOnLogin) {
                  setRoomId(savedRoomIdOnLogin);
                  setShowGlobalChatbox(false); // Start closed
                }
              } else {
                console.warn('🚨 [DEBUG] App: userLogin event received without proper user data:', event.detail);
              }
            };

            //Event listeners
            //Custom event fired to clear user state when logout occurs
            window.addEventListener('storage', handleStorageChange);
            //Custom event fired to open chatbox when chatbox button is clicked
            window.addEventListener('showChatbox', handleShowChatbox);
            //Custom event fired to clear user state and redirect to home page
            window.addEventListener('userLogout', handleUserLogout);
            //Custom event fired to update user state when user logs in
            window.addEventListener('userLogin', handleUserLogin as EventListener);
            //Custom event fired to clear room state when room is deleted
            window.addEventListener('roomDeleted', handleRoomDeleted as EventListener);

            //Remove event listeners above when component unmounts (to prevent memory leaks)
            return () => {
              window.removeEventListener('storage', handleStorageChange);
              window.removeEventListener('showChatbox', handleShowChatbox);
              window.removeEventListener('userLogout', handleUserLogout);
              window.removeEventListener('userLogin', handleUserLogin as EventListener);
              window.removeEventListener('roomDeleted', handleRoomDeleted as EventListener);
            };
  }, []);

  // React Router setup - BrowserRouter enables client-side routing
  // BrowserRouter is a React Router component that enables client-side routing
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-hawaii-mint to-rose-50">
        <RouteChangeHandler onRouteChange={handleRouteChange} />
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Route maps URL path to React component */}
              <Route path="/" element={<HomePage />} />
              
              {/* Protected routes require authentication before rendering */}
              {/* Component-based architecture: ProtectedRoute wraps ProfilePage */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/big-picture" element={
                <ProtectedRoute>
                  <BigIdeaPage />
                </ProtectedRoute>
              } />
              <Route path="/trip-tracing" element={
                <ProtectedRoute>
                  <TripTracingPage />
                </ProtectedRoute>
              } />
              <Route path="/trip-tracing/:destinationId" element={
                <ProtectedRoute>
                  <TripTracingPage />
                </ProtectedRoute>
              } />
              <Route path="/summary" element={
                <ProtectedRoute>
                  <SummaryPage />
                </ProtectedRoute>
              } />
              <Route path="/finalized-document/:documentId" element={<FinalizedDocumentPage />} />
              <Route path="/edit-document/:id" element={
                <ProtectedRoute>
                  <DocumentEditingPage />
                </ProtectedRoute>
              } />
              <Route path="/questions" element={
                <ProtectedRoute>
                  <Navigate to="/big-picture" replace />
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        
        {/*Conditional rendering - only render DraggableCollaborationPanel if roomId exists */}
        {roomId && (
          <DraggableCollaborationPanel
            tripId={roomId}
            isVisible={showGlobalChatbox}
            onToggle={() => setShowGlobalChatbox(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
