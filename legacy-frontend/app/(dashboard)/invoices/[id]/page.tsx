import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeftIcon,
  DownloadIcon,
  EditIcon,
  MailIcon,
  PrinterIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Invoice Details",
  description: "View invoice details",
};

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  // In a real app, this would be fetched from your API
  const invoice = {
    id: params.id,
    number: params.id,
    status: "pending",
    date: "2023-10-28",
    dueDate: "2023-11-12",
    amount: 890.5,
    tax: 89.05,
    total: 979.55,
    client: {
      name: "Globex Corporation",
      email: "accounts@globex.com",
      address: "123 Business Ave, Suite 100, San Francisco, CA 94107",
      phone: "(555) 123-4567",
    },
    items: [
      {
        id: "1",
        description: "Website Development",
        quantity: 1,
        unitPrice: 750,
        amount: 750,
      },
      {
        id: "2",
        description: "Domain Registration (1 year)",
        quantity: 1,
        unitPrice: 15,
        amount: 15,
      },
      {
        id: "3",
        description: "Hosting Setup",
        quantity: 5,
        unitPrice: 25.1,
        amount: 125.5,
      },
    ],
    notes:
      "Payment due within 15 days. Please include the invoice number in your payment reference.",
    paymentTerms: "Net 15",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">
            Invoice {invoice.number}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${getStatusColor(invoice.status)}`}
          >
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
          <Button variant="outline" size="sm">
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <MailIcon className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Link href={`/invoices/${params.id}/edit`}>
            <Button>
              <EditIcon className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-2xl">Invoice</CardTitle>
              <CardDescription>#{invoice.number}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">Your Company Name</div>
              <div className="text-sm text-muted-foreground">
                123 Your Street, City
                <br />
                State, ZIP
                <br />
                contact@yourcompany.com
                <br />
                (555) 987-6543
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Bill To:
              </div>
              <div className="font-medium">{invoice.client.name}</div>
              <div className="text-sm">{invoice.client.address}</div>
              <div className="text-sm">{invoice.client.email}</div>
              <div className="text-sm">{invoice.client.phone}</div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Invoice Date:
                </span>
                <span>{formatDate(invoice.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Due Date:
                </span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Payment Terms:
                </span>
                <span>{invoice.paymentTerms}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-3 text-left font-medium text-sm w-1/2">
                    Description
                  </th>
                  <th className="p-3 text-center font-medium text-sm">
                    Quantity
                  </th>
                  <th className="p-3 text-right font-medium text-sm">
                    Unit Price
                  </th>
                  <th className="p-3 text-right font-medium text-sm">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-b">
                  <td colSpan={3} className="p-3 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(invoice.amount)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td colSpan={3} className="p-3 text-right font-medium">
                    Tax (10%):
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(invoice.tax)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-3 text-right font-bold">
                    Total:
                  </td>
                  <td className="p-3 text-right font-bold">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div>
            <div className="font-medium mb-1">Notes:</div>
            <div className="text-sm text-muted-foreground">
              {invoice.notes}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Thank you for your business!
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
