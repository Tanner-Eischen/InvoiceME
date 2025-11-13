"use client"
import { useState, useRef, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAIChatViewModel } from '@/viewmodels/AIChatViewModel'
import { ContextIndicator } from '@/components/ai-assistant/ContextIndicator'

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, isLoading, sendMessage } = useAIChatViewModel()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button aria-label="Open chat" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" onClick={() => setIsOpen(true)}>
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:w-[480px] w-full p-0 duration-300">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
            </div>
            <ContextIndicator />
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground">Welcome. Ask about invoices, clients, and payments.</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={m.role === 'user' ? 'bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[80%]' : 'bg-muted px-3 py-2 rounded-lg max-w-[80%]'}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="p-4 border-t flex items-center gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message" onKeyDown={e => { if (e.key === 'Enter') { sendMessage(input); setInput('') } }} />
              <Button onClick={() => { sendMessage(input); setInput('') }} disabled={isLoading || !input.trim()}>Send</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
