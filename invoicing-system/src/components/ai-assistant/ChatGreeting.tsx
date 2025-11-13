"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Summary = { newPayments: number; overdueInvoices: number; actionItems: number }

export function ChatGreeting() {
  const [message, setMessage] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/ai/greeting')
      const data = await res.json()
      setMessage(data.message)
      setSummary(data.summary)
    }
    load()
  }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>{message || 'Loading...'}</CardDescription>
      </CardHeader>
      {summary && (
        <CardContent>
          <div className="flex gap-6">
            <div>
              <div className="text-sm text-muted-foreground">New Payments</div>
              <div className="text-xl font-semibold">{summary.newPayments}</div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <div className="text-sm text-muted-foreground">Overdue Invoices</div>
              <div className="text-xl font-semibold">{summary.overdueInvoices}</div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <div className="text-sm text-muted-foreground">Action Items</div>
              <div className="text-xl font-semibold">{summary.actionItems}</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
