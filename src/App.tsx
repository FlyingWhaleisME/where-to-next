import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import BigIdeaPage from './pages/BigIdeaPage';
import SummaryPage from './pages/SummaryPage';
import ProfilePage from './pages/ProfilePage';
import TripTracingPage from './pages/TripTracingPage';
import FinalizedDocumentPage from './pages/FinalizedDocumentPage';
import DocumentEditingPage from './pages/DocumentEditingPage';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Homepage - Always accessible */}
              <Route path="/" element={<HomePage />} />
              
              {/* Protected Routes */}
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
              <Route path="/shared-document/:documentId" element={<FinalizedDocumentPage />} />
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
      </div>
    </Router>
  );
}

export default App;
