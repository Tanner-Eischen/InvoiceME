"use client"
import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { inferPageFromPath } from '@/lib/ai/context-builder'

type Role = 'user' | 'assistant'
type Message = { role: Role; content: string; timestamp?: number }

export function useAIChatViewModel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  const sendMessage = async (content: string) => {
    if (!content.trim()) return
    setMessages(prev => [...prev, { role: 'user', content, timestamp: Date.now() }, { role: 'assistant', content: '', timestamp: Date.now() }])
    setIsLoading(true)
    controllerRef.current?.abort()
    controllerRef.current = new AbortController()
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    const context = { page: inferPageFromPath(path) }
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, conversationHistory: messages, context }),
      signal: controllerRef.current.signal
    })
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      setMessages(prev => {
        const copy = [...prev]
        const idx = copy.findIndex((m, i) => i === copy.length - 1 && m.role === 'assistant')
        if (idx >= 0) copy[idx] = { ...copy[idx], content: buf }
        return copy
      })
    }
    setIsLoading(false)
  }

  return { messages, isLoading, sendMessage }
}
