// Utility functions for storing and retrieving user-specific data

import { getCurrentUser, isAuthenticated } from '../services/apiService';

export const getUserStorageKey = (baseKey: string, userId: string): string => {
  return `${baseKey}_${userId}`;
};

export const getUserData = <T>(baseKey: string): T | null => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  
  if (!authenticated || !user || !user.id) {
    return null;
  }
  
  const key = getUserStorageKey(baseKey, user.id);
  const data = localStorage.getItem(key);
  
  if (!data) {
    return null;
  }
  
  try {
    const parsed = JSON.parse(data) as T;
    return parsed;
  } catch (e) {
    console.error('Error parsing user data for key', key, e);
    return null;
  }
};

export const setUserData = <T>(baseKey: string, data: T): void => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  
  if (!authenticated || !user || !user.id) {
    throw new Error('Cannot save data without authentication');
  }
  
  const key = getUserStorageKey(baseKey, user.id);
  localStorage.setItem(key, JSON.stringify(data));
};

export const removeUserData = (baseKey: string): void => {
  const user = getCurrentUser();
  if (!user || !user.id) {
    return;
  }
  
  const key = getUserStorageKey(baseKey, user.id);
  localStorage.removeItem(key);
};

export const clearAllUserData = (userId: string): void => {
  if (!userId) {
    return;
  }
  
  const keys = [
    'tripPreferences',
    'savedTripPreferences',
    'tripTracingState',
    'flightStrategies',
    'expensePolicySets',
  ];
  
  keys.forEach(key => {
    const userKey = getUserStorageKey(key, userId);
    localStorage.removeItem(userKey);
    localStorage.removeItem(key);
  });
  
  const savedDocs = localStorage.getItem('destinationDocuments');
  if (savedDocs) {
    try {
      const docs = JSON.parse(savedDocs);
      const otherUsersDocs = docs.filter((doc: any) => doc.creatorId !== userId);
      localStorage.setItem('destinationDocuments', JSON.stringify(otherUsersDocs));
    } catch (e) {
      console.error('Error clearing user documents:', e);
    }
  }
  
  localStorage.removeItem('current-room-id');
  localStorage.removeItem('room-creator');
  localStorage.removeItem('chatbox-stay-open');
};

// Migrates old data to new format
export const migrateUserData = (userId: string): void => {
  const oldKeys = [
    'tripPreferences',
    'savedTripPreferences',
    'tripTracingState',
    'flightStrategies',
    'expensePolicySets',
  ];
  
  oldKeys.forEach(key => {
    const oldData = localStorage.getItem(key);
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);
        const newKey = getUserStorageKey(key, userId);
        localStorage.setItem(newKey, oldData);
      } catch (e) {
        console.error(`Error migrating ${key}:`, e);
      }
    }
  });
};

