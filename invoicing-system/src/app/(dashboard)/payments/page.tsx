'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { paymentAPI } from '@/lib/api';
import { Payment, PaymentStatus, PaymentMethod } from '@/models/Payment';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentForm, type PaymentFormData } from '@/components/payments/payment-form';
import { CreatePaymentDto } from '@/lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // Using sonner for toast notifications

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentAPI.getAll();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (paymentData: PaymentFormData) => {
    try {
      const dto: CreatePaymentDto = {
        invoiceId: paymentData.invoiceId,
        amount: paymentData.amount,
        method: paymentData.method,
        receivedAt: paymentData.receivedAt?.toISOString(),
        reference: paymentData.reference,
      }
      const newPayment = await paymentAPI.create(dto);
      setPayments(prev => [newPayment, ...prev]);
      setIsCreateDialogOpen(false);
      toast.success('Payment recorded successfully.');
    } catch (error) {
      console.error('Failed to create payment:', error);
      toast.error('Failed to record payment. Please try again.');
      throw error;
    }
  };

  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'secondary';
      case PaymentStatus.COMPLETED:
        return 'default';
      case PaymentStatus.REVERSED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <DollarSign className="h-4 w-4" />;
      case PaymentMethod.CREDIT_CARD:
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage and track all payments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" aria-labelledby="record-payment-title">
            <DialogHeader>
              <DialogTitle id="record-payment-title">Record Payment</DialogTitle>
              <DialogDescription>
                Enter payment details to record a new payment.
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              onSubmit={handleCreatePayment}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={PaymentStatus.REVERSED}>Reversed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
            <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
            <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
            <SelectItem value={PaymentMethod.CHECK}>Check</SelectItem>
            <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No payments found</p>
                <p className="text-sm text-muted-foreground">
                  {payments.length === 0 ? 'No payments have been recorded yet.' : 'Try adjusting your filters.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map(payment => (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Payment #{payment.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">Invoice #{payment.invoiceId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getMethodIcon(payment.method)}
                        <span>{payment.method}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Amount</p>
                      <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Received Date</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(payment.receivedAt)}
                      </p>
                    </div>
                    {payment.reference && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium">Reference</p>
                        <p className="text-sm text-muted-foreground">{payment.reference}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}