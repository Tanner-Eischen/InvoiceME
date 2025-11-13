"use client"
import { useEffect, useState } from 'react'
import { inferPageFromPath, type ChatContext } from '@/lib/ai/context-builder'
import { usePathname } from 'next/navigation'

export function ContextIndicator() {
  const path = usePathname()
  const [context, setContext] = useState<ChatContext>({ page: 'dashboard' })
  useEffect(() => {
    const page = inferPageFromPath(path)
    const parts = path.split('/')
    let selectedInvoice
    let selectedClient
    if (page === 'invoice-detail') {
      const id = parts.find((p, i) => parts[i - 1] === 'invoices') || ''
      selectedInvoice = { id }
    }
    if (page === 'client-detail') {
      const id = parts.find((p, i) => parts[i - 1] === 'clients') || ''
      selectedClient = { id }
    }
    setContext({ page, selectedInvoice, selectedClient })
  }, [path])
  return (
    <div className="px-4 py-2 text-xs text-muted-foreground border-b">
      <span>Context: {context.page}</span>
      {context.selectedInvoice?.id && <span className="ml-2">Invoice {context.selectedInvoice.id}</span>}
      {context.selectedClient?.id && <span className="ml-2">Client {context.selectedClient.id}</span>}
    </div>
  )
}
