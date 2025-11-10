'use client';

import { useState } from 'react';
import { paymentAPI, CreatePaymentDto, UpdatePaymentDto } from '@/lib/api';
import { Payment, PaymentStatus } from '@/models/Payment';
import { toast } from 'sonner';

export const usePaymentViewModel = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all payments
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await paymentAPI.getAll();
      setPayments(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      toast.error('Failed to load payments');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch payments by invoice ID
  const fetchPaymentsByInvoiceId = async (invoiceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await paymentAPI.getByInvoiceId(invoiceId);
      setPayments(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice payments');
      toast.error('Failed to load invoice payments');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a payment by ID
  const fetchPaymentById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await paymentAPI.getById(id);
      setSelectedPayment(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment');
      toast.error('Failed to load payment details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new payment
  const createPayment = async (paymentData: CreatePaymentDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await paymentAPI.create(paymentData);
      setPayments(prev => [...prev, data]);
      toast.success('Payment recorded successfully');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      toast.error('Failed to record payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing payment
  const updatePayment = async (id: string, paymentData: UpdatePaymentDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await paymentAPI.update(id, paymentData);
      setPayments(prev => prev.map(payment => payment.id === id ? data : payment));
      setSelectedPayment(data);
      toast.success('Payment updated successfully');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      toast.error('Failed to update payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (id: string, status: PaymentStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await paymentAPI.updateStatus(id, status);
      setPayments(prev => prev.map(payment => payment.id === id ? data : payment));
      setSelectedPayment(data);
      toast.success('Payment status updated successfully');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
      toast.error('Failed to update payment status');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a payment
  const deletePayment = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await paymentAPI.delete(id);
      setPayments(prev => prev.filter(payment => payment.id !== id));
      if (selectedPayment?.id === id) {
        setSelectedPayment(null);
      }
      toast.success('Payment deleted successfully');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
      toast.error('Failed to delete payment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total payments for an invoice
  const getTotalPaymentsForInvoice = (invoiceId: string) => {
    return payments
      .filter(payment => payment.invoiceId === invoiceId && payment.status === PaymentStatus.COMPLETED)
      .reduce((total, payment) => total + payment.amount, 0);
  };

  // Calculate remaining balance for an invoice
  const getRemainingBalance = (invoiceId: string, invoiceTotal: number) => {
    const totalPaid = getTotalPaymentsForInvoice(invoiceId);
    return Math.max(0, invoiceTotal - totalPaid);
  };

  return {
    payments,
    selectedPayment,
    isLoading,
    error,
    fetchPayments,
    fetchPaymentsByInvoiceId,
    fetchPaymentById,
    createPayment,
    updatePayment,
    updatePaymentStatus,
    deletePayment,
    getTotalPaymentsForInvoice,
    getRemainingBalance
  };
};