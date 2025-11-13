import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => {
  class AnthropicMock {
    messages = {
      create: vi.fn(async () => ({ id: 'msg', content: [{ type: 'text', text: 'ok' }] })),
      stream: vi.fn(() => ({ on: vi.fn(), toReadableStream: vi.fn() }))
    }
  }
  return { default: AnthropicMock }
})

const ORIGINAL = process.env.ANTHROPIC_API_KEY
process.env.ANTHROPIC_API_KEY = 'test-key'

import { sendChatMessage } from './anthropic-client'

describe('anthropic client', () => {
  it('creates a non-stream message', async () => {
    const res = await sendChatMessage([{ role: 'user', content: 'hi' }], 'sys')
    expect(res).toBeTruthy()
  })

  it('returns a stream when requested', async () => {
    const res = await sendChatMessage([{ role: 'user', content: 'hi' }], 'sys', { stream: true })
    expect(res).toBeTruthy()
  })
})

process.env.ANTHROPIC_API_KEY = ORIGINAL
