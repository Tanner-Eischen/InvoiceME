import { NextRequest } from 'next/server'
import { sendChatMessage } from '@/lib/ai/ai-client'
import { buildSystemPrompt } from '@/lib/ai/context-builder'

export async function POST(req: NextRequest) {
  const { message, conversationHistory, context } = await req.json()
  const systemPrompt = buildSystemPrompt(context ?? { page: 'dashboard' })
  const stream = await sendChatMessage(
    [...(conversationHistory || []), { role: 'user', content: message }],
    systemPrompt,
    { stream: true }
  )
  const readable = typeof (stream as any).toReadableStream === 'function' ? (stream as any).toReadableStream() : (stream as any)
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  })
}
