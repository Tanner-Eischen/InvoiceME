import { invoiceAPI, paymentAPI } from '@/lib/api'
import { sendChatMessage } from '@/lib/ai/ai-client'

export async function GET(req: Request) {
  const [invoices, payments] = await Promise.all([
    invoiceAPI.getAll(),
    paymentAPI.getAll()
  ])
  const overdue = invoices.filter(i => i.status === 'OVERDUE')
  const recent = payments.filter(p => {
    const d = new Date(p.receivedAt ?? 0).getTime()
    return Date.now() - d < 7 * 24 * 60 * 60 * 1000
  })
  const greetingRes = await sendChatMessage(
    [{ role: 'user', content: `Generate a concise dashboard greeting. Recent payments: ${recent.length}. Overdue invoices: ${overdue.length}.` }],
    'You write friendly business greetings.'
  )
  const text = (greetingRes as any).content?.[0]?.text ?? 'Welcome back.'
  return Response.json({
    message: text,
    summary: {
      newPayments: recent.length,
      overdueInvoices: overdue.length,
      actionItems: overdue.length
    }
  })
}
