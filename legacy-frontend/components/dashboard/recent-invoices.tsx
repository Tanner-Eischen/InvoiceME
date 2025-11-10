import React from "react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

type Invoice = {
  id: string;
  client: {
    name: string;
  };
  amount: number;
  status: "paid" | "pending" | "overdue";
  date: string;
};

export function RecentInvoices() {
  // Mock data, in a real app this would come from your API
  const recentInvoices: Invoice[] = [
    {
      id: "INV-0001",
      client: { name: "Acme Inc" },
      amount: 1250.00,
      status: "paid",
      date: "2023-11-01",
    },
    {
      id: "INV-0002",
      client: { name: "Globex Corporation" },
      amount: 890.50,
      status: "pending",
      date: "2023-10-28",
    },
    {
      id: "INV-0003",
      client: { name: "Wayne Enterprises" },
      amount: 2400.00,
      status: "paid",
      date: "2023-10-25",
    },
    {
      id: "INV-0004",
      client: { name: "Stark Industries" },
      amount: 1750.75,
      status: "overdue",
      date: "2023-10-20",
    },
    {
      id: "INV-0005",
      client: { name: "Umbrella Corporation" },
      amount: 950.25,
      status: "pending",
      date: "2023-10-18",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {recentInvoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center justify-between gap-4 rounded-xl border p-3"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(invoice.client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="font-medium">{invoice.client.name}</div>
              <div className="text-xs text-muted-foreground">
                {invoice.id}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatCurrency(invoice.amount)}</div>
            <div className="flex items-center justify-end gap-1 text-xs">
              <span className={`rounded-full px-2 py-0.5 ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </span>
              <span className="text-muted-foreground">
                {formatDateShort(invoice.date)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
