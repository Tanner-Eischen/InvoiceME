export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELED';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number | null;
  taxAmount: number;
  total: number;
  notes: string | null;
  createdById: string;
  createdByName: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

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
  status?: string;
  taxRate?: number;
  notes?: string;
  items: InvoiceItemDto[];
};

export type UpdateInvoiceDto = {
  id: string;
  issueDate: string;
  dueDate: string;
  status?: string;
  taxRate?: number;
  notes?: string;
  items: InvoiceItemDto[];
};

export type UpdateInvoiceStatusDto = {
  invoiceId: string;
  status: InvoiceStatus;
};
