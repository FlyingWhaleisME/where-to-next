// API Service for backend communication
// Use cloud backend for production deployment
const API_BASE_URL = 'https://where-to-next-backend.onrender.com/api';

// Types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Utility function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Utility function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }
    
    return { data };
  } catch (error) {
    return { error: 'Network error' };
  }
};

// Authentication API calls
export const authApi = {
  register: async (email: string, password: string, name?: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    return handleResponse<AuthResponse>(response);
  },

  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    return handleResponse<AuthResponse>(response);
  }
};

// Trip Preferences API calls
export const preferencesApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/preferences`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any[]>(response);
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/preferences/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any>(response);
  },

  create: async (preferences: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/preferences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
    
    return handleResponse<any>(response);
  },

  update: async (id: string, preferences: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/preferences/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
    
    return handleResponse<any>(response);
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/preferences/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse<any>(response);
  }
};

// Documents API calls
export const documentsApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any[]>(response);
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any>(response);
  },

  create: async (document: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(document)
    });
    
    return handleResponse<any>(response);
  },

  update: async (id: string, document: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(document)
    });
    
    return handleResponse<any>(response);
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse<any>(response);
  },

  search: async (query: string): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/documents/search/${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any[]>(response);
  }
};

// Trip Tracing State API calls
export const tripTracingApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/trip-tracing`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any[]>(response);
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/trip-tracing/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any>(response);
  },

  create: async (tripTracingState: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/trip-tracing`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tripTracingState)
    });
    
    return handleResponse<any>(response);
  },

  update: async (id: string, tripTracingState: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/trip-tracing/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tripTracingState)
    });
    
    return handleResponse<any>(response);
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/trip-tracing/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse<any>(response);
  }
};

// User API calls
export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<User>(response);
  },

  updateProfile: async (name: string, email: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email })
    });
    
    return handleResponse<User>(response);
  },

  getDestinations: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/user/destinations`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any[]>(response);
  },

  exportData: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/user/export`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse<any>(response);
  }
};

// Health check
export const healthApi = {
  check: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<any>(response);
  },

  test: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/test`);
    return handleResponse<any>(response);
  }
};

// Utility functions
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const hasToken = !!token;
  
  console.log('🔍 [AUTH CHECK] isAuthenticated() called:', {
    hasToken,
    tokenExists: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack?.split('\n')[2]?.trim()
  });
  
  return hasToken;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  console.log('🔍 [USER CHECK] getCurrentUser() called:', {
    hasUserStr: !!userStr,
    hasToken: !!token,
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack?.split('\n')[2]?.trim()
  });
  
  if (!userStr) {
    console.log('❌ [USER CHECK] No user string in localStorage');
    return null;
  }
  
  try {
    const user = JSON.parse(userStr);
    console.log('✅ [USER CHECK] User found:', {
      userId: user?.id,
      email: user?.email,
      name: user?.name,
      fullUser: user
    });
    return user;
  } catch (e) {
    console.error('❌ [USER CHECK] Error parsing user:', e);
    return null;
  }
};

export const logout = (clearAllUserData: boolean = true): void => {
  console.log('🚪 [LOGOUT API] ==========================================');
  console.log('🚪 [LOGOUT API] logout() function called');
  console.log('🚪 [LOGOUT API] clearAllUserData:', clearAllUserData);
  console.log('🚪 [LOGOUT API] Timestamp:', new Date().toISOString());
  
  // CRITICAL: Get current user ID BEFORE clearing anything
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const userId = userStr ? JSON.parse(userStr).id : null;
  
  console.log('🚪 [LOGOUT API] Current state before clearing:', {
    hasUserStr: !!userStr,
    hasToken: !!token,
    userId: userId,
    userStrPreview: userStr ? JSON.parse(userStr) : null
  });
  
  // Clear ALL user-specific data FIRST (while we still have the user ID)
  if (clearAllUserData && userId) {
    console.log('🚪 [LOGOUT API] Clearing all user-specific data for user ID:', userId);
    
    // Use the userDataStorage utility to clear all user data
    try {
      const { clearAllUserData: clearUserData } = require('../utils/userDataStorage');
      console.log('🚪 [LOGOUT API] Calling clearAllUserData utility...');
      clearUserData(userId);
      console.log('✅ [LOGOUT API] Used userDataStorage utility to clear data');
    } catch (e) {
      // Fallback: Manual clearing
      console.log('⚠️ [LOGOUT API] Using fallback data clearing (utility failed):', e);
      
      // Clear documents created by this user
      const savedDocs = localStorage.getItem('destinationDocuments');
      if (savedDocs) {
        try {
          const docs = JSON.parse(savedDocs);
          const otherUsersDocs = docs.filter((doc: any) => doc.creatorId !== userId);
          localStorage.setItem('destinationDocuments', JSON.stringify(otherUsersDocs));
          console.log('🚪 [DEBUG] apiService.logout: Cleared user documents. Remaining:', otherUsersDocs.length);
        } catch (err) {
          console.error('Error clearing user documents:', err);
        }
      }
      
      // Clear user-specific data (new format with user ID)
      const userKeys = [
        'tripPreferences',
        'savedTripPreferences',
        'tripTracingState',
        'flightStrategies',
        'expensePolicySets',
      ];
      
      userKeys.forEach(key => {
        const userKey = `${key}_${userId}`;
        localStorage.removeItem(userKey);
        // Also clear old format (without user ID) for backward compatibility
        localStorage.removeItem(key);
      });
      
      // Clear collaboration data
      localStorage.removeItem('current-room-id');
      localStorage.removeItem('room-creator');
      localStorage.removeItem('chatbox-stay-open');
    }
    
    console.log('🚪 [DEBUG] apiService.logout: Cleared all user-specific data (preferences, surveys, collaboration)');
  } else {
    console.log('🚪 [DEBUG] apiService.logout: Keeping user data (partial logout)');
  }
  
  // Clear authentication tokens LAST (after data is cleared)
  console.log('🚪 [LOGOUT API] Clearing authentication tokens...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Verify tokens are cleared
  const verifyToken = localStorage.getItem('token');
  const verifyUser = localStorage.getItem('user');
  console.log('🚪 [LOGOUT API] Verification after clearing tokens:', {
    tokenStillExists: !!verifyToken,
    userStillExists: !!verifyUser,
    timestamp: new Date().toISOString()
  });
  
  console.log('✅ [LOGOUT API] Logout process complete');
  console.log('🚪 [LOGOUT API] ==========================================');
};
