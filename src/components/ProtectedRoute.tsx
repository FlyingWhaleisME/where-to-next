import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Always allow access to protected routes
  // Users can access the homepage and other features without completing AI setup first
  return <>{children}</>;
};

export default ProtectedRoute; 