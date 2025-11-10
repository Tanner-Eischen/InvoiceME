import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export const metadata: Metadata = {
  title: "Edit Invoice",
  description: "Edit an existing invoice",
};

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  // In a real app, this would be fetched from your API
  const defaultValues = {
    id: params.id,
    clientId: "client-1",
    issueDate: new Date("2023-10-28"),
    dueDate: new Date("2023-11-12"),
    status: "pending",
    items: [
      {
        description: "Website Development",
        quantity: 1,
        unitPrice: 750,
      },
      {
        description: "Domain Registration (1 year)",
        quantity: 1,
        unitPrice: 15,
      },
      {
        description: "Hosting Setup",
        quantity: 5,
        unitPrice: 25.1,
      },
    ],
    notes:
      "Payment due within 15 days. Please include the invoice number in your payment reference.",
    terms: "Net 15",
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/invoices/${params.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">
            Edit Invoice {params.id}
          </h2>
        </div>
      </div>
      <div className="space-y-4">
        <InvoiceForm defaultValues={defaultValues} />
      </div>
    </div>
  );
}
