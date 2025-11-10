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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3Icon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  LineChartIcon,
  DownloadIcon,
  PieChartIcon,
  UsersIcon,
  ArrowDownUpIcon
} from "lucide-react";
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker";

export const metadata: Metadata = {
  title: "Reports",
  description: "Generate financial reports and analytics",
};

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker />
        </div>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="revenue">
            <LineChartIcon className="mr-2 h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="clients">
            <UsersIcon className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="tax">
            <ArrowDownUpIcon className="mr-2 h-4 w-4" />
            Tax
          </TabsTrigger>
          <TabsTrigger value="profit">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Profit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <LineChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue This Year
                </CardTitle>
                <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$320,532.12</div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last year
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Invoice
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,893.50</div>
                <p className="text-xs text-muted-foreground">
                  -4.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Time to Get Paid
                </CardTitle>
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12 days</div>
                <p className="text-xs text-muted-foreground">
                  -2 days from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Monthly revenue for the current year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-950 rounded flex items-center justify-center">
                <p className="text-muted-foreground">Revenue chart coming soon</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                Showing data from January to December 2023
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Invoice Analysis</CardTitle>
              <CardDescription>
                Breakdown of invoices by status and time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-950 rounded flex items-center justify-center">
                <p className="text-muted-foreground">Invoice analysis charts coming soon</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                Showing data for the selected date range
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Client Reports</CardTitle>
              <CardDescription>
                Analysis of client activity and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-950 rounded flex items-center justify-center">
                <p className="text-muted-foreground">Client reports coming soon</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                Top clients by revenue and activity
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>
                Tax collection and payment reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-950 rounded flex items-center justify-center">
                <p className="text-muted-foreground">Tax reports coming soon</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                Quarterly and annual tax information
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download Tax Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Profit & Loss</CardTitle>
              <CardDescription>
                Profit and loss statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-950 rounded flex items-center justify-center">
                <p className="text-muted-foreground">P&L reports coming soon</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                Financial statements and analysis
              </div>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download P&L Statement
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
