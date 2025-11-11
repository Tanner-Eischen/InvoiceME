'use client';

// API client for the invoicing system
import { getToken } from './auth';
import { mockApiService } from './mock-data';
import { Client } from '@/models/Client';
import { Invoice, InvoiceStatus } from '@/models/Invoice';
import { Payment, PaymentMethod, PaymentStatus } from '@/models/Payment';
import { CreateUserDto } from '@/models/User';

// Extend RequestInit to include our custom options
declare global {
  interface RequestInit {
    useMockFallback?: boolean;
  }
}

// Define types for API responses
type AuthResponse = {
  token: string;
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
};

type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
};

type ApiError = {
  message: string;
  status?: number;
};

function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.message === 'string';
}

// Define DTO types to match the mock-data service
export type InvoiceItemDto = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type CreateInvoiceDto = {
  clientId: string;
  issueDate: string;
  dueDate: string;
  status?: InvoiceStatus;
  taxRate?: number;
  notes?: string;
  items: InvoiceItemDto[];
};

export type UpdateInvoiceDto = Partial<CreateInvoiceDto> & { id: string };

export type CreateClientDto = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateClientDto = Partial<CreateClientDto> & { id: string };

// Payment DTOs
export type CreatePaymentDto = {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  receivedAt?: string;
  reference?: string;
};

export type UpdatePaymentDto = Partial<CreatePaymentDto> & { id: string };

// Configuration - Use real backend API
const USE_MOCK_API = false; // Use real backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Enable fallback to mock API for development
const ENABLE_MOCK_FALLBACK = true;

// Fetch wrapper with authentication and error handling
async function fetchWithAuth<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  // If explicitly asked to use mock fallback, route to mocks
  if (options.useMockFallback) {
    const path = url.startsWith('/') ? url : `/${url}`;

    if (path.startsWith('/auth/')) {
      if (path === '/auth/login') {
        return {
          token: "mock-jwt-token",
          id: "user-1",
          name: "John Smith",
          email: "john@example.com",
          role: "ADMIN"
        } as T;
      } else if (path === '/auth/register') {
        return {
          id: "user-2",
          name: "New User",
          email: "newuser@example.com",
          role: "USER"
        } as T;
      }
    } else if (path.startsWith('/invoices')) {
      return handleMockInvoiceRequests(path, options) as Promise<T>;
    } else if (path.startsWith('/clients')) {
      return handleMockClientRequests(path, options) as Promise<T>;
    } else if (path.startsWith('/payments')) {
      return handleMockPaymentRequests(path, options) as Promise<T>;
    }

    throw new Error(`Unhandled mock API route: ${path}`);
  }

  // If using mock API, route to mock implementation
  if (USE_MOCK_API) {
    const path = url.startsWith('/') ? url : `/${url}`;

    // Determine which mock API method to call based on URL and method
    if (path.startsWith('/auth/')) {
      // Auth endpoints - these would be mocked differently
      // For now we just simulate successful responses
      if (path === '/auth/login') {
        return {
          token: "mock-jwt-token",
          id: "user-1",
          name: "John Smith",
          email: "john@example.com",
          role: "ADMIN"
        } as AuthResponse as T;
      } else if (path === '/auth/register') {
        return {
          id: "user-2",
          name: "New User",
          email: "newuser@example.com",
          role: "USER"
        } as RegisterResponse as T;
      }
    } else if (path.startsWith('/invoices')) {
      return handleMockInvoiceRequests(path, options) as Promise<T>;
    } else if (path.startsWith('/clients')) {
      return handleMockClientRequests(path, options) as Promise<T>;
    } else if (path.startsWith('/payments')) {
      return handleMockPaymentRequests(path, options) as Promise<T>;
    }

    throw new Error(`Unhandled mock API route: ${path}`);
  }

  // Else use real API
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (response.ok) {
      // For 204 No Content responses, return null
      if (response.status === 204) {
        return null as T;
      }

      return response.json() as Promise<T>;
    } else {
      // Try to parse error response JSON first; if it fails, fall back to text
      let message = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData: unknown = await response.json();
        if (isApiError(errorData)) {
          message = errorData.message;
        }
      } catch {
        // JSON parse failed (e.g., empty body or text/plain); attempt to read text
        const text = await response.text().catch(() => '');
        if (text && text.trim().length > 0) {
          message = text;
        }
      }

      // Friendly fallback for common 401 cases
      if (response.status === 401) {
        const isDefault = !message || message.startsWith('HTTP 401');
        const isLogin = url.includes('/auth/login');
        if (isDefault) {
          message = isLogin
            ? 'Invalid email or password'
            : 'Unauthorized. Please sign in and try again.';
        }
      }

      // Development fallback: if payments list is not supported yet, use mock
      // Only applies to GET /payments. Keeps production behavior unchanged.
      if (
        ENABLE_MOCK_FALLBACK &&
        !USE_MOCK_API &&
        response.status === 405 &&
        typeof url === 'string' && url === '/payments' &&
        (config.method ?? 'GET') === 'GET'
      ) {
        console.warn('GET /payments not supported by backend; using mock fallback for development.');
        return fetchWithAuth<T>(url, { ...options, useMockFallback: true });
      }

      throw new Error(message);
    }
  } catch (err) {
    console.error('API request failed:', err);

    // If we're configured to fall back to mock and we got a connection error
    if (ENABLE_MOCK_FALLBACK && !USE_MOCK_API && (err instanceof TypeError || (err instanceof Error && err.message.includes('Failed to fetch')))) {
      console.log('Falling back to mock API due to connection error');
      return fetchWithAuth<T>(url, {
        ...options,
        useMockFallback: true
      });
    }

    throw err;
  }
}

// Handle mock invoice API requests
async function handleMockInvoiceRequests(
  path: string,
  options: RequestInit
): Promise<Invoice | Invoice[] | null> {
  const method = options.method || 'GET';
  const matches = path.match(/^\/invoices\/([^\/]+)(?:\/([^\/]+))?$/);

  // Parse request body if it exists
  let body: Partial<CreateInvoiceDto> | null = null;
  if (options.body) {
    body = JSON.parse(options.body as string);
  }

  // GET /invoices
  if (path === '/invoices' && method === 'GET') {
    return mockApiService.invoices.getAll();
  }

  // POST /invoices (create)
  if (path === '/invoices' && method === 'POST' && body) {
    return mockApiService.invoices.create(body as CreateInvoiceDto);
  }

  // GET /invoices/overdue
  if (path === '/invoices/overdue' && method === 'GET') {
    const overdueInvoices = await mockApiService.invoices.getByStatus('OVERDUE');
    return overdueInvoices;
  }

  // Handle status-based queries like /invoices/status/PAID
  if (path.startsWith('/invoices/status/') && method === 'GET') {
    const status = path.split('/').pop() as InvoiceStatus;
    return mockApiService.invoices.getByStatus(status);
  }

  // Handle client-based queries like /invoices/client/client-1
  if (path.startsWith('/invoices/client/') && method === 'GET') {
    const clientId = path.split('/').pop() as string;
    return mockApiService.invoices.getByClientId(clientId);
  }

  // Handle number-based queries like /invoices/number/INV-2023-001
  if (path.startsWith('/invoices/number/') && method === 'GET') {
    const number = path.split('/').pop() as string;
    const allInvoices = await mockApiService.invoices.getAll();
    const invoice = allInvoices.find(inv => inv.number === number);
    if (!invoice) throw new Error(`Invoice with number ${number} not found`);
    return invoice;
  }

  // Handle ID-based operations if matches pattern /invoices/{id}
  if (matches && matches[1]) {
    const id = matches[1];

    // GET /invoices/{id}
    if (method === 'GET') {
      return mockApiService.invoices.getById(id);
    }

    // PUT /invoices/{id}
    if (method === 'PUT' && body) {
      return mockApiService.invoices.update(id, body as UpdateInvoiceDto);
    }

    // DELETE /invoices/{id}
    if (method === 'DELETE') {
      await mockApiService.invoices.delete(id);
      return null;
    }

    // PATCH /invoices/{id}/status
    if (matches[2] === 'status' && method === 'PATCH' && body) {
      return mockApiService.invoices.updateStatus(id, (body as { status: InvoiceStatus }).status);
    }
  }

  throw new Error(`Unhandled mock invoice API route: ${path} with method ${method}`);
}

// Handle mock client API requests
async function handleMockClientRequests(
  path: string,
  options: RequestInit
): Promise<Client | Client[] | null> {
  const method = options.method || 'GET';
  const matches = path.match(/^\/clients\/([^\/]+)$/);

  // Parse request body if it exists
  let body: Partial<Client> | null = null;
  if (options.body) {
    body = JSON.parse(options.body as string);
  }

  // GET /clients
  if (path === '/clients' && method === 'GET') {
    return mockApiService.clients.getAll();
  }

  // POST /clients (create)
  if (path === '/clients' && method === 'POST' && body) {
    return mockApiService.clients.create(body as CreateClientDto);
  }

  // Handle search queries like /clients/search?name=Acme
  if (path.startsWith('/clients/search') && method === 'GET') {
    const url = new URL(`http://example.com${path}`);
    const name = url.searchParams.get('name') || '';
    const allClients = await mockApiService.clients.getAll();
    return allClients.filter(client =>
      client.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Handle ID-based operations if matches pattern /clients/{id}
  if (matches && matches[1]) {
    const id = matches[1];

    // GET /clients/{id}
    if (method === 'GET') {
      return mockApiService.clients.getById(id);
    }

    // PUT /clients/{id}
    if (method === 'PUT' && body) {
      return mockApiService.clients.update(id, body as UpdateClientDto);
    }

    // DELETE /clients/{id}
    if (method === 'DELETE') {
      await mockApiService.clients.delete(id);
      return null;
    }
  }

  throw new Error(`Unhandled mock client API route: ${path} with method ${method}`);
}

// Handle mock payment API requests
async function handleMockPaymentRequests(
  path: string,
  options: RequestInit
): Promise<Payment | Payment[] | null> {
  const method = options.method || 'GET';
  const matches = path.match(/^\/payments\/([^\/]+)(?:\/(\w+))?$/);

  // Parse request body if it exists
  let body: Partial<CreatePaymentDto> | null = null;
  if (options.body) {
    body = JSON.parse(options.body as string);
  }

  // GET /payments
  if (path === '/payments' && method === 'GET') {
    return mockApiService.payments.getAll();
  }

  // POST /payments (create)
  if (path === '/payments' && method === 'POST' && body) {
    const paymentData = body as CreatePaymentDto;
    return mockApiService.payments.create(paymentData);
  }

  // Handle invoice-based queries like /payments/invoice/invoice-1
  if (path.startsWith('/payments/invoice/') && method === 'GET') {
    const invoiceId = path.split('/').pop() as string;
    return mockApiService.payments.getByInvoiceId(invoiceId);
  }

  // Handle ID-based operations if matches pattern /payments/{id}
  if (matches && matches[1]) {
    const id = matches[1];

    // GET /payments/{id}
    if (method === 'GET') {
      return mockApiService.payments.getById(id);
    }

    // PUT /payments/{id}
    if (method === 'PUT' && body) {
      const paymentData = body as UpdatePaymentDto;
      return mockApiService.payments.update(id, paymentData);
    }

    // DELETE /payments/{id}
    if (method === 'DELETE') {
      await mockApiService.payments.delete(id);
      return null;
    }

    // PATCH /payments/{id}/status
    if (matches[2] === 'status' && method === 'PATCH' && body) {
      const { status } = body as { status: PaymentStatus };
      return mockApiService.payments.updateStatus(id, status);
    }
  }

  throw new Error(`Unhandled mock payment API route: ${path} with method ${method}`);
}

// Auth endpoints
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return fetchWithAuth<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: CreateUserDto): Promise<RegisterResponse> => {
    return fetchWithAuth<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Client endpoints
export const clientAPI = {
  getAll: async (): Promise<Client[]> => {
    return fetchWithAuth<Client[]>('/clients');
  },

  getById: async (id: string): Promise<Client> => {
    return fetchWithAuth<Client>(`/clients/${id}`);
  },

  search: async (name: string): Promise<Client[]> => {
    return fetchWithAuth<Client[]>(`/clients/search?name=${encodeURIComponent(name)}`);
  },

  create: async (clientData: CreateClientDto): Promise<Client> => {
    return fetchWithAuth<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  update: async (id: string, clientData: UpdateClientDto): Promise<Client> => {
    return fetchWithAuth<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...clientData, id }),
    });
  },

  delete: async (id: string): Promise<null> => {
    return fetchWithAuth<null>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Invoice endpoints
export const invoiceAPI = {
  getAll: async (): Promise<Invoice[]> => {
    return fetchWithAuth<Invoice[]>('/invoices');
  },

  getById: async (id: string): Promise<Invoice> => {
    return fetchWithAuth<Invoice>(`/invoices/${id}`);
  },

  getByNumber: async (number: string): Promise<Invoice> => {
    return fetchWithAuth<Invoice>(`/invoices/number/${number}`);
  },

  getByClientId: async (clientId: string): Promise<Invoice[]> => {
    return fetchWithAuth<Invoice[]>(`/invoices/client/${clientId}`);
  },

  getByStatus: async (status: InvoiceStatus): Promise<Invoice[]> => {
    return fetchWithAuth<Invoice[]>(`/invoices/status/${status}`);
  },

  getOverdue: async (): Promise<Invoice[]> => {
    return fetchWithAuth<Invoice[]>('/invoices/overdue');
  },

  create: async (invoiceData: CreateInvoiceDto): Promise<Invoice> => {
    return fetchWithAuth<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  },

  update: async (id: string, invoiceData: UpdateInvoiceDto): Promise<Invoice> => {
    return fetchWithAuth<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...invoiceData, id }),
    });
  },

  updateStatus: async (id: string, status: InvoiceStatus): Promise<Invoice> => {
    return fetchWithAuth<Invoice>(`/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ invoiceId: id, status }),
    });
  },

  delete: async (id: string): Promise<null> => {
    return fetchWithAuth<null>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },
};

// Payment endpoints
export const paymentAPI = {
  getAll: async (): Promise<Payment[]> => {
    return fetchWithAuth<Payment[]>('/payments');
  },

  getById: async (id: string): Promise<Payment> => {
    return fetchWithAuth<Payment>(`/payments/${id}`);
  },

  getByInvoiceId: async (invoiceId: string): Promise<Payment[]> => {
    return fetchWithAuth<Payment[]>(`/payments/invoice/${invoiceId}`);
  },

  create: async (paymentData: CreatePaymentDto): Promise<Payment> => {
    return fetchWithAuth<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  update: async (id: string, paymentData: UpdatePaymentDto): Promise<Payment> => {
    return fetchWithAuth<Payment>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...paymentData, id }),
    });
  },

  updateStatus: async (id: string, status: PaymentStatus): Promise<Payment> => {
    return fetchWithAuth<Payment>(`/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentId: id, status }),
    });
  },

  delete: async (id: string): Promise<null> => {
    return fetchWithAuth<null>(`/payments/${id}`, {
      method: 'DELETE',
    });
  },
};
