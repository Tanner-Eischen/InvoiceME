"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const notificationsSchema = z.object({
  emailNotifications: z.object({
    invoiceCreated: z.boolean().default(true),
    paymentReceived: z.boolean().default(true),
    invoiceOverdue: z.boolean().default(true),
    clientCreated: z.boolean().default(false),
    weeklyDigest: z.boolean().default(true),
  }),
  appNotifications: z.object({
    invoiceCreated: z.boolean().default(true),
    paymentReceived: z.boolean().default(true),
    invoiceOverdue: z.boolean().default(true),
    clientCreated: z.boolean().default(true),
    weeklyDigest: z.boolean().default(false),
  }),
});

type NotificationsFormValues = z.infer<typeof notificationsSchema>;

export function NotificationsForm() {
  // Default values for your notification settings
  const defaultValues: Partial<NotificationsFormValues> = {
    emailNotifications: {
      invoiceCreated: true,
      paymentReceived: true,
      invoiceOverdue: true,
      clientCreated: false,
      weeklyDigest: true,
    },
    appNotifications: {
      invoiceCreated: true,
      paymentReceived: true,
      invoiceOverdue: true,
      clientCreated: true,
      weeklyDigest: false,
    },
  };

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues,
  });

  function onSubmit(data: NotificationsFormValues) {
    // In a real app, submit to your API here
    console.log(data);
    toast.success("Notification settings updated");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="font-medium mb-3">Email Notifications</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="emailNotifications.invoiceCreated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Invoice Created</FormLabel>
                    <FormDescription>
                      Receive an email when a new invoice is created.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailNotifications.paymentReceived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Payment Received</FormLabel>
                    <FormDescription>
                      Receive an email when a payment is received.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailNotifications.invoiceOverdue"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Invoice Overdue</FormLabel>
                    <FormDescription>
                      Receive an email when an invoice is overdue.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailNotifications.clientCreated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>New Client</FormLabel>
                    <FormDescription>
                      Receive an email when a new client is created.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailNotifications.weeklyDigest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Weekly Digest</FormLabel>
                    <FormDescription>
                      Receive a weekly digest summarizing your account activity.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-3">In-App Notifications</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="appNotifications.invoiceCreated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Invoice Created</FormLabel>
                    <FormDescription>
                      Receive a notification when a new invoice is created.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appNotifications.paymentReceived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Payment Received</FormLabel>
                    <FormDescription>
                      Receive a notification when a payment is received.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appNotifications.invoiceOverdue"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Invoice Overdue</FormLabel>
                    <FormDescription>
                      Receive a notification when an invoice is overdue.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appNotifications.clientCreated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>New Client</FormLabel>
                    <FormDescription>
                      Receive a notification when a new client is created.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appNotifications.weeklyDigest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Weekly Digest</FormLabel>
                    <FormDescription>
                      Receive a weekly digest notification summarizing your account activity.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
