export type ParsedIntent = {
  action: 'query' | 'create' | 'update' | 'delete' | 'report' | 'none'
  entity?: 'invoice' | 'client' | 'payment'
  params?: Record<string, any>
  confidence: number
}

function detectEntity(text: string): ParsedIntent['entity'] | undefined {
  if (text.includes('invoice')) return 'invoice'
  if (text.includes('client')) return 'client'
  if (text.includes('payment')) return 'payment'
  return undefined
}

export function parseIntent(aiResponse: string): ParsedIntent {
  const jsonMatch = aiResponse.match(/\{[\s\S]*"action"[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        action: parsed.action,
        entity: parsed.entity,
        params: parsed.params || parsed,
        confidence: 0.9
      }
    } catch {}
  }
  const lower = aiResponse.toLowerCase()
  if (lower.includes('create') || lower.includes('new invoice')) {
    return { action: 'create', entity: 'invoice', confidence: 0.7 }
  }
  if (lower.includes('mark') && lower.includes('paid')) {
    return { action: 'update', entity: 'invoice', params: { status: 'PAID' }, confidence: 0.7 }
  }
  if (lower.includes('show') || lower.includes('list')) {
    return { action: 'query', entity: detectEntity(lower), confidence: 0.6 }
  }
  return { action: 'none', confidence: 0 }
}
