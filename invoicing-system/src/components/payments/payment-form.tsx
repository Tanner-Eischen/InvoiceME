'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PaymentMethod, PaymentStatus } from '@/models/Payment';
import { invoiceAPI } from '@/lib/api';
import { Invoice } from '@/models/Invoice';
import { toast } from 'sonner';

const paymentFormSchema = z.object({
  invoiceId: z.string().min(1, 'Please select an invoice'),
  amount: z.number().positive('Amount must be positive'),
  method: z.nativeEnum(PaymentMethod),
  receivedAt: z.date(),
  reference: z.string().optional(),
  status: z.nativeEnum(PaymentStatus),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<PaymentFormData>;
}

export function PaymentForm({ onSubmit, onCancel, initialData }: PaymentFormProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  // Using Sonner for toast notifications

  const form = useForm<PaymentFormData, unknown, PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: initialData?.invoiceId || '',
      amount: initialData?.amount || 0,
      method: initialData?.method || PaymentMethod.CASH,
      receivedAt: initialData?.receivedAt ? new Date(initialData.receivedAt) : new Date(),
      reference: initialData?.reference || '',
      status: initialData?.status || PaymentStatus.PENDING,
    },
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceAPI.getAll();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PaymentFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit payment:', error);
      toast.error('Failed to record payment. Please try again.');
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <DollarSign className="h-4 w-4" />;
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.BANK_TRANSFER:
        return <CreditCard className="h-4 w-4" />;
      case PaymentMethod.CHECK:
        return <Check className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="invoiceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an invoice" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>Loading invoices...</SelectItem>
                  ) : invoices.length === 0 ? (
                    <SelectItem value="" disabled>No invoices available</SelectItem>
                  ) : (
                    invoices.map(invoice => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        #{invoice.number} - {invoice.clientName} ({invoice.total})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
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
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Received Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date: Date | undefined) =>
                      !!date && (date > new Date() || date < new Date("1900-01-01"))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Transaction ID, check number, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}