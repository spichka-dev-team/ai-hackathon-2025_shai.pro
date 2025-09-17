import { useEffect, useMemo, useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export const OptionOne = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const canSend = useMemo(() => input.trim().length > 0, [input])

  const handleSend = () => {
    if (!canSend) return
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
  }

  return (
    <div className="flex h-full w-full items-stretch justify-center">
      <div className="flex h-[calc(100vh-48px)] w-full max-w-4xl flex-col">
        <div
          ref={scrollRef}
          className={messages.length === 0
            ? 'flex-1 flex items-center justify-center overflow-auto px-6 py-8'
            : 'flex-1 overflow-auto px-6 py-8'}
        >
          {messages.length === 0 ? (
            <div className="flex w-full max-w-3xl flex-col items-center gap-6">
              <div className="text-center text-lg font-medium text-gray-700">
                Чем могу помочь?
              </div>
              <div className="w-full">
                <div className="relative mx-auto w-full rounded-2xl bg-white/60 p-3 shadow">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Спросите что-нибудь"
                    className="h-14 resize-none border-none shadow-none focus-visible:ring-0 bg-transparent px-4 py-3 text-base"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white disabled:opacity-40"
                    aria-label="Send"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id} className="flex w-full">
                  <div className={m.role === 'user' ? 'ml-auto' : ''}>
                    <div className={
                      m.role === 'user'
                        ? 'rounded-2xl bg-gray-900 px-4 py-3 text-white'
                        : 'rounded-2xl bg-white/70 px-4 py-3 text-gray-900 shadow'
                    }>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="px-6 pb-8">
            <div className="relative mx-auto w-full max-w-3xl rounded-2xl bg-white/60 p-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Спросите что-нибудь"
                className="h-14 resize-none border-none shadow-none focus-visible:ring-0 bg-transparent px-4 py-3 text-base"
              />
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white disabled:opacity-40"
                aria-label="Send"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


