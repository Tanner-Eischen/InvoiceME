import Anthropic from '@anthropic-ai/sdk'

type SendOptions = { stream?: boolean; maxTokens?: number; model?: string }

export async function sendChatMessage(
  messages: any[],
  systemPrompt: string,
  options?: SendOptions
) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing')
  const anthropic = new Anthropic({ apiKey })
  const config = {
    model: options?.model || 'claude-3-5-sonnet-20241022',
    max_tokens: options?.maxTokens ?? 2000,
    system: systemPrompt,
    messages
  }

  try {
    if (options?.stream) return anthropic.messages.stream(config)
    return await anthropic.messages.create(config)
  } catch (e) {
    const err = e as Error
    throw new Error(`Anthropic error: ${err.message}`)
  }
}
