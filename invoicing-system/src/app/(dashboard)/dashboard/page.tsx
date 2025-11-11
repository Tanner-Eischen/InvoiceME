'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoiceViewModel } from '@/viewmodels/InvoiceViewModel';
import { useClientViewModel } from '@/viewmodels/ClientViewModel';
import { DollarSign, Users, FileText, Clock, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  TooltipProps,
  PieLabelRenderProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// COLORS for visualizations
const COLORS = {
  primary: '#5E38F4',
  secondary: '#9C38F4',
  success: '#2CB67D',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  accent1: '#8B5CF6',
  accent2: '#EC4899',
  accent3: '#06B6D4',
  gray: '#94A3B8'
};

const STATUS_COLORS: Record<string, string> = {
  PAID: COLORS.success,
  DRAFT: COLORS.gray,
  SENT: COLORS.info,
  OVERDUE: COLORS.danger,
  CANCELED: COLORS.warning
};

interface MonthlyRevenue {
  month: string;
  revenue: number;
  [key: string]: string | number; // Index signature for Recharts
}

interface StatusCount {
  name: string;
  value: number;
  [key: string]: string | number; // Index signature for Recharts
}

interface MonthRevenue {
  name: string;
  revenue: number;
  [key: string]: string | number; // Index signature for Recharts
}

interface ClientDistribution {
  name: string;
  value: number;
  [key: string]: string | number; // Index signature for Recharts
}

interface DashboardStats {
  totalInvoices: number;
  totalClients: number;
  totalPaid: number;
  totalOverdue: number;
  revenueByMonth: MonthlyRevenue[];
  invoicesByStatus: StatusCount[];
  recentMonthlyRevenue: MonthRevenue[];
  clientInvoiceDistribution: ClientDistribution[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { invoices, fetchInvoices, fetchOverdueInvoices, fetchInvoicesByStatus } = useInvoiceViewModel();
  const { clients, fetchClients } = useClientViewModel();

  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalClients: 0,
    totalPaid: 0,
    totalOverdue: 0,
    revenueByMonth: [],
    invoicesByStatus: [],
    recentMonthlyRevenue: [],
    clientInvoiceDistribution: []
  });

  // Load data only once on component mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      setIsLoading(true);

      try {
        await Promise.all([
          fetchInvoices(),
          fetchClients()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [fetchInvoices, fetchClients]);

  // Memoized function for calculating stats
  const calculateStats = useCallback(() => {
    if (!invoices || !clients || invoices.length === 0) return;

    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
    const partiallyPaidInvoices = invoices.filter(inv => inv.status === 'PARTIALLY_PAID');
    const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE');
    const totalAmount = paidInvoices.reduce((sum, inv) => sum + inv.total, 0) +
      partiallyPaidInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

    // Generate data for invoice status chart
    const statusCounts: Record<string, number> = {
      PAID: 0,
      DRAFT: 0,
      SENT: 0,
      PARTIALLY_PAID: 0,
      OVERDUE: 0,
      CANCELED: 0
    };

    invoices.forEach(inv => {
      statusCounts[inv.status]++;
    });

    const invoicesByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));

    // Generate monthly revenue data
    const monthlyRevenue: Record<string, number> = {};
    // Include revenue from fully paid invoices (total) and partially paid invoices (amountPaid)
    [...paidInvoices, ...partiallyPaidInvoices].forEach(inv => {
      const date = new Date(inv.issueDate);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthlyRevenue[monthYear]) {
        monthlyRevenue[monthYear] = 0;
      }
      const addAmount = inv.status === 'PAID' ? inv.total : (inv.amountPaid || 0);
      monthlyRevenue[monthYear] += addAmount;
    });

    const revenueByMonth = Object.entries(monthlyRevenue)
      .map(([monthYear, amount]) => ({
        month: monthYear,
        revenue: amount
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        return new Date(aYear, aMonth - 1).getTime() - new Date(bYear, bMonth - 1).getTime();
      });

    // Generate data for the area chart (last 6 months revenue)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const recentMonthlyRevenue: MonthRevenue[] = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[month.getMonth()];
      const monthYear = `${month.getMonth() + 1}/${month.getFullYear()}`;

      recentMonthlyRevenue.push({
        name: monthName,
        revenue: monthlyRevenue[monthYear] || 0
      });
    }

    // Generate client invoice distribution
    const clientInvoiceTotals: Record<string, number> = {};
    invoices.forEach(inv => {
      if (!clientInvoiceTotals[inv.clientName]) {
        clientInvoiceTotals[inv.clientName] = 0;
      }
      clientInvoiceTotals[inv.clientName] += inv.total;
    });

    const sortedClients = Object.entries(clientInvoiceTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Get top 5 clients

    const clientInvoiceDistribution: ClientDistribution[] = sortedClients.map(([name, total]) => ({
      name,
      value: total
    }));

    // If we have fewer than 5 clients, add "Others"
    if (sortedClients.length < Object.keys(clientInvoiceTotals).length) {
      const othersTotal = Object.entries(clientInvoiceTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(5)
        .reduce((sum, [_, value]) => sum + value, 0);

      if (othersTotal > 0) {
        clientInvoiceDistribution.push({
          name: 'Others',
          value: othersTotal
        });
      }
    }

    setStats({
      totalInvoices: invoices.length,
      totalClients: clients.length,
      totalPaid: totalAmount,
      totalOverdue: overdueInvoices.length,
      revenueByMonth,
      invoicesByStatus,
      recentMonthlyRevenue,
      clientInvoiceDistribution
    });
  }, [invoices, clients]);

  // Update stats when invoices or clients data changes
  useEffect(() => {
    if (invoices && clients) {
      calculateStats();
    }
  }, [invoices, clients, calculateStats]);

  // Memoized pie chart custom label function to prevent unnecessary re-renders
  const renderCustomizedPieLabel = useCallback((props: PieLabelRenderProps) => {
    const { name, percent } = props;
    if (name === undefined || percent === undefined || percent === null) return '';
    const percentValue = Number(percent);
    // Hide labels for zero or very small slices to avoid misleading text
    if (isNaN(percentValue) || percentValue <= 0.02) return '';
    return `${name}: ${(percentValue * 100).toFixed(0)}%`;
  }, []);

  // Custom formatter for currency values
  const currencyFormatter = useCallback((value: number) => {
    return [`$${value.toFixed(2)}`, 'Revenue'];
  }, []);

  // Format for count values
  const countFormatter = useCallback((value: number) => {
    return [value, 'Count'];
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your invoicing system</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : `$${stats.totalPaid.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              From paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : stats.totalClients}
            </div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : stats.totalInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              All invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : stats.totalOverdue}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={stats.recentMonthlyRevenue}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={currencyFormatter}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS.primary}
                        fill={COLORS.primary}
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Invoice Status</CardTitle>
                  <CardDescription>Distribution by status</CardDescription>
                </div>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.invoicesByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedPieLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.invoicesByStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.name] || COLORS.gray}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={countFormatter}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Latest invoices in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading invoices...</p>
                ) : invoices.length === 0 ? (
                  <p>No invoices found.</p>
                ) : (
                  <div className="space-y-2">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${invoice.total.toFixed(2)}</p>
                          <p className={`text-xs ${
                            invoice.status === 'PAID' ? 'text-green-500' :
                            invoice.status === 'OVERDUE' ? 'text-red-500' :
                            'text-amber-500'
                          }`}>
                            {invoice.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/invoices')}>
                  View All Invoices
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>
                  By invoice total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading clients...</p>
                ) : stats.clientInvoiceDistribution.length === 0 ? (
                  <p>No data available.</p>
                ) : (
                  <div className="space-y-4">
                    {stats.clientInvoiceDistribution.slice(0, 5).map((client, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 space-y-1">
                          <p className="font-medium truncate max-w-[150px]">{client.name}</p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{
                                width: `${(client.value / stats.clientInvoiceDistribution[0].value) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                        <p className="font-medium ml-2">${client.value.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/clients')}>
                  View All Clients
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Month</CardTitle>
                <CardDescription>Historical monthly revenue</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p>Loading chart data...</p>
                  </div>
                ) : stats.revenueByMonth.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p>No revenue data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsBarChart
                      data={stats.revenueByMonth}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={currencyFormatter}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill={COLORS.primary} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Revenue Distribution</CardTitle>
                <CardDescription>Revenue by client</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p>Loading chart data...</p>
                  </div>
                ) : stats.clientInvoiceDistribution.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p>No client revenue data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={stats.clientInvoiceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.clientInvoiceDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[COLORS.primary, COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.success, COLORS.info][index % 6]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={currencyFormatter}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Clients</CardTitle>
                <CardDescription>
                  Latest clients added
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading clients...</p>
                ) : clients.length === 0 ? (
                  <p>No clients found.</p>
                ) : (
                  <div className="space-y-2">
                    {clients.slice(0, 8).map((client) => (
                      <div key={client.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {client.phone || 'No phone'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/clients')}>
                  View All Clients
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
