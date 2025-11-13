import { NextRequest } from 'next/server'
import { invoiceAPI, clientAPI } from '@/lib/api'

export async function GET(req: NextRequest) {
  const suggestions = [] as any[]
  const invoices = await invoiceAPI.getAll()
  const overdue = invoices.filter(i => i.status === 'OVERDUE').slice(0, 3)
  for (const inv of overdue) {
    suggestions.push({ type: 'follow_up', title: `Invoice #${inv.number} is overdue`, action: { type: 'draft_reminder', invoiceId: inv.id } })
  }
  const clients = await clientAPI.getAll()
  const stale = clients.slice(0, 2)
  for (const c of stale) {
    suggestions.push({ type: 'invoice_opportunity', title: `${c.name} may need a new invoice`, action: { type: 'create_invoice', clientId: c.id } })
  }
  return Response.json({ suggestions })
}
