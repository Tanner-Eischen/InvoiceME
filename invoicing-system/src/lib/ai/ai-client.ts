import Anthropic from '@anthropic-ai/sdk'

type SendOptions = { stream?: boolean; maxTokens?: number; model?: string }

function toOpenRouter(messages: any[], systemPrompt: string) {
  const out = [] as { role: 'system' | 'user' | 'assistant'; content: string }[]
  out.push({ role: 'system', content: systemPrompt })
  for (const m of messages) {
    const role = m.role as 'user' | 'assistant'
    const content = typeof m.content === 'string' ? m.content : (m.content as any[]).map(x => x.text || '').join('')
    out.push({ role, content })
  }
  return out
}

export async function sendChatMessage(messages: any[], systemPrompt: string, options?: SendOptions) {
  const openRouterKey = process.env.OPENROUTER_API_KEY
  if (openRouterKey) {
    const model = options?.model || 'anthropic/claude-3.5-sonnet'
    const body = {
      model,
      messages: toOpenRouter(messages, systemPrompt),
      stream: !!options?.stream,
      max_tokens: options?.maxTokens ?? 2000
    }
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`
      },
      body: JSON.stringify(body)
    })
    if (options?.stream) {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      return new ReadableStream({
        async pull(controller) {
          const { value, done } = await reader.read()
          if (done) { controller.close(); return }
          const chunk = decoder.decode(value, { stream: true })
          const parts = chunk.split('\n\n')
          for (const p of parts) {
            const line = p.trim()
            if (!line.startsWith('data:')) continue
            const json = line.slice(5).trim()
            if (json === '[DONE]') continue
            try {
              const obj = JSON.parse(json)
              const delta = obj.choices?.[0]?.delta?.content || obj.choices?.[0]?.message?.content || ''
              if (delta) controller.enqueue(new TextEncoder().encode(delta))
            } catch {}
          }
        }
      })
    }
    const json = await res.json()
    return json
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('AI provider key missing')
  const anthropic = new Anthropic({ apiKey })
  const config = {
    model: options?.model || 'claude-3-5-sonnet-20241022',
    max_tokens: options?.maxTokens ?? 2000,
    system: systemPrompt,
    messages
  }
  if (options?.stream) return anthropic.messages.stream(config)
  return anthropic.messages.create(config)
}
