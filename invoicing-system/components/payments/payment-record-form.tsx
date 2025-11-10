"use client";

import { useForm, ControllerRenderProps, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePaymentViewModel } from "@/viewmodels/PaymentViewModel";
import { Payment, PaymentMethod } from "@/models/Payment";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = {
  invoiceId: string;
  remainingBalance: number;
  onSuccess: (payment: Payment) => void;
  onCancel: () => void;
};

const paymentSchema = z.object({
  amount: z
    .coerce.number()
    .positive("Amount must be greater than 0"),
  method: z.nativeEnum(PaymentMethod),
  receivedAt: z.string().optional(),
  reference: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentRecordForm({ invoiceId, remainingBalance, onSuccess, onCancel }: Props) {
  const { createPayment } = usePaymentViewModel();

  const form = useForm<PaymentFormValues, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues, unknown, PaymentFormValues>,
    defaultValues: {
      amount: Number(remainingBalance.toFixed(2)) || 0,
      method: PaymentMethod.CASH,
      receivedAt: new Date().toISOString(),
      reference: "",
    },
  });

  const onSubmit = async (values: PaymentFormValues) => {
    const payment = await createPayment({
      invoiceId,
      amount: values.amount,
      method: values.method,
      receivedAt: values.receivedAt,
      reference: values.reference,
    });

    if (payment) {
      onSuccess(payment);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }: { field: ControllerRenderProps<PaymentFormValues, "amount"> }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="method"
          render={({ field }: { field: ControllerRenderProps<PaymentFormValues, "method"> }) => (
            <FormItem>
              <FormLabel>Method</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                    <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                    <SelectItem value={PaymentMethod.CHECK}>Check</SelectItem>
                    <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receivedAt"
          render={({ field }: { field: ControllerRenderProps<PaymentFormValues, "receivedAt"> }) => (
            <FormItem>
              <FormLabel>Received At</FormLabel>
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
          render={({ field }: { field: ControllerRenderProps<PaymentFormValues, "reference"> }) => (
            <FormItem>
              <FormLabel>Reference</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Optional reference" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Payment</Button>
        </div>
      </form>
    </Form>
  );
}