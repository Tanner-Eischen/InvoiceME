import { type ParsedIntent } from './intent-parser'
import { clientAPI, invoiceAPI } from '@/lib/api'

async function resolveClient(name: string) {
  const results = await clientAPI.search(name)
  return results[0]
}

function calculateDueDate(d?: string) {
  if (!d) return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  return new Date(d).toISOString()
}

export async function executeAction(action: ParsedIntent) {
  switch (action.action) {
    case 'create':
      if (action.entity === 'invoice') {
        const client = await resolveClient(action.params?.clientName)
        if (!client) return { success: false, error: 'Client not found' }
        const created = await invoiceAPI.create({
          clientId: client.id,
          issueDate: new Date().toISOString(),
          dueDate: calculateDueDate(action.params?.dueDate),
          items: [{ description: action.params?.description || 'Services', quantity: 1, unitPrice: Number(action.params?.amount) || 0 }]
        })
        return { success: true, data: created }
      }
      return { success: false, error: 'Unsupported create entity' }
    case 'update':
      if (action.entity === 'invoice' && action.params?.id && action.params?.status) {
        const updated = await invoiceAPI.updateStatus(action.params.id, action.params.status)
        return { success: true, data: updated }
      }
      return { success: false, error: 'Unsupported update request' }
    case 'query':
      if (action.entity === 'invoice') {
        const list = await invoiceAPI.getAll()
        return { success: true, data: list }
      }
      if (action.entity === 'client') {
        const list = await clientAPI.getAll()
        return { success: true, data: list }
      }
      return { success: false, error: 'Unsupported query entity' }
    default:
      return { success: false, error: 'Unknown action' }
  }
}
