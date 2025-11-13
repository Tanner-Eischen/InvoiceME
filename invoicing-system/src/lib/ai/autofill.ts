import { clientAPI } from '@/lib/api'

async function fetchTaxRate(address?: string) {
  return { rate: 0, source: 'Default', jurisdiction: 'N/A' }
}

export async function autoFillInvoice(clientId: string) {
  const client = await clientAPI.getById(clientId)
  let taxInfo
  try {
    taxInfo = await fetchTaxRate((client as any).address)
  } catch {
    taxInfo = { rate: 0, source: 'Default', jurisdiction: 'N/A' }
  }
  const history = { avgPaymentDays: 30 }
  const suggestedTerms = history.avgPaymentDays > 30 ? 'NET-30' : 'NET-15'
  return {
    taxRate: taxInfo.rate,
    taxExplanation: `Using ${taxInfo.rate * 100}% tax from ${taxInfo.source} for ${taxInfo.jurisdiction}.`,
    paymentTerms: suggestedTerms,
    termsExplanation: `Suggesting ${suggestedTerms} based on average payment time of ${history.avgPaymentDays} days.`,
    clientDetails: client
  }
}
