import { invoiceAPI } from '@/lib/api'
import { calculateRiskScore, getRiskLevel } from '@/lib/ai/risk-calculator'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const invoiceId = url.pathname.split('/').pop() as string
  const invoice = await invoiceAPI.getById(invoiceId)
  const history = { latePaymentRate: 0.2, avgInvoiceAmount: 500 }
  const score = calculateRiskScore(invoice, history)
  const riskLevel = getRiskLevel(score)
  return Response.json({ invoiceId, riskLevel, score })
}
