'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Calendar, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { PaymentMethod, PaymentStatus, CreatePaymentDto } from '@/models/Payment';
import { Payment } from '@/models/Payment';

const paymentRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(999999.99, 'Amount too large'),
  method: z.nativeEnum(PaymentMethod),
  receivedAt: z.string().min(1, 'Please select a date'),
  reference: z.string().optional(),
});

type PaymentRecordFormData = z.infer<typeof paymentRecordSchema>;

interface PaymentRecordFormProps {
  invoiceId: string;
  remainingBalance: number;
  onSuccess: (payment: Payment) => void;
  onCancel: () => void;
}

export function PaymentRecordForm({ invoiceId, remainingBalance, onSuccess, onCancel }: PaymentRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentRecordFormData, unknown, PaymentRecordFormData>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      amount: Math.min(remainingBalance, remainingBalance > 0 ? remainingBalance : 0),
      method: PaymentMethod.CASH,
      receivedAt: new Date().toISOString().split('T')[0],
      reference: '',
    },
  });

  const onSubmit = async (data: PaymentRecordFormData) => {
    if (data.amount > remainingBalance) {
      form.setError('amount', {
        type: 'manual',
        message: `Amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create payment data
      const paymentData: CreatePaymentDto = {
        invoiceId,
        amount: data.amount,
        method: data.method,
        receivedAt: data.receivedAt,
        reference: data.reference,
      };

      // Create mock payment for now (backend has compilation issues)
      const mockPayment: Payment = {
        id: `payment-${Date.now()}`,
        invoiceId,
        amount: data.amount,
        method: data.method,
        status: PaymentStatus.COMPLETED,
        receivedAt: data.receivedAt,
        reference: data.reference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess(mockPayment);
    } catch (error) {
      console.error('Failed to record payment:', error);
      form.setError('root', {
        type: 'manual',
        message: 'Failed to record payment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <DollarSign className="h-4 w-4" />;
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.BANK_TRANSFER:
      case PaymentMethod.OTHER:
        return <CreditCard className="h-4 w-4" />;
      case PaymentMethod.CHECK:
        return <Check className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Remaining Balance:</strong> ${remainingBalance.toFixed(2)}
          </p>
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }: { field: ControllerRenderProps<PaymentRecordFormData, 'amount'> }) => (
            <FormItem>
              <FormLabel>Payment Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingBalance}
                  placeholder="0.00"
                  {...field}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="method"
          render={({ field }: { field: ControllerRenderProps<PaymentRecordFormData, 'method'> }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(PaymentMethod).map(method => (
                    <SelectItem key={method} value={method}>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(method as PaymentMethod)}
                        <span>{method.replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receivedAt"
          render={({ field }: { field: ControllerRenderProps<PaymentRecordFormData, 'receivedAt'> }) => (
            <FormItem>
              <FormLabel>Received Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }: { field: ControllerRenderProps<PaymentRecordFormData, 'reference'> }) => (
            <FormItem>
              <FormLabel>Reference (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Transaction ID, check number, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recording...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}