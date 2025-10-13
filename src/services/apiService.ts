// API Service for backend communication
// Use localhost for local development (more reliable)
const API_BASE_URL = 'http://localhost:3001/api';

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

// AI API calls
export const aiApi = {
  generateSummary: async (tripPreferences: any, tripTracingState?: any): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/ai/generate-summary`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tripPreferences, tripTracingState })
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
  return !!localStorage.getItem('token');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
