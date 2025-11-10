import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon, FilterIcon, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { DataTable } from "@/components/clients/data-table";
import { ClientColumns } from "@/components/clients/columns";

export const metadata: Metadata = {
  title: "Clients",
  description: "Manage your clients",
};

export default function ClientsPage() {
  // In a real app, these would come from an API call
  const clients = [
    {
      id: "client-1",
      name: "Acme Inc",
      contactName: "John Smith",
      email: "john@acme.com",
      phone: "(555) 123-4567",
      status: "active",
      invoiceCount: 8,
      totalBilled: 12500,
    },
    {
      id: "client-2",
      name: "Globex Corporation",
      contactName: "Jane Doe",
      email: "jane@globex.com",
      phone: "(555) 987-6543",
      status: "active",
      invoiceCount: 5,
      totalBilled: 8900,
    },
    {
      id: "client-3",
      name: "Wayne Enterprises",
      contactName: "Bruce Wayne",
      email: "bruce@wayne.com",
      phone: "(555) 456-7890",
      status: "active",
      invoiceCount: 12,
      totalBilled: 24000,
    },
    {
      id: "client-4",
      name: "Stark Industries",
      contactName: "Tony Stark",
      email: "tony@stark.com",
      phone: "(555) 111-2222",
      status: "inactive",
      invoiceCount: 7,
      totalBilled: 17500,
    },
    {
      id: "client-5",
      name: "Umbrella Corporation",
      contactName: "Albert Wesker",
      email: "wesker@umbrella.com",
      phone: "(555) 333-4444",
      status: "active",
      invoiceCount: 4,
      totalBilled: 9500,
    },
    {
      id: "client-6",
      name: "Cyberdyne Systems",
      contactName: "Miles Dyson",
      email: "miles@cyberdyne.com",
      phone: "(555) 555-6666",
      status: "active",
      invoiceCount: 6,
      totalBilled: 18500,
    },
    {
      id: "client-7",
      name: "Oscorp Industries",
      contactName: "Norman Osborn",
      email: "norman@oscorp.com",
      phone: "(555) 777-8888",
      status: "inactive",
      invoiceCount: 3,
      totalBilled: 12000,
    },
    {
      id: "client-8",
      name: "LexCorp",
      contactName: "Lex Luthor",
      email: "lex@lexcorp.com",
      phone: "(555) 999-0000",
      status: "active",
      invoiceCount: 9,
      totalBilled: 27500,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <Link href="/clients/create">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Client
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
            Name
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <DataTable data={clients} columns={ClientColumns} />
      </div>
    </div>
  );
}
