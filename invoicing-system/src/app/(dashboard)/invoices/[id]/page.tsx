'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Send,
  Pencil,
  Trash,
  CheckCircle2,
  Clock,
  Ban,
  Circle,
  CreditCard,
  Plus,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

import { useInvoiceViewModel } from '@/viewmodels/InvoiceViewModel';
import { usePaymentViewModel } from '@/viewmodels/PaymentViewModel';
import { Invoice, InvoiceStatus } from '@/models/Invoice';
import { Payment, PaymentStatus } from '@/models/Payment';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreatePaymentDto, paymentAPI } from '@/lib/api';
import { PaymentMethod } from '@/models/Payment';
import { PaymentRecordForm } from '@/components/payments/payment-record-form';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const { selectedInvoice, isLoading, error, fetchInvoiceById, updateInvoiceStatus, deleteInvoice } = useInvoiceViewModel();
  const { payments: vmPayments, fetchPaymentsByInvoiceId, createPayment, getTotalPaymentsForInvoice, getRemainingBalance } = usePaymentViewModel();
  // Mock payments for now - backend has compilation issues
  const mockPayments = useMemo<Payment[]>(() => [
    {
      id: 'payment-1',
      invoiceId,
      amount: 500.0,
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.COMPLETED,
      receivedAt: '2024-01-15',
      reference: 'CC-12345',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'payment-2',
      invoiceId,
      amount: 300.0,
      method: PaymentMethod.CASH,
      status: PaymentStatus.COMPLETED,
      receivedAt: '2024-01-20',
      reference: 'CASH-001',
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
  ], [invoiceId]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      await fetchInvoiceById(invoiceId);
      // Load mock payments for this invoice
      setPayments(mockPayments);
    };

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId, fetchInvoiceById, mockPayments]);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      toast.success(`Invoice status updated to ${newStatus.toLowerCase()}`);
    } catch (err) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoice(invoiceId);
        toast.success('Invoice deleted successfully');
        router.push('/invoices');
      } catch (err) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleExportPdf = () => {
    toast.success('PDF generation is not implemented in this demo');
    // In a real app, we'd generate a PDF here
  };

  const handleRecordPayment = () => {
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = async (payment: Payment) => {
    setPayments(prev => [...prev, payment]);
    setIsPaymentDialogOpen(false);
    toast.success('Payment recorded successfully');
    
    // Update invoice status if fully paid
    const totalPaid = getTotalPaymentsForInvoice(invoiceId) + payment.amount;
    if (selectedInvoice && totalPaid >= selectedInvoice.total) {
      await updateInvoiceStatus(invoiceId, 'PAID');
    } else if (selectedInvoice && totalPaid > 0) {
      await updateInvoiceStatus(invoiceId, 'PARTIALLY_PAID');
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch(status) {
      case 'PAID':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>;
      case 'SENT':
        return <Badge className="bg-blue-500">Sent</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge className="bg-yellow-500">Partially Paid</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'CANCELED':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch(status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'REVERSED':
        return <Badge variant="outline">Reversed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-destructive">Error loading invoice: {error}</p>
        <Button variant="outline" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  if (!selectedInvoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p>Invoice not found</p>
        <Button variant="outline" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedInvoice.number}</h1>
            <p className="text-muted-foreground">Invoice details and management</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => router.push(`/invoices/${invoiceId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Number</p>
                <p className="mt-1">{selectedInvoice.number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                <p className="mt-1">{format(new Date(selectedInvoice.issueDate), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className="mt-1">{format(new Date(selectedInvoice.dueDate), 'MMMM d, yyyy')}</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground">Actions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('DRAFT')}
                  disabled={selectedInvoice.status === 'DRAFT'}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Mark as Draft
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('SENT')}
                  disabled={selectedInvoice.status === 'SENT'}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Mark as Sent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                  onClick={() => handleStatusChange('PARTIALLY_PAID')}
                  disabled={selectedInvoice.status === 'PARTIALLY_PAID'}
                >
                  <Circle className="mr-2 h-4 w-4" />
                  Mark as Partially Paid
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-100 hover:bg-green-200 text-green-800"
                  onClick={() => handleStatusChange('PAID')}
                  disabled={selectedInvoice.status === 'PAID'}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-100 hover:bg-red-200 text-red-800"
                  onClick={() => handleStatusChange('OVERDUE')}
                  disabled={selectedInvoice.status === 'OVERDUE'}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Mark as Overdue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                  onClick={() => handleStatusChange('CANCELED')}
                  disabled={selectedInvoice.status === 'CANCELED'}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Mark as Canceled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client Name</p>
              <p className="mt-1 text-lg font-semibold">{selectedInvoice.clientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-1">
                <a href={`mailto:${selectedInvoice.clientEmail}`} className="text-primary hover:underline">
                  {selectedInvoice.clientEmail}
                </a>
              </p>
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/clients/${selectedInvoice.clientId}`)}
              >
                View Client Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
          <CardDescription>
            Items and services included in this invoice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInvoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right">Subtotal</TableCell>
                  <TableCell className="text-right">${selectedInvoice.subtotal.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right">Tax ({selectedInvoice.taxRate}%)</TableCell>
                  <TableCell className="text-right">${selectedInvoice.taxAmount.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                  <TableCell className="text-right font-bold">${selectedInvoice.total.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>
            Payment status and recorded payments for this invoice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice Total</p>
              <p className="text-2xl font-bold">${selectedInvoice.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${getTotalPaymentsForInvoice(invoiceId).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
              <p className="text-2xl font-bold text-red-600">
                ${getRemainingBalance(invoiceId, selectedInvoice.total).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={handleRecordPayment}>
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>

          {payments.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.receivedAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{payment.method.toLowerCase().replace('_', ' ')}</TableCell>
                      <TableCell>{payment.reference || '-'}</TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {payments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No payments recorded for this invoice yet.
            </p>
          )}
        </CardContent>
      </Card>

      {selectedInvoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{selectedInvoice.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="border-t pt-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Created on {format(new Date(selectedInvoice.createdAt), 'MMMM d, yyyy')}
              {selectedInvoice.createdAt !== selectedInvoice.updatedAt &&
                ` · Updated on ${format(new Date(selectedInvoice.updatedAt), 'MMMM d, yyyy')}`}
            </p>
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Invoice
          </Button>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" aria-labelledby="record-invoice-payment-title">
          <DialogHeader>
            <DialogTitle id="record-invoice-payment-title">Record Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for this invoice. The invoice status will be updated automatically.
            </DialogDescription>
          </DialogHeader>
          <PaymentRecordForm
            invoiceId={invoiceId}
            remainingBalance={selectedInvoice ? getRemainingBalance(invoiceId, selectedInvoice.total) : 0}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setIsPaymentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
