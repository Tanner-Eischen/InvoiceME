'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as z from 'zod';

import { useClientViewModel } from '@/viewmodels/ClientViewModel';
import { useInvoiceViewModel } from '@/viewmodels/InvoiceViewModel';
import { Invoice, InvoiceStatus, CreateInvoiceDto, UpdateInvoiceDto } from '@/models/Invoice';

import { Button } from '../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Calendar } from '../../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';

// Validation schema for invoice items
const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unitPrice: z.coerce.number().positive('Unit price must be positive'),
});

// Validation schema for the invoice form
const invoiceFormSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.date({
    message: 'Issue date is required',
  }),
  dueDate: z.date({
    message: 'Due date is required',
  }),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELED']),
  taxRate: z.coerce.number().min(0, 'Tax rate must be non-negative').optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
}).refine(
  (data) => data.dueDate >= data.issueDate,
  {
    message: 'Due date must be on or after the issue date',
    path: ['dueDate'],
  }
);

// Form value types based on the schema
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// Item with calculated amount
interface InvoiceItemWithAmount {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Props for the component
interface InvoiceFormProps {
  initialData?: Invoice; // For editing existing invoices
  isEditing?: boolean;
}

export function InvoiceForm({ initialData, isEditing = false }: InvoiceFormProps) {
  const router = useRouter();
  const { clients, fetchClients, isLoading: clientsLoading } = useClientViewModel();
  const { createInvoice, updateInvoice, isLoading: invoiceLoading } = useInvoiceViewModel();

  // State for invoice items with calculated amounts
  const [items, setItems] = useState<InvoiceItemWithAmount[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 },
  ]);

  // State for invoice summary calculations
  const [summary, setSummary] = useState({
    subtotal: 0,
    taxAmount: 0,
    total: 0,
  });

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData && isEditing) {
      setItems(initialData.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })));

      calculateSummary(initialData.items);
    }
  }, [initialData, isEditing]);

  // Form setup with validation
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialData && isEditing
      ? {
          clientId: initialData.clientId,
          issueDate: new Date(initialData.issueDate),
          dueDate: new Date(initialData.dueDate),
          status: initialData.status,
          taxRate: initialData.taxRate || 0,
          notes: initialData.notes || '',
          items: initialData.items.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }
      : {
          clientId: '',
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default: 30 days from now
          status: 'DRAFT' as InvoiceStatus,
          taxRate: 0,
          notes: '',
          items: [{ description: '', quantity: 1, unitPrice: 0 }],
        }
  });

  // Watch form values to update calculations
  const watchedItems = form.watch('items');
  const watchedTaxRate = form.watch('taxRate');

  // Update items and calculations when form values change
  useEffect(() => {
    if (watchedItems) {
      const newItems = watchedItems.map(item => ({
        ...item,
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        amount: (item.quantity || 0) * (item.unitPrice || 0),
      }));

      setItems(newItems);
      calculateSummary(newItems);
    }
  }, [watchedItems]);

  // Recalculate tax when tax rate changes
  useEffect(() => {
    if (summary.subtotal > 0) {
      const taxRate = watchedTaxRate || 0;
      const taxAmount = (summary.subtotal * taxRate) / 100;

      setSummary(prev => ({
        ...prev,
        taxAmount,
        total: prev.subtotal + taxAmount,
      }));
    }
  }, [watchedTaxRate, summary.subtotal]);

  // Calculate invoice summary (subtotal, tax, total)
  const calculateSummary = (items: InvoiceItemWithAmount[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = watchedTaxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;

    setSummary({
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    });
  };

  // Add a new item row
  const addItem = () => {
    const newItems = [
      ...items,
      { description: '', quantity: 1, unitPrice: 0, amount: 0 },
    ];

    setItems(newItems);
    form.setValue('items', newItems);
  };

  // Remove an item row
  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Invoice must have at least one item');
      return;
    }

    const newItems = [...items];
    newItems.splice(index, 1);

    setItems(newItems);
    form.setValue('items', newItems);
    calculateSummary(newItems);
  };

  // Handle form submission
  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      if (isEditing && initialData) {
        // Create a proper UpdateInvoiceDto from form data
        const updateDto: UpdateInvoiceDto = {
          id: initialData.id,
          issueDate: data.issueDate.toISOString(),
          dueDate: data.dueDate.toISOString(),
          status: data.status,
          taxRate: data.taxRate,
          notes: data.notes,
          items: data.items,
        };

        // Update existing invoice
        await updateInvoice(initialData.id, updateDto);
        toast.success('Invoice updated successfully');
        router.push(`/invoices/${initialData.id}`);
      } else {
        // Create a proper CreateInvoiceDto from form data
        const createDto: CreateInvoiceDto = {
          clientId: data.clientId,
          issueDate: data.issueDate.toISOString(),
          dueDate: data.dueDate.toISOString(),
          status: data.status,
          taxRate: data.taxRate,
          notes: data.notes,
          items: data.items,
        };

        // Create new invoice
        const newInvoice = await createInvoice(createDto);
        toast.success('Invoice created successfully');
        router.push(`/invoices/${newInvoice.id}`);
      }
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} invoice`);
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => router.push('/invoices')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {isEditing ? 'Edit Invoice' : 'Create Invoice'}
                </h1>
                <p className="text-muted-foreground">
                  {isEditing ? 'Update invoice details' : 'Add a new invoice to the system'}
                </p>
              </div>
            </div>
            <Button
              type="submit"
              disabled={invoiceLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Invoice' : 'Save Invoice'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client & Invoice Details</CardTitle>
                <CardDescription>
                  Select client and set invoice information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        disabled={clientsLoading || invoiceLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Issue Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={invoiceLoading}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={invoiceLoading}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          disabled={invoiceLoading}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SENT">Sent</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                            <SelectItem value="CANCELED">Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            {...field}
                            disabled={invoiceLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes or payment terms..."
                          className="resize-y min-h-[100px]"
                          {...field}
                          disabled={invoiceLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
                <CardDescription>
                  Review invoice totals and calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subtotal</p>
                    <p className="mt-1 text-lg font-semibold">${summary.subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tax ({watchedTaxRate || 0}%)
                    </p>
                    <p className="mt-1 text-lg font-semibold">${summary.taxAmount.toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="mt-1 text-2xl font-bold">${summary.total.toFixed(2)}</p>
                </div>
                <div className="rounded border p-4 mt-6 bg-muted/50">
                  <h4 className="text-sm font-semibold">Payment Status</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This invoice is currently set as <strong>{form.watch('status')}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>
                  Add products or services to this invoice
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={invoiceLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Description</TableHead>
                      <TableHead className="w-[15%]">Quantity</TableHead>
                      <TableHead className="w-[20%]">Unit Price</TableHead>
                      <TableHead className="w-[20%] text-right">Amount</TableHead>
                      <TableHead className="w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Item description"
                                    {...field}
                                    disabled={invoiceLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    step={1}
                                    {...field}
                                    disabled={invoiceLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    placeholder="0.00"
                                    {...field}
                                    disabled={invoiceLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            disabled={invoiceLoading || items.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? 's' : ''} in total
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/invoices')}
                  disabled={invoiceLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={invoiceLoading}
                >
                  {isEditing ? 'Update Invoice' : 'Create Invoice'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
