import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftIcon,
  EditIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  FileTextIcon,
  ClipboardListIcon,
  BarChart2Icon,
  TrashIcon
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Client Details",
  description: "View client details",
};

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  // In a real app, this would be fetched from your API
  const client = {
    id: params.id,
    name: "Globex Corporation",
    status: "active",
    contactName: "Jane Doe",
    email: "jane@globex.com",
    phone: "(555) 987-6543",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94107",
    website: "https://www.globex.com",
    notes: "Important client with multiple ongoing projects. Always pays on time.",
    createdAt: "2023-01-15",
    invoiceStats: {
      count: 5,
      totalBilled: 8900,
      paid: 6500,
      outstanding: 2400,
      overdue: 1200,
    },
    recentInvoices: [
      {
        id: "INV-0002",
        date: "2023-10-28",
        dueDate: "2023-11-12",
        amount: 890.50,
        status: "pending",
      },
      {
        id: "INV-0012",
        date: "2023-09-15",
        dueDate: "2023-09-30",
        amount: 1500,
        status: "paid",
      },
      {
        id: "INV-0024",
        date: "2023-08-02",
        dueDate: "2023-08-17",
        amount: 2400,
        status: "overdue",
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300";
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
          <Link href="/clients">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">
            {client.name}
          </h2>
          <Badge
            variant="outline"
            className={`${getStatusColor(client.status)}`}
          >
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileTextIcon className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
          <Link href={`/clients/${params.id}/edit`}>
            <Button>
              <EditIcon className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Billed
                </CardTitle>
                <BarChart2Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(client.invoiceStats.totalBilled)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {client.invoiceStats.count} invoices
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Paid Invoices
                </CardTitle>
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(client.invoiceStats.paid)}
                </div>
                <p className="text-xs text-muted-foreground">
                  73% of total amount
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding
                </CardTitle>
                <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(client.invoiceStats.outstanding)}
                </div>
                <p className="text-xs text-muted-foreground">
                  27% of total amount
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue
                </CardTitle>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100/80">
                  {formatCurrency(client.invoiceStats.overdue)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(client.invoiceStats.overdue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  13% of total amount
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>
                  Basic information about {client.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[25px_1fr] items-start gap-2 text-sm">
                  <MailIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="font-medium">{client.email}</div>
                </div>
                <div className="grid grid-cols-[25px_1fr] items-start gap-2 text-sm">
                  <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="font-medium">{client.phone}</div>
                </div>
                <div className="grid grid-cols-[25px_1fr] items-start gap-2 text-sm">
                  <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="font-medium">{client.address}</div>
                </div>
                {client.website && (
                  <div className="grid grid-cols-[25px_1fr] items-start gap-2 text-sm">
                    <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h2.5m-7.955 0H17a2 2 0 002-2v-1a2 2 0 012-2h1.5" />
                    </svg>
                    <div className="font-medium">
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {client.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-[25px_1fr] items-start gap-2 text-sm">
                  <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="font-medium">
                    Client since {new Date(client.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Additional information about this client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {client.notes}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit Notes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                View and manage invoices for {client.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {client.recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between gap-4 rounded-xl border p-3"
                  >
                    <div>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {invoice.id}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(invoice.amount)}
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(invoice.status)}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {client.recentInvoices.length} of {client.invoiceStats.count} invoices
              </div>
              <Link href={`/invoices?clientId=${client.id}`}>
                <Button>View All Invoices</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                Recent activity and changes for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  Activity history will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:border-red-800">
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete Client
        </Button>
      </div>
    </div>
  );
}
