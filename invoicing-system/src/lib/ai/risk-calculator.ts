import { Invoice } from '@/models/Invoice'

export function calculateRiskScore(invoice: Invoice, history: { latePaymentRate: number; avgInvoiceAmount: number }) {
  let score = 0
  if (history.latePaymentRate > 0.5) score += 40
  else if (history.latePaymentRate > 0.25) score += 20
  const daysUntilDue = Math.floor((new Date(invoice.dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  if (daysUntilDue < 0) score += 30
  else if (daysUntilDue < 7) score += 15
  if (invoice.total > history.avgInvoiceAmount * 2) score += 20
  else if (invoice.total > history.avgInvoiceAmount * 1.5) score += 10
  return Math.min(score, 100)
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}
