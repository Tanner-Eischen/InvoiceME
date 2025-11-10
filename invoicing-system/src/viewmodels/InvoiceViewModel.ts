'use client';

import { useState, useCallback } from 'react';
import { invoiceAPI, CreateInvoiceDto, UpdateInvoiceDto } from '@/lib/api';
import { Invoice, InvoiceStatus } from '@/models/Invoice';
import { toast } from 'sonner';

export const useInvoiceViewModel = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all invoices
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.getAll();
      setInvoices(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      toast.error('Failed to load invoices');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch an invoice by ID
  const fetchInvoiceById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.getById(id);
      setSelectedInvoice(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
      toast.error('Failed to load invoice details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch an invoice by number
  const fetchInvoiceByNumber = useCallback(async (number: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.getByNumber(number);
      setSelectedInvoice(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
      toast.error('Failed to load invoice details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch invoices by client ID
  const fetchInvoicesByClientId = useCallback(async (clientId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.getByClientId(clientId);
      setInvoices(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client invoices');
      toast.error('Failed to load client invoices');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch invoices by status
  const fetchInvoicesByStatus = useCallback(async (status: InvoiceStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.getByStatus(status);
      setInvoices(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      toast.error('Failed to load invoices');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch overdue invoices
  const fetchOverdueInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.getOverdue();
      setInvoices(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overdue invoices');
      toast.error('Failed to load overdue invoices');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new invoice
  const createInvoice = useCallback(async (invoiceData: CreateInvoiceDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.create(invoiceData);
      setInvoices(prev => [...prev, data]);
      toast.success('Invoice created successfully');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      toast.error('Failed to create invoice');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing invoice
  const updateInvoice = useCallback(async (id: string, invoiceData: UpdateInvoiceDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.update(id, invoiceData);
      setInvoices(prev => prev.map(invoice => invoice.id === id ? data : invoice));
      setSelectedInvoice(data);
      toast.success('Invoice updated successfully');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
      toast.error('Failed to update invoice');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update invoice status
  const updateInvoiceStatus = useCallback(async (id: string, status: InvoiceStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await invoiceAPI.updateStatus(id, status);
      setInvoices(prev => prev.map(invoice => invoice.id === id ? data : invoice));
      setSelectedInvoice(data);
      toast.success('Invoice status updated successfully');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice status');
      toast.error('Failed to update invoice status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete an invoice
  const deleteInvoice = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await invoiceAPI.delete(id);
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(null);
      }
      toast.success('Invoice deleted successfully');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      toast.error('Failed to delete invoice');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedInvoice]);

  return {
    invoices,
    selectedInvoice,
    isLoading,
    error,
    fetchInvoices,
    fetchInvoiceById,
    fetchInvoiceByNumber,
    fetchInvoicesByClientId,
    fetchInvoicesByStatus,
    fetchOverdueInvoices,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice
  };
};
