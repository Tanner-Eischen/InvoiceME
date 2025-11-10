import { Client } from "@/models/Client";
import { Invoice, InvoiceStatus } from "@/models/Invoice";
import { v4 as uuidv4 } from "uuid";

// Mock clients data
export const mockClients: Client[] = [
  {
    id: "client-1",
    name: "Acme Corporation",
    email: "billing@acme.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94107",
    createdAt: new Date(2023, 5, 15).toISOString(),
    updatedAt: new Date(2023, 7, 22).toISOString()
  },
  {
    id: "client-2",
    name: "Globex Industries",
    email: "accounts@globex.com",
    phone: "+1 (555) 987-6543",
    address: "456 Tech Blvd, New York, NY 10001",
    createdAt: new Date(2023, 6, 10).toISOString(),
    updatedAt: new Date(2023, 6, 10).toISOString()
  },
  {
    id: "client-3",
    name: "Wayne Enterprises",
    email: "finance@wayne.com",
    phone: "+1 (555) 228-4277",
    address: "1 Wayne Tower, Gotham City, NJ 08701",
    createdAt: new Date(2023, 8, 5).toISOString(),
    updatedAt: new Date(2023, 9, 12).toISOString()
  },
  {
    id: "client-4",
    name: "Stark Industries",
    email: "payments@stark.com",
    phone: "+1 (555) 482-9922",
    address: "200 Park Avenue, New York, NY 10166",
    createdAt: new Date(2023, 9, 20).toISOString(),
    updatedAt: new Date(2023, 9, 20).toISOString()
  },
  {
    id: "client-5",
    name: "Initech LLC",
    email: "accounting@initech.com",
    phone: "+1 (555) 765-4321",
    address: "4120 Office Park Dr, Austin, TX 78759",
    createdAt: new Date(2023, 10, 8).toISOString(),
    updatedAt: new Date(2023, 10, 15).toISOString()
  }
];

// Mock invoices data
export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    number: "INV-2023-001",
    clientId: "client-1",
    clientName: "Acme Corporation",
    clientEmail: "billing@acme.com",
    issueDate: new Date(2023, 9, 1).toISOString(),
    dueDate: new Date(2023, 9, 30).toISOString(),
    status: "PAID",
    subtotal: 2000.00,
    taxRate: 10,
    taxAmount: 200.00,
    total: 2200.00,
    notes: "Payment received on time. Thank you!",
    createdById: "user-1",
    createdByName: "John Smith",
    items: [
      {
        id: "item-1",
        description: "Web Development Services",
        quantity: 20,
        unitPrice: 100.00,
        amount: 2000.00,
        createdAt: new Date(2023, 9, 1).toISOString(),
        updatedAt: new Date(2023, 9, 1).toISOString()
      }
    ],
    createdAt: new Date(2023, 9, 1).toISOString(),
    updatedAt: new Date(2023, 9, 1).toISOString()
  },
  {
    id: "inv-2",
    number: "INV-2023-002",
    clientId: "client-2",
    clientName: "Globex Industries",
    clientEmail: "accounts@globex.com",
    issueDate: new Date(2023, 9, 5).toISOString(),
    dueDate: new Date(2023, 10, 4).toISOString(),
    status: "PAID",
    subtotal: 5000.00,
    taxRate: 10,
    taxAmount: 500.00,
    total: 5500.00,
    notes: "Contract renewal",
    createdById: "user-1",
    createdByName: "John Smith",
    items: [
      {
        id: "item-2",
        description: "Server Maintenance (Monthly)",
        quantity: 1,
        unitPrice: 2000.00,
        amount: 2000.00,
        createdAt: new Date(2023, 9, 5).toISOString(),
        updatedAt: new Date(2023, 9, 5).toISOString()
      },
      {
        id: "item-3",
        description: "Cloud Storage (500GB)",
        quantity: 1,
        unitPrice: 3002.00,
        amount: 3002.00,
        createdAt: new Date(2023, 9, 5).toISOString(),
        updatedAt: new Date(2023, 9, 5).toISOString()
      }
    ],
    createdAt: new Date(2023, 9, 5).toISOString(),
    updatedAt: new Date(2023, 9, 5).toISOString()
  },
  {
    id: "inv-3",
    number: "INV-2023-003",
    clientId: "client-3",
    clientName: "Wayne Enterprises",
    clientEmail: "finance@wayne.com",
    issueDate: new Date(2023, 9, 15).toISOString(),
    dueDate: new Date(2023, 10, 15).toISOString(),
    status: "SENT",
    subtotal: 15000.00,
    taxRate: 10,
    taxAmount: 1500.00,
    total: 16500.00,
    notes: "Security system upgrade",
    createdById: "user-1",
    createdByName: "John Smith",
    items: [
      {
        id: "item-4",
        description: "Security Audit",
        quantity: 1,
        unitPrice: 5000.00,
        amount: 5000.00,
        createdAt: new Date(2023, 9, 15).toISOString(),
        updatedAt: new Date(2023, 9, 15).toISOString()
      },
      {
        id: "item-5",
        description: "Surveillance System Installation",
        quantity: 1,
        unitPrice: 7500.00,
        amount: 7500.00,
        createdAt: new Date(2023, 9, 15).toISOString(),
        updatedAt: new Date(2023, 9, 15).toISOString()
      },
      {
        id: "item-6",
        description: "Staff Training",
        quantity: 10,
        unitPrice: 250.00,
        amount: 2500.00,
        createdAt: new Date(2023, 9, 15).toISOString(),
        updatedAt: new Date(2023, 9, 15).toISOString()
      }
    ],
    createdAt: new Date(2023, 9, 15).toISOString(),
    updatedAt: new Date(2023, 9, 15).toISOString()
  },
  {
    id: "inv-4",
    number: "INV-2023-004",
    clientId: "client-4",
    clientName: "Stark Industries",
    clientEmail: "payments@stark.com",
    issueDate: new Date(2023, 9, 20).toISOString(),
    dueDate: new Date(2023, 10, 20).toISOString(),
    status: "OVERDUE",
    subtotal: 45000.00,
    taxRate: 10,
    taxAmount: 4500.00,
    total: 49500.00,
    notes: "R&D Project Phase 1",
    createdById: "user-1",
    createdByName: "John Smith",
    items: [
      {
        id: "item-7",
        description: "Research & Development Services",
        quantity: 300,
        unitPrice: 150.00,
        amount: 45000.00,
        createdAt: new Date(2023, 9, 20).toISOString(),
        updatedAt: new Date(2023, 9, 20).toISOString()
      }
    ],
    createdAt: new Date(2023, 9, 20).toISOString(),
    updatedAt: new Date(2023, 9, 20).toISOString()
  },
  {
    id: "inv-5",
    number: "INV-2023-005",
    clientId: "client-5",
    clientName: "Initech LLC",
    clientEmail: "accounting@initech.com",
    issueDate: new Date(2023, 10, 1).toISOString(),
    dueDate: new Date(2023, 11, 1).toISOString(),
    status: "DRAFT",
    subtotal: 8500.00,
    taxRate: 10,
    taxAmount: 850.00,
    total: 9350.00,
    notes: "Office network upgrade",
    createdById: "user-1",
    createdByName: "John Smith",
    items: [
      {
        id: "item-8",
        description: "Network Hardware",
        quantity: 1,
        unitPrice: 6000.00,
        amount: 6000.00,
        createdAt: new Date(2023, 10, 1).toISOString(),
        updatedAt: new Date(2023, 10, 1).toISOString()
      },
      {
        id: "item-9",
        description: "Installation Services",
        quantity: 10,
        unitPrice: 250.00,
        amount: 2500.00,
        createdAt: new Date(2023, 10, 1).toISOString(),
        updatedAt: new Date(2023, 10, 1).toISOString()
      }
    ],
    createdAt: new Date(2023, 10, 1).toISOString(),
    updatedAt: new Date(2023, 10, 1).toISOString()
  }
];

// Local storage keys
const STORAGE_KEYS = {
  INVOICES: 'invoicing_mock_invoices',
  CLIENTS: 'invoicing_mock_clients',
};

// Flag to track if storage has already been initialized in this session
let storageInitialized = false;

// Helper to initialize local storage with mock data if empty
const initializeStorage = (): void => {
  if (typeof window === 'undefined') return;

  // If already initialized in this session, don't reinitialize
  if (storageInitialized) return;

  // Set the initialized flag
  storageInitialized = true;

  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(mockInvoices));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(mockClients));
  }
};

// Types for invoice and client creation/update
type InvoiceItemInput = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

type InvoiceInput = {
  clientId: string;
  issueDate: string;
  dueDate: string;
  status?: InvoiceStatus;
  taxRate?: number;
  notes?: string;
  items: InvoiceItemInput[];
};

type ClientInput = {
  name: string;
  email: string;
  phone?: string;
  address: string;
};

// Mock API service to simulate backend
export const mockApiService = {
  // Initialize mock data
  init: (): void => {
    initializeStorage();
  },

  // Invoice methods
  invoices: {
    getAll: (): Promise<Invoice[]> => {
      initializeStorage();
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      return Promise.resolve(invoices);
    },

    getById: (id: string): Promise<Invoice> => {
      initializeStorage();
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      const invoice = invoices.find((inv: Invoice) => inv.id === id);

      if (!invoice) {
        return Promise.reject(new Error(`Invoice with ID ${id} not found`));
      }

      return Promise.resolve(invoice);
    },

    getByClientId: (clientId: string): Promise<Invoice[]> => {
      initializeStorage();
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      return Promise.resolve(invoices.filter((inv: Invoice) => inv.clientId === clientId));
    },

    getByStatus: (status: InvoiceStatus): Promise<Invoice[]> => {
      initializeStorage();
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      return Promise.resolve(invoices.filter((inv: Invoice) => inv.status === status));
    },

    create: (invoiceData: InvoiceInput): Promise<Invoice> => {
      initializeStorage();
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      const clients: Client[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');

      // Find client
      const client = clients.find((c: Client) => c.id === invoiceData.clientId);
      if (!client) {
        return Promise.reject(new Error(`Client with ID ${invoiceData.clientId} not found`));
      }

      // Generate new invoice
      const newInvoice: Invoice = {
        id: `inv-${uuidv4()}`,
        number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status || "DRAFT",
        subtotal: 0,
        taxRate: invoiceData.taxRate ?? 0,
        taxAmount: 0,
        total: 0,
        notes: invoiceData.notes || "",
        createdById: "user-1", // Default user for mock
        createdByName: "John Smith", // Default user for mock
        items: invoiceData.items.map((item: InvoiceItemInput) => ({
          id: `item-${uuidv4()}`,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Calculate totals
      newInvoice.subtotal = newInvoice.items.reduce((sum: number, item: InvoiceItem) => sum + item.amount, 0);
      newInvoice.taxAmount = newInvoice.subtotal * ((newInvoice.taxRate || 0) / 100);
      newInvoice.total = newInvoice.subtotal + newInvoice.taxAmount;

      // Save to "database"
      invoices.push(newInvoice);
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));

      return Promise.resolve(newInvoice);
    },

    update: (id: string, invoiceData: Partial<InvoiceInput>): Promise<Invoice> => {
      initializeStorage();
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      const index = invoices.findIndex((inv: Invoice) => inv.id === id);

      if (index === -1) {
        return Promise.reject(new Error(`Invoice with ID ${id} not found`));
      }

      // Update invoice
      const updatedInvoice: Invoice = {
        ...invoices[index],
        issueDate: invoiceData.issueDate || invoices[index].issueDate,
        dueDate: invoiceData.dueDate || invoices[index].dueDate,
        status: invoiceData.status || invoices[index].status,
        taxRate: invoiceData.taxRate !== undefined ? invoiceData.taxRate : invoices[index].taxRate,
        notes: invoiceData.notes !== undefined ? invoiceData.notes : invoices[index].notes,
        updatedAt: new Date().toISOString(),
        items: invoices[index].items
      };

      // Update items if provided
      if (invoiceData.items) {
        updatedInvoice.items = invoiceData.items.map((item: InvoiceItemInput) => {
          // If item has an id, it's an existing item
          if (item.id) {
            const existingItem = updatedInvoice.items.find((i: InvoiceItem) => i.id === item.id);
            if (existingItem) {
              return {
                ...existingItem,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity * item.unitPrice,
                updatedAt: new Date().toISOString()
              };
            }
          }

          // It's a new item
          return {
            id: `item-${uuidv4()}`,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });
      }

      // Recalculate totals
      updatedInvoice.subtotal = updatedInvoice.items.reduce((sum: number, item: InvoiceItem) => sum + item.amount, 0);
      updatedInvoice.taxAmount = updatedInvoice.subtotal * ((updatedInvoice.taxRate || 0) / 100);
      updatedInvoice.total = updatedInvoice.subtotal + updatedInvoice.taxAmount;

      // Save to "database"
      invoices[index] = updatedInvoice;
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));

      return Promise.resolve(updatedInvoice);
    },

    updateStatus: (id: string, status: InvoiceStatus): Promise<Invoice> => {
      initializeStorage();
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      const index = invoices.findIndex((inv: Invoice) => inv.id === id);

      if (index === -1) {
        return Promise.reject(new Error(`Invoice with ID ${id} not found`));
      }

      // Update status
      invoices[index] = {
        ...invoices[index],
        status,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      return Promise.resolve(invoices[index]);
    },

    delete: (id: string): Promise<void> => {
      initializeStorage();
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      const index = invoices.findIndex((inv: Invoice) => inv.id === id);

      if (index === -1) {
        return Promise.reject(new Error(`Invoice with ID ${id} not found`));
      }

      invoices.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));

      return Promise.resolve();
    }
  },

  // Client methods
  clients: {
    getAll: (): Promise<Client[]> => {
      initializeStorage();
      const clients: Client[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
      return Promise.resolve(clients);
    },

    getById: (id: string): Promise<Client> => {
      initializeStorage();
      const clients: Client[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
      const client = clients.find((c: Client) => c.id === id);

      if (!client) {
        return Promise.reject(new Error(`Client with ID ${id} not found`));
      }

      return Promise.resolve(client);
    },

    create: (clientData: ClientInput): Promise<Client> => {
      initializeStorage();
      const clients: Client[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');

      // Check if email already exists
      if (clients.some((c: Client) => c.email === clientData.email)) {
        return Promise.reject(new Error(`Client with email ${clientData.email} already exists`));
      }

      // Create new client
      const newClient: Client = {
        id: `client-${uuidv4()}`,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone || "",
        address: clientData.address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to "database"
      clients.push(newClient);
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));

      return Promise.resolve(newClient);
    },

    update: (id: string, clientData: Partial<ClientInput>): Promise<Client> => {
      initializeStorage();
      const clients: Client[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
      const index = clients.findIndex((c: Client) => c.id === id);

      if (index === -1) {
        return Promise.reject(new Error(`Client with ID ${id} not found`));
      }

      // Check if email is being changed and already exists
      if (clientData.email !== undefined && clientData.email !== clients[index].email &&
          clients.some((c: Client) => c.email === clientData.email)) {
        return Promise.reject(new Error(`Client with email ${clientData.email} already exists`));
      }

      // Update client
      clients[index] = {
        ...clients[index],
        name: clientData.name || clients[index].name,
        email: clientData.email || clients[index].email,
        phone: clientData.phone !== undefined ? clientData.phone : clients[index].phone,
        address: clientData.address || clients[index].address,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));

      // Also update client info in invoices
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      const updatedInvoices = invoices.map((inv: Invoice) => {
        if (inv.clientId === id) {
          return {
            ...inv,
            clientName: clients[index].name,
            clientEmail: clients[index].email
          };
        }
        return inv;
      });

      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updatedInvoices));

      return Promise.resolve(clients[index]);
    },

    delete: (id: string): Promise<void> => {
      initializeStorage();
      const clients: Client[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
      const invoices: Invoice[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');

      const index = clients.findIndex((c: Client) => c.id === id);

      if (index === -1) {
        return Promise.reject(new Error(`Client with ID ${id} not found`));
      }

      // Check if client has invoices
      if (invoices.some((inv: Invoice) => inv.clientId === id)) {
        return Promise.reject(new Error(`Cannot delete client with existing invoices`));
      }

      clients.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));

      return Promise.resolve();
    }
  }
};
