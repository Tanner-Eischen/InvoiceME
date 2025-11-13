export type Page = 'dashboard' | 'invoice-list' | 'invoice-detail' | 'client-list' | 'client-detail'

export type ChatContext = {
  page: Page
  selectedInvoice?: { id: string; number?: string; status?: string; total?: number; clientName?: string }
  selectedClient?: { id: string; name?: string }
}

export function buildSystemPrompt(context: ChatContext) {
  let s = 'You are an AI assistant for an invoicing system.'
  s += `\nCURRENT CONTEXT:\n- User is viewing: ${context.page}`
  if (context.selectedInvoice) {
    const i = context.selectedInvoice
    s += `\n- Invoice: ${i.number ?? i.id}\n- Client: ${i.clientName ?? ''}\n- Status: ${i.status ?? ''}\n- Total: $${i.total ?? ''}`
  }
  if (context.selectedClient) {
    const c = context.selectedClient
    s += `\n- Client: ${c.name ?? c.id}`
  }
  s += `\n\nAVAILABLE ACTIONS:\n1. Query data\n2. Create invoice\n3. Update status\n\nIf user says "this invoice" or "this client", refer to the context above.`
  return s
}

export function inferPageFromPath(path: string): Page {
  if (path.includes('/(dashboard)/invoices/create')) return 'invoice-list'
  if (path.includes('/(dashboard)/invoices/')) return 'invoice-detail'
  if (path.includes('/(dashboard)/invoices')) return 'invoice-list'
  if (path.includes('/(dashboard)/clients/')) return 'client-detail'
  if (path.includes('/(dashboard)/clients')) return 'client-list'
  return 'dashboard'
}
