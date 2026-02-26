// API Service for backend communication
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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

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
  },

  deleteAccount: async (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/user/account`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse<{ success: boolean; message: string }>(response);
  }
};

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

export const debugApi = {
  getAllData: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/debug/all-data`);
    return handleResponse<any>(response);
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const hasToken = !!token;
  
  
  return hasToken;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!userStr) {
    return null;
  }
  
  try {
    const user = JSON.parse(userStr);
    return user;
  } catch (e) {
    console.error('Error parsing user:', e);
    return null;
  }
};

export const logout = (clearAllUserData: boolean = true): void => {
  const userStr = localStorage.getItem('user');
  const userId = userStr ? JSON.parse(userStr).id : null;
  
  if (clearAllUserData && userId) {
    try {
      const { clearAllUserData: clearUserData } = require('../utils/userDataStorage');
      clearUserData(userId);
    } catch (e) {
      const savedDocs = localStorage.getItem('destinationDocuments');
      if (savedDocs) {
        try {
          const docs = JSON.parse(savedDocs);
          const otherUsersDocs = docs.filter((doc: any) => doc.creatorId !== userId);
          localStorage.setItem('destinationDocuments', JSON.stringify(otherUsersDocs));
        } catch (err) {
          console.error('Error clearing user documents:', err);
        }
      }
      
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
        localStorage.removeItem(key);
      });
      
      localStorage.removeItem('current-room-id');
      localStorage.removeItem('room-creator');
      localStorage.removeItem('chatbox-stay-open');
    }
  }
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
