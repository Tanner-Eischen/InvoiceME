import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export const metadata: Metadata = {
  title: "Create Invoice",
  description: "Create a new invoice",
};

export default function CreateInvoicePage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Create Invoice</h2>
        </div>
      </div>
      <div className="space-y-4">
        <InvoiceForm />
      </div>
    </div>
  );
}
