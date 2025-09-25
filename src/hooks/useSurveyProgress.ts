import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SurveyProgress {
  isInProgress: boolean;
  surveyType: 'big-picture' | 'trip-tracing' | null;
  currentStep: number;
  totalSteps: number;
  hasUnsavedChanges: boolean;
}

export const useSurveyProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [surveyProgress, setSurveyProgress] = useState<SurveyProgress>({
    isInProgress: false,
    surveyType: null,
    currentStep: 0,
    totalSteps: 0,
    hasUnsavedChanges: false
  });

  // Check if current location is a survey page
  const isSurveyPage = useCallback((pathname: string): boolean => {
    return pathname.includes('/big-picture') || 
           pathname.includes('/trip-tracing') || 
           pathname.includes('/summary');
  }, []);

  // Check if survey is in progress
  const checkSurveyProgress = useCallback(() => {
    const pathname = location.pathname;
    
    if (pathname.includes('/big-picture')) {
      // Check Big Picture survey progress
      const savedPrefs = localStorage.getItem('tripPreferences');
      const hasData = savedPrefs ? Object.keys(JSON.parse(savedPrefs)).length > 0 : false;
      
      setSurveyProgress({
        isInProgress: hasData,
        surveyType: 'big-picture',
        currentStep: 1, // Will be updated by the actual survey component
        totalSteps: 9,
        hasUnsavedChanges: hasData
      });
    } else if (pathname.includes('/trip-tracing')) {
      // Check Trip Tracing survey progress
      const savedState = localStorage.getItem('tripTracingState');
      const hasData = savedState ? Object.keys(JSON.parse(savedState)).length > 0 : false;
      
      setSurveyProgress({
        isInProgress: hasData,
        surveyType: 'trip-tracing',
        currentStep: 1, // Will be updated by the actual survey component
        totalSteps: 7,
        hasUnsavedChanges: hasData
      });
    } else if (pathname.includes('/summary')) {
      // Summary page - survey is completed
      setSurveyProgress({
        isInProgress: false,
        surveyType: null,
        currentStep: 0,
        totalSteps: 0,
        hasUnsavedChanges: false
      });
    } else {
      // Not in a survey
      setSurveyProgress({
        isInProgress: false,
        surveyType: null,
        currentStep: 0,
        totalSteps: 0,
        hasUnsavedChanges: false
      });
    }
  }, [location.pathname]);

  // Show confirmation dialog before navigation
  const confirmNavigation = useCallback((targetPath: string, action: () => void) => {
    if (!surveyProgress.isInProgress || !surveyProgress.hasUnsavedChanges) {
      // No survey in progress or no unsaved changes, proceed normally
      action();
      return;
    }

    const surveyName = surveyProgress.surveyType === 'big-picture' ? 'Big Idea Planning' : 'Trip Tracing';
    const message = `You have an incomplete ${surveyName} survey in progress. If you navigate away now, your progress will be lost. Are you sure you want to continue?`;

    if (window.confirm(message)) {
      action();
    }
  }, [surveyProgress]);

  // Safe navigation with confirmation
  const safeNavigate = useCallback((path: string) => {
    confirmNavigation(path, () => navigate(path));
  }, [confirmNavigation, navigate]);

  // Update survey progress (called by survey components)
  const updateProgress = useCallback((step: number, total: number) => {
    setSurveyProgress(prev => ({
      ...prev,
      currentStep: step,
      totalSteps: total
    }));
  }, []);

  // Mark survey as completed
  const markCompleted = useCallback(() => {
    setSurveyProgress(prev => ({
      ...prev,
      isInProgress: false,
      hasUnsavedChanges: false
    }));
  }, []);

  useEffect(() => {
    checkSurveyProgress();
  }, [checkSurveyProgress]);

  return {
    surveyProgress,
    safeNavigate,
    updateProgress,
    markCompleted,
    confirmNavigation
  };
};
