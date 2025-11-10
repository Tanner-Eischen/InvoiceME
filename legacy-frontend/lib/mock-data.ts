// Type definitions for our mock data models
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be hashed
  role: 'ADMIN' | 'USER';
}

export interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number; // quantity * unitPrice
}

export interface Invoice {
  id: string;
  clientId: string;
  number: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELED';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number | null;
  taxAmount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// Initial mock data
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password', // This would be hashed in a real app
    role: 'ADMIN'
  },
  {
    id: 'user-2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password', // This would be hashed in a real app
    role: 'USER'
  }
];

const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Acme Inc',
    contactName: 'John Smith',
    email: 'john@acme.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA 12345',
    website: 'https://www.acme.com',
    status: 'active',
    notes: 'Important client, always pays on time',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'client-2',
    name: 'Globex Corporation',
    contactName: 'Jane Doe',
    email: 'jane@globex.com',
    phone: '(555) 987-6543',
    address: '456 Business Ave, Enterprise, USA 67890',
    status: 'active',
    createdAt: '2023-02-15T00:00:00.000Z',
    updatedAt: '2023-02-15T00:00:00.000Z'
  },
  {
    id: 'client-3',
    name: 'Umbrella Corp',
    contactName: 'Alice Johnson',
    email: 'alice@umbrella.com',
    phone: '(555) 555-5555',
    address: '789 Science Blvd, Research, USA 10101',
    website: 'https://www.umbrella.com',
    status: 'inactive',
    notes: 'Payment often delayed',
    createdAt: '2023-03-20T00:00:00.000Z',
    updatedAt: '2023-05-10T00:00:00.000Z'
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    clientId: 'client-1',
    number: 'INV-001',
    status: 'PAID',
    issueDate: '2023-09-01T00:00:00.000Z',
    dueDate: '2023-09-15T00:00:00.000Z',
    subtotal: 1000.00,
    taxRate: 10,
    taxAmount: 100.00,
    total: 1100.00,
    notes: 'Thank you for your business',
    items: [
      {
        id: 'item-1',
        description: 'Website Development',
        quantity: 10,
        unitPrice: 100.00,
        amount: 1000.00
      }
    ],
    createdAt: '2023-09-01T00:00:00.000Z',
    updatedAt: '2023-09-01T00:00:00.000Z'
  },
  {
    id: 'inv-2',
    clientId: 'client-2',
    number: 'INV-002',
    status: 'SENT',
    issueDate: '2023-09-15T00:00:00.000Z',
    dueDate: '2023-09-30T00:00:00.000Z',
    subtotal: 750.00,
    taxRate: 10,
    taxAmount: 75.00,
    total: 825.00,
    items: [
      {
        id: 'item-2',
        description: 'Logo Design',
        quantity: 1,
        unitPrice: 500.00,
        amount: 500.00
      },
      {
        id: 'item-3',
        description: 'Business Cards',
        quantity: 250,
        unitPrice: 1.00,
        amount: 250.00
      }
    ],
    createdAt: '2023-09-15T00:00:00.000Z',
    updatedAt: '2023-09-15T00:00:00.000Z'
  },
  {
    id: 'inv-3',
    clientId: 'client-3',
    number: 'INV-003',
    status: 'OVERDUE',
    issueDate: '2023-08-15T00:00:00.000Z',
    dueDate: '2023-08-30T00:00:00.000Z',
    subtotal: 2500.00,
    taxRate: 10,
    taxAmount: 250.00,
    total: 2750.00,
    notes: 'Please pay promptly',
    items: [
      {
        id: 'item-4',
        description: 'Marketing Consultation',
        quantity: 5,
        unitPrice: 500.00,
        amount: 2500.00
      }
    ],
    createdAt: '2023-08-15T00:00:00.000Z',
    updatedAt: '2023-08-15T00:00:00.000Z'
  }
];

// Mock database for storing and retrieving data
class MockDatabase {
  private users: User[];
  private clients: Client[];
  private invoices: Invoice[];

  constructor() {
    // Initialize with sample data, stored in localStorage if available
    if (typeof localStorage !== 'undefined') {
      this.users = JSON.parse(localStorage.getItem('mock_users') || JSON.stringify(mockUsers));
      this.clients = JSON.parse(localStorage.getItem('mock_clients') || JSON.stringify(mockClients));
      this.invoices = JSON.parse(localStorage.getItem('mock_invoices') || JSON.stringify(mockInvoices));
    } else {
      this.users = [...mockUsers];
      this.clients = [...mockClients];
      this.invoices = [...mockInvoices];
    }
  }

  // Save to localStorage
  private persistData() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mock_users', JSON.stringify(this.users));
      localStorage.setItem('mock_clients', JSON.stringify(this.clients));
      localStorage.setItem('mock_invoices', JSON.stringify(this.invoices));
    }
  }

  // Generate a simple ID for new records
  private generateId(prefix: string): string {
    return `${prefix}-${Math.floor(Math.random() * 10000)}`;
  }

  // User methods
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  createUser(userData: Omit<User, 'id'>): User {
    const newUser = {
      id: this.generateId('user'),
      ...userData
    };
    this.users.push(newUser);
    this.persistData();
    return newUser;
  }

  // Client methods
  getClients(): Client[] {
    return [...this.clients];
  }

  getClientById(id: string): Client | undefined {
    return this.clients.find(client => client.id === id);
  }

  createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
    const now = new Date().toISOString();
    const newClient = {
      id: this.generateId('client'),
      ...clientData,
      createdAt: now,
      updatedAt: now
    };
    this.clients.push(newClient);
    this.persistData();
    return newClient;
  }

  updateClient(id: string, clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Client {
    const index = this.clients.findIndex(client => client.id === id);
    if (index === -1) {
      throw new Error(`Client with ID ${id} not found`);
    }

    const updatedClient = {
      ...this.clients[index],
      ...clientData,
      updatedAt: new Date().toISOString()
    };
    this.clients[index] = updatedClient;
    this.persistData();
    return updatedClient;
  }

  deleteClient(id: string): void {
    const index = this.clients.findIndex(client => client.id === id);
    if (index === -1) {
      throw new Error(`Client with ID ${id} not found`);
    }

    // Check if client has invoices
    const hasInvoices = this.invoices.some(invoice => invoice.clientId === id);
    if (hasInvoices) {
      throw new Error(`Cannot delete client with ID ${id} because they have invoices`);
    }

    this.clients.splice(index, 1);
    this.persistData();
  }

  // Invoice methods
  getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find(invoice => invoice.id === id);
  }

  getInvoicesByClientId(clientId: string): Invoice[] {
    return this.invoices.filter(invoice => invoice.clientId === clientId);
  }

  createInvoice(invoiceData: Omit<Invoice, 'id' | 'number' | 'subtotal' | 'taxAmount' | 'total' | 'createdAt' | 'updatedAt'>): Invoice {
    // Calculate invoice numbers
    const nextInvoiceNumber = this.getNextInvoiceNumber();
    const now = new Date().toISOString();

    // Calculate totals
    let subtotal = 0;
    const items = invoiceData.items.map(item => {
      const amount = item.quantity * item.unitPrice;
      subtotal += amount;
      return {
        ...item,
        id: item.id || this.generateId('item'),
        amount
      };
    });

    const newInvoice: Invoice = {
      id: this.generateId('inv'),
      number: nextInvoiceNumber,
      subtotal,
      taxAmount: invoiceData.taxRate ? subtotal * (invoiceData.taxRate / 100) : 0,
      total: subtotal + (invoiceData.taxRate ? subtotal * (invoiceData.taxRate / 100) : 0),
      createdAt: now,
      updatedAt: now,
      ...invoiceData,
      items
    };

    this.invoices.push(newInvoice);
    this.persistData();
    return newInvoice;
  }

  updateInvoice(id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'number' | 'createdAt' | 'updatedAt'>>): Invoice {
    const index = this.invoices.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error(`Invoice with ID ${id} not found`);
    }

    // Create a copy of the invoice to update
    const updatedInvoice = {
      ...this.invoices[index],
      ...invoiceData,
      updatedAt: new Date().toISOString()
    };

    // If items are updated, recalculate totals
    if (invoiceData.items) {
      updatedInvoice.items = invoiceData.items.map(item => {
        const amount = item.quantity * item.unitPrice;
        return {
          ...item,
          id: item.id || this.generateId('item'),
          amount
        };
      });

      // Recalculate subtotal
      updatedInvoice.subtotal = updatedInvoice.items.reduce((sum: number, item) => sum + item.amount, 0);

      // Recalculate tax and total
      if (updatedInvoice.taxRate !== null && updatedInvoice.taxRate !== undefined) {
        updatedInvoice.taxAmount = updatedInvoice.subtotal * (updatedInvoice.taxRate / 100);
      } else {
        updatedInvoice.taxAmount = 0;
      }
      updatedInvoice.total = updatedInvoice.subtotal + updatedInvoice.taxAmount;
    }

    this.invoices[index] = updatedInvoice;
    this.persistData();
    return updatedInvoice;
  }

  deleteInvoice(id: string): void {
    const index = this.invoices.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error(`Invoice with ID ${id} not found`);
    }

    this.invoices.splice(index, 1);
    this.persistData();
  }

  // Helper method to generate sequential invoice numbers
  private getNextInvoiceNumber(): string {
    if (this.invoices.length === 0) {
      return 'INV-001';
    }

    // Find the highest existing invoice number
    const numbers = this.invoices.map(invoice => {
      const match = invoice.number.match(/INV-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const maxNumber = Math.max(...numbers);
    return `INV-${String(maxNumber + 1).padStart(3, '0')}`;
  }
}

// Initialize database
const db = new MockDatabase();

// Mock API client to simulate backend API
export const mockClient = {
  // Generic request handler - use this from the API client
  async handleRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
    console.log(`Mock API request: ${method} ${endpoint}`, data);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      if (endpoint.startsWith('/auth')) {
        return this.handleAuthRequests(endpoint, method, data) as T;
      } else if (endpoint.startsWith('/clients')) {
        return this.handleClientRequests(endpoint, method, data) as T;
      } else if (endpoint.startsWith('/invoices')) {
        return this.handleInvoiceRequests(endpoint, method, data) as T;
      } else {
        throw new Error(`Unhandled endpoint: ${endpoint}`);
      }
    } catch (error) {
      console.error('Mock API error:', error);
      throw error;
    }
  },

  // Authentication endpoints
  handleAuthRequests(endpoint: string, method: string, data?: any) {
    if (endpoint === '/auth/login' && method === 'POST') {
      const { email, password } = data;
      const user = db.getUserByEmail(email);

      if (!user || user.password !== password) {
        throw new Error('Invalid credentials');
      }

      return {
        token: 'mock-jwt-token',
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    } else if (endpoint === '/auth/register' && method === 'POST') {
      const existingUser = db.getUserByEmail(data.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }

      const newUser = db.createUser(data);
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
    } else if (endpoint === '/auth/me' && method === 'GET') {
      // In a real app, we'd use the token to identify the user
      // Here we just return the first user
      const user = db.getUsers()[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    }

    throw new Error(`Unhandled auth endpoint: ${endpoint}`);
  },

  // Client endpoints
  handleClientRequests(endpoint: string, method: string, data?: any) {
    // Get all clients
    if (endpoint === '/clients' && method === 'GET') {
      return db.getClients();
    }

    // Create client
    else if (endpoint === '/clients' && method === 'POST') {
      return db.createClient(data);
    }

    // For endpoints with IDs like /clients/{id}
    else if (endpoint.match(/^\/clients\/[\w-]+$/)) {
      const id = endpoint.split('/')[2];

      // Get client by ID
      if (method === 'GET') {
        const client = db.getClientById(id);
        if (!client) throw new Error(`Client with ID ${id} not found`);
        return client;
      }

      // Update client
      else if (method === 'PUT') {
        return db.updateClient(id, data);
      }

      // Delete client
      else if (method === 'DELETE') {
        db.deleteClient(id);
        return { success: true };
      }
    }

    throw new Error(`Unhandled client endpoint: ${endpoint}`);
  },

  // Invoice endpoints
  handleInvoiceRequests(endpoint: string, method: string, data?: any) {
    // Get all invoices
    if (endpoint === '/invoices' && method === 'GET') {
      return db.getInvoices();
    }

    // Create invoice
    else if (endpoint === '/invoices' && method === 'POST') {
      return db.createInvoice(data);
    }

    // For endpoints with IDs like /invoices/{id}
    else if (endpoint.match(/^\/invoices\/[\w-]+$/)) {
      const id = endpoint.split('/')[2];

      // Get invoice by ID
      if (method === 'GET') {
        const invoice = db.getInvoiceById(id);
        if (!invoice) throw new Error(`Invoice with ID ${id} not found`);
        return invoice;
      }

      // Update invoice
      else if (method === 'PUT') {
        return db.updateInvoice(id, data);
      }

      // Delete invoice
      else if (method === 'DELETE') {
        db.deleteInvoice(id);
        return { success: true };
      }
    }

    // Get invoices by client ID using a query parameter
    else if (endpoint.match(/^\/invoices\?clientId=[\w-]+$/)) {
      const clientId = endpoint.split('=')[1];
      return db.getInvoicesByClientId(clientId);
    }

    throw new Error(`Unhandled invoice endpoint: ${endpoint}`);
  }
};
