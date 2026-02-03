// Utility functions for storing and retrieving user-specific data
// All data is stored with user ID to ensure proper isolation

import { getCurrentUser, isAuthenticated } from '../services/apiService';

/**
 * Get a user-specific storage key
 */
export const getUserStorageKey = (baseKey: string, userId: string): string => {
  return `${baseKey}_${userId}`;
};

/**
 * Get data for the current logged-in user
 * Returns null if no user is logged in or data doesn't exist
 */
// Tool 5: JSON key-value structure - Retrieve user-specific data from localStorage
export const getUserData = <T>(baseKey: string): T | null => {
  // Check authentication before accessing data
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  
  if (!authenticated || !user || !user.id) {
    return null;
  }
  
  // Create user-specific storage key (format: "baseKey_userId")
  const key = getUserStorageKey(baseKey, user.id);
  
  // Retrieve JSON string from localStorage (Tool 5: localStorage API)
  const data = localStorage.getItem(key);
  
  if (!data) {
    return null;
  }
  
  try {
    // Tool 5: JSON.parse converts string to object (explained in Tool 5, case A)
    const parsed = JSON.parse(data) as T;
    return parsed;
  } catch (e) {
    console.error('Error parsing user data for key', key, e);
    return null;
  }
};

// Tool 5: JSON key-value structure - Save user-specific data to localStorage
export const setUserData = <T>(baseKey: string, data: T): void => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  
  if (!authenticated || !user || !user.id) {
    throw new Error('Cannot save data without authentication');
  }
  
  // Create user-specific storage key
  const key = getUserStorageKey(baseKey, user.id);
  
  // Tool 5: JSON.stringify converts object to string for storage (explained in Tool 5, case A)
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Remove data for the current logged-in user
 */
export const removeUserData = (baseKey: string): void => {
  const user = getCurrentUser();
  if (!user || !user.id) {
    return;
  }
  
  const key = getUserStorageKey(baseKey, user.id);
  localStorage.removeItem(key);
};

/**
 * Clear ALL data for a specific user ID
 */
export const clearAllUserData = (userId: string): void => {
  console.log(`🗑️ [CLEAR DATA] ==========================================`);
  console.log(`🗑️ [CLEAR DATA] clearAllUserData called for user: ${userId}`);
  console.log(`🗑️ [CLEAR DATA] Timestamp:`, new Date().toISOString());
  
  if (!userId) {
    console.error(`❌ [CLEAR DATA] No user ID provided!`);
    return;
  }
  
  const keys = [
    'tripPreferences',
    'savedTripPreferences',
    'tripTracingState',
    'flightStrategies',
    'expensePolicySets',
  ];
  
  console.log(`🗑️ [CLEAR DATA] Clearing user-specific keys for user ${userId}:`);
  keys.forEach(key => {
    const userKey = getUserStorageKey(key, userId);
    const hadData = !!localStorage.getItem(userKey);
    localStorage.removeItem(userKey);
    console.log(`🗑️ [CLEAR DATA]   - ${userKey}: ${hadData ? 'cleared' : 'not found'}`);
    
    // Also clear old format (without user ID) for backward compatibility
    const oldKeyHadData = !!localStorage.getItem(key);
    localStorage.removeItem(key);
    if (oldKeyHadData) {
      console.log(`🗑️ [CLEAR DATA]   - ${key} (old format): cleared`);
    }
  });
  
  // Also clear documents (they have creatorId, so filter by that)
  const savedDocs = localStorage.getItem('destinationDocuments');
  if (savedDocs) {
    try {
      const docs = JSON.parse(savedDocs);
      const beforeCount = docs.length;
      const userDocs = docs.filter((doc: any) => doc.creatorId === userId);
      const otherUsersDocs = docs.filter((doc: any) => doc.creatorId !== userId);
      
      console.log(`🗑️ [CLEAR DATA] Documents:`, {
        totalBefore: beforeCount,
        userDocsCount: userDocs.length,
        remainingCount: otherUsersDocs.length,
        userIds: userDocs.map((d: any) => d.creatorId)
      });
      
      localStorage.setItem('destinationDocuments', JSON.stringify(otherUsersDocs));
      console.log(`🗑️ [CLEAR DATA] Cleared ${userDocs.length} documents for user ${userId}`);
    } catch (e) {
      console.error('❌ [CLEAR DATA] Error clearing user documents:', e);
    }
  } else {
    console.log(`🗑️ [CLEAR DATA] No documents found in localStorage`);
  }
  
  // Clear collaboration data
  console.log(`🗑️ [CLEAR DATA] Clearing collaboration data...`);
  localStorage.removeItem('current-room-id');
  localStorage.removeItem('room-creator');
  localStorage.removeItem('chatbox-stay-open');
  
  // Verify everything is cleared
  const verifyKeys = keys.map(key => getUserStorageKey(key, userId));
  const stillExists = verifyKeys.filter(key => !!localStorage.getItem(key));
  
  console.log(`🗑️ [CLEAR DATA] Verification:`, {
    allKeysCleared: stillExists.length === 0,
    remainingKeys: stillExists,
    timestamp: new Date().toISOString()
  });
  
  console.log(`✅ [CLEAR DATA] All data cleared for user ${userId}`);
  console.log(`🗑️ [CLEAR DATA] ==========================================`);
};

/**
 * Migrate old data (without user ID) to new format (with user ID)
 * This is a one-time migration for existing users
 */
export const migrateUserData = (userId: string): void => {
  console.log(`🔄 [DEBUG] migrateUserData: Migrating data for user ${userId}`);
  
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
        // Keep old key for now (will be cleared on logout)
        console.log(`✅ Migrated ${key} to user-specific storage (${newKey})`);
      } catch (e) {
        console.error(`Error migrating ${key}:`, e);
      }
    }
  });
};

