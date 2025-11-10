'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceForm } from '@/components/invoices/invoice-form';
import { useInvoiceViewModel } from '@/viewmodels/InvoiceViewModel';

export default function EditInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const { selectedInvoice, isLoading, error, fetchInvoiceById } = useInvoiceViewModel();

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceById(invoiceId);
    }
  }, [invoiceId, fetchInvoiceById]);

  if (isLoading) {
    return <div>Loading invoice...</div>;
  }

  if (error) {
    return <div>Error loading invoice: {error}</div>;
  }

  if (!selectedInvoice) {
    return <div>Invoice not found</div>;
  }

  return <InvoiceForm initialData={selectedInvoice} isEditing={true} />;
}
