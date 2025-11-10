import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon, FilterIcon, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { DataTable } from "@/components/invoices/data-table";
import { InvoiceColumns } from "@/components/invoices/columns";

export const metadata: Metadata = {
  title: "Invoices",
  description: "Manage your invoices",
};

export default function InvoicesPage() {
  // In a real app, these would come from an API call using server components
  // or client-side data fetching
  const invoices = [
    {
      id: "INV-0001",
      clientName: "Acme Inc",
      amount: 1250.00,
      status: "paid",
      date: "2023-11-01",
      dueDate: "2023-11-15",
    },
    {
      id: "INV-0002",
      clientName: "Globex Corporation",
      amount: 890.50,
      status: "pending",
      date: "2023-10-28",
      dueDate: "2023-11-12",
    },
    {
      id: "INV-0003",
      clientName: "Wayne Enterprises",
      amount: 2400.00,
      status: "paid",
      date: "2023-10-25",
      dueDate: "2023-11-08",
    },
    {
      id: "INV-0004",
      clientName: "Stark Industries",
      amount: 1750.75,
      status: "overdue",
      date: "2023-10-20",
      dueDate: "2023-11-03",
    },
    {
      id: "INV-0005",
      clientName: "Umbrella Corporation",
      amount: 950.25,
      status: "pending",
      date: "2023-10-18",
      dueDate: "2023-11-01",
    },
    {
      id: "INV-0006",
      clientName: "Cyberdyne Systems",
      amount: 1850.50,
      status: "paid",
      date: "2023-10-15",
      dueDate: "2023-10-30",
    },
    {
      id: "INV-0007",
      clientName: "Oscorp Industries",
      amount: 1200.00,
      status: "overdue",
      date: "2023-10-10",
      dueDate: "2023-10-24",
    },
    {
      id: "INV-0008",
      clientName: "LexCorp",
      amount: 2750.25,
      status: "paid",
      date: "2023-10-05",
      dueDate: "2023-10-19",
    },
    {
      id: "INV-0009",
      clientName: "Massive Dynamic",
      amount: 1500.75,
      status: "pending",
      date: "2023-10-01",
      dueDate: "2023-10-15",
    },
    {
      id: "INV-0010",
      clientName: "Soylent Corp",
      amount: 3200.00,
      status: "paid",
      date: "2023-09-28",
      dueDate: "2023-10-12",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <Link href="/invoices/create">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Status
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Date
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <DataTable data={invoices} columns={InvoiceColumns} />
      </div>
    </div>
  );
}
