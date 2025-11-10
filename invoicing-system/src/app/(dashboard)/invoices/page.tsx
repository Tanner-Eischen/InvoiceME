'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  FileDown,
  Trash,
  CheckCircle2,
  Clock,
  Ban,
  Send,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';

import { useInvoiceViewModel } from '@/viewmodels/InvoiceViewModel';
import { Invoice, InvoiceStatus } from '@/models/Invoice';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, isLoading, error, fetchInvoices, updateInvoiceStatus, deleteInvoice } = useInvoiceViewModel();

  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof Invoice>('issueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadData = async () => {
      await fetchInvoices();
    };

    loadData();
  }, [fetchInvoices]);

  useEffect(() => {
    if (!invoices) return;

    let result = [...invoices];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(invoice =>
        invoice.number.toLowerCase().includes(query) ||
        invoice.clientName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter(invoice => invoice.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortField === 'issueDate' || sortField === 'dueDate' || sortField === 'createdAt' || sortField === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
      }

      // Handle number sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setFilteredInvoices(result);
  }, [invoices, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Invoice) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      toast.success(`Invoice status updated to ${newStatus.toLowerCase()}`);
    } catch (err) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoice(invoiceId);
        toast.success('Invoice deleted successfully');
      } catch (err) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleExportPdf = (invoiceId: string) => {
    toast.success('PDF generation is not implemented in this demo');
    // In a real app, we'd navigate to a PDF export URL or call an API
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch(status) {
      case 'PAID':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>;
      case 'SENT':
        return <Badge className="bg-blue-500">Sent</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge className="bg-yellow-500">Partially Paid</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-500">Overdue</Badge>;
      case 'CANCELED':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and track payments</p>
        </div>
        <Button onClick={() => router.push('/invoices/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            View and manage all your invoices in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 w-full md:w-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-destructive">Error loading invoices: {error}</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <p className="text-muted-foreground">No invoices found</p>
              <Button onClick={() => router.push('/invoices/create')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('number')}
                    >
                      Invoice Number
                      {sortField === 'number' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('clientName')}
                    >
                      Client
                      {sortField === 'clientName' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('issueDate')}
                    >
                      Issue Date
                      {sortField === 'issueDate' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('dueDate')}
                    >
                      Due Date
                      {sortField === 'dueDate' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('total')}
                    >
                      Amount
                      {sortField === 'total' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortField === 'status' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
                      )}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {invoice.number}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        ${invoice.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                              Edit invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(invoice.id, 'DRAFT')}
                              disabled={invoice.status === 'DRAFT'}
                            >
                              <Clock className="mr-2 h-4 w-4" /> Mark as Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(invoice.id, 'SENT')}
                              disabled={invoice.status === 'SENT'}
                            >
                              <Send className="mr-2 h-4 w-4" /> Mark as Sent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(invoice.id, 'PARTIALLY_PAID')}
                              disabled={invoice.status === 'PARTIALLY_PAID'}
                            >
                              <Circle className="mr-2 h-4 w-4" /> Mark as Partially Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(invoice.id, 'PAID')}
                              disabled={invoice.status === 'PAID'}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(invoice.id, 'OVERDUE')}
                              disabled={invoice.status === 'OVERDUE'}
                            >
                              <Clock className="mr-2 h-4 w-4" /> Mark as Overdue
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(invoice.id, 'CANCELED')}
                              disabled={invoice.status === 'CANCELED'}
                            >
                              <Ban className="mr-2 h-4 w-4" /> Mark as Canceled
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleExportPdf(invoice.id)}>
                              <FileDown className="mr-2 h-4 w-4" /> Export as PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
