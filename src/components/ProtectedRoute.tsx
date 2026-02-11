import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/apiService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // CRITICAL: Check authentication synchronously on render
  // This prevents any rendering if user is not authenticated
  console.log('🔒 [PROTECTED ROUTE] Component rendering');
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  
  console.log('🔒 [PROTECTED ROUTE] Initial auth check:', {
    authenticated,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });
  
  useEffect(() => {
    console.log('🔒 [PROTECTED ROUTE] useEffect running');
    
    const checkAuth = () => {
      const currentAuth = isAuthenticated();
      const currentUser = getCurrentUser();
      
      console.log('🔒 [PROTECTED ROUTE] Auth check result:', {
        authenticated: currentAuth,
        hasUser: !!currentUser,
        userId: currentUser?.id,
        timestamp: new Date().toISOString()
      });
      
      if (!currentAuth || !currentUser) {
        console.log('❌ [PROTECTED ROUTE] User not authenticated, redirecting to home');
        setIsAuthorized(false);
        setIsChecking(false);
        // Show login required popup
        alert('Please log in to access this feature.\n\nClick "Login" or "Register" in the top navigation bar.');
        window.location.href = '/';
        return;
      }
      
      console.log('✅ [PROTECTED ROUTE] User authenticated:', {
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name
      });
      setIsAuthorized(true);
      setIsChecking(false);
    };

    // Check immediately
    checkAuth();

    // Listen for logout events
    const handleLogout = () => {
      const currentUser = getCurrentUser();
      console.log('🔒 [PROTECTED ROUTE] Logout event received:', {
        userId: currentUser?.id,
        timestamp: new Date().toISOString()
      });
      setIsAuthorized(false);
      // Use window.location for immediate redirect
      window.location.href = '/';
    };

    // Listen for storage changes (token removal from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🔒 [PROTECTED ROUTE] Storage event:', {
        key: e.key,
        oldValue: e.oldValue ? 'exists' : 'null',
        newValue: e.newValue ? 'exists' : 'null',
        timestamp: new Date().toISOString()
      });
      
      if (e.key === 'token' && !e.newValue) {
        const currentUser = getCurrentUser();
        console.log('🔒 [PROTECTED ROUTE] Token removed (other tab logout):', {
          userId: currentUser?.id,
          redirecting: true
        });
        setIsAuthorized(false);
        // Use window.location for immediate redirect
        window.location.href = '/';
      }
      
      if (e.key === 'user' && !e.newValue) {
        console.log('🔒 [PROTECTED ROUTE] User removed (other tab logout), redirecting');
        setIsAuthorized(false);
        window.location.href = '/';
      }
    };

    // Periodic check every 1 second to catch logout immediately
    const authCheckInterval = setInterval(() => {
      const currentAuth = isAuthenticated();
      const currentUser = getCurrentUser();
      
      if (!currentAuth || !currentUser) {
        console.log('🔒 [PROTECTED ROUTE] Periodic check - user logged out:', {
          authenticated: currentAuth,
          hasUser: !!currentUser,
          timestamp: new Date().toISOString()
        });
        setIsAuthorized(false);
        // Use window.location for immediate redirect
        window.location.href = '/';
      }
    }, 1000);

    window.addEventListener('userLogout', handleLogout);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('userLogout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // CRITICAL: Don't render anything if not authenticated (even during check)
  if (!authenticated || !user) {
    console.log('❌ [PROTECTED ROUTE] Blocking render - not authenticated');
    // Show login required popup and redirect
    if (typeof window !== 'undefined') {
      // Use setTimeout to avoid blocking render cycle
      setTimeout(() => {
        alert('Please log in to access this feature.\n\nClick "Login" or "Register" in the top navigation bar.');
        window.location.href = '/';
      }, 0);
    }
    return null;
  }

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }

  return <>{children}</>;
};

export default ProtectedRoute; 