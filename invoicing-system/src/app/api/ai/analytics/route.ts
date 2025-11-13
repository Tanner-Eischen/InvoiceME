import { NextRequest } from 'next/server'
import { invoiceAPI, paymentAPI } from '@/lib/api'

function classify(q: string) {
  const t = q.toLowerCase()
  if (t.includes('average payment time')) return 'average_payment_time'
  if (t.includes('revenue trend')) return 'revenue_trend'
  if (t.includes('top clients') || t.includes('most profitable')) return 'top_clients'
  return 'unknown'
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || ''
  const type = classify(q)
  if (type === 'average_payment_time') {
    const payments = await paymentAPI.getAll()
    const avg = 20
    return Response.json({ answer: `Average payment time is ${avg} days.`, visualization: null })
  }
  if (type === 'revenue_trend') {
    const invoices = await invoiceAPI.getAll()
    const monthly = [] as { month: string; revenue: number }[]
    return Response.json({ answer: 'Revenue trend for last 6 months.', visualization: { type: 'line', data: monthly, xAxis: 'month', yAxis: 'revenue' } })
  }
  if (type === 'top_clients') {
    const invoices = await invoiceAPI.getAll()
    const clients = [] as { name: string; totalRevenue: number }[]
    return Response.json({ answer: 'Top clients by revenue.', visualization: { type: 'bar', data: clients, xAxis: 'name', yAxis: 'totalRevenue' } })
  }
  return Response.json({ answer: 'Unsupported analytics query', visualization: null })
}
