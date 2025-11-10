import { mockClient } from './mock-data';

// Extended RequestInit with our custom options
interface CustomRequestInit extends RequestInit {
  useMockFallback?: boolean;
}

// Base API URL - in a real app, this would be from environment variables
const API_BASE_URL = '/api';

// Helper to convert request bodies to JSON
const toJson = (data: any) => {
  return JSON.stringify(data);
};

// Helper to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  return response.json();
};

// Authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Main API client
export const apiClient = {
  // Generic fetch method with type safety
  async fetch<T>(
    endpoint: string,
    options: CustomRequestInit = {}
  ): Promise<T> {
    try {
      // Include authentication headers
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      };

      // Send request
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      return handleResponse<T>(response);
    } catch (error) {
      // If mock fallback is enabled and the fetch failed, try the mock client
      if (options.useMockFallback) {
        console.log(`Using mock fallback for ${endpoint}`);
        return mockClient.handleRequest<T>(endpoint, options.method || 'GET', options.body ? JSON.parse(options.body as string) : undefined);
      }
      throw error;
    }
  },

  // Convenience methods for common HTTP methods
  async get<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  },

  async post<T>(endpoint: string, data: any, options: CustomRequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: toJson(data),
    });
  },

  async put<T>(endpoint: string, data: any, options: CustomRequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: toJson(data),
    });
  },

  async patch<T>(endpoint: string, data: any, options: CustomRequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: toJson(data),
    });
  },

  async delete<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

// API functions for invoices
export const fetchInvoices = (filters?: Record<string, any>) => {
  const queryString = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
  return apiClient.get(`/invoices${queryString}`, { useMockFallback: true });
};

export const fetchInvoiceById = (id: string) => {
  return apiClient.get(`/invoices/${id}`, { useMockFallback: true });
};

export const createInvoice = (data: any) => {
  return apiClient.post('/invoices', data, { useMockFallback: true });
};

export const updateInvoice = (id: string, data: any) => {
  return apiClient.put(`/invoices/${id}`, data, { useMockFallback: true });
};

export const deleteInvoice = (id: string) => {
  return apiClient.delete(`/invoices/${id}`, { useMockFallback: true });
};

// API functions for clients
export const fetchClients = (filters?: Record<string, any>) => {
  const queryString = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
  return apiClient.get(`/clients${queryString}`, { useMockFallback: true });
};

export const fetchClientById = (id: string) => {
  return apiClient.get(`/clients/${id}`, { useMockFallback: true });
};

export const createClient = (data: any) => {
  return apiClient.post('/clients', data, { useMockFallback: true });
};

export const updateClient = (id: string, data: any) => {
  return apiClient.put(`/clients/${id}`, data, { useMockFallback: true });
};

export const deleteClient = (id: string) => {
  return apiClient.delete(`/clients/${id}`, { useMockFallback: true });
};

// API functions for authentication
export const login = (email: string, password: string) => {
  return apiClient.post('/auth/login', { email, password }, { useMockFallback: true });
};

export const register = (userData: any) => {
  return apiClient.post('/auth/register', userData, { useMockFallback: true });
};

export const getCurrentUser = () => {
  return apiClient.get('/auth/me', { useMockFallback: true });
};
