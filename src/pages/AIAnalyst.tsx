import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../lib/utils'
import { SectionLabel, Card, Button } from '../components/ui'
import { BrainCircuit, Send, User, ShieldCheck } from 'lucide-react'
import { useAppSecurity } from '../context/SecurityContext'
import { api } from '../backend/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  citations?: Array<{
    entityType: string
    identifier: string
    metricLabel: string
    metricValue: string | number
  }>
}

const suggestedQuestions = [
  'Which orders are unprofitable, and what should I fix first?',
  'What is eating my margins this month?',
  'Which ad channels should I pause or scale?',
  'Which products have healthy margins and high volume?',
  'What is my profit at risk right now?',
  'How can I improve my contribution margin by 5 points?',
]

interface AIAnalystPageProps {
  onNavigate: (page: string) => void
}

export function AIAnalystPage({ onNavigate }: AIAnalystPageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { session } = useAppSecurity()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (text?: string) => {
    const q = text || input.trim()
    if (!q) return
    setInput('')

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: q, timestamp: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Call secure, grounded backend service
    setTimeout(() => {
      try {
        const result = api.queryAIAnalyst(session, q)
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.answer,
          timestamp: new Date().toLocaleTimeString(),
          citations: result.evidenceCitations,
        }
        setMessages(prev => [...prev, assistantMsg])
      } catch (err) {
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Security Alert: ${err instanceof Error ? err.message : 'Unable to complete query due to security guardrail.'}`,
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages(prev => [...prev, errorMsg])
      } finally {
        setIsTyping(false)
      }
    }, 600)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-oyster">
      <div className="px-6 py-5 border-b border-border bg-white flex-shrink-0">
        <div>
          <SectionLabel>Intelligence</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">AI Analyst</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Ask evidence-based questions about profitability, orders, and product performance.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty state — suggested questions */
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-deep-ink rounded-xl flex items-center justify-center mx-auto mb-3">
                <BrainCircuit size={20} className="text-electric-lime" />
              </div>
              <p className="text-sm font-semibold text-ink">Grounded analysis</p>
              <p className="text-xs text-ink-secondary mt-1 max-w-xs mx-auto">
                The analyst uses your profitability records, rules, alerts, and settings to answer questions with evidence.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left px-4 py-3 rounded-lg border border-border bg-white hover:border-sage/40 hover:bg-sage-surface transition-colors text-xs text-ink leading-relaxed"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-sage text-white' : 'bg-deep-ink'
                )}>
                  {msg.role === 'user'
                    ? <User size={12} className="text-white" />
                    : <BrainCircuit size={12} className="text-electric-lime" />
                  }
                </div>
                <div className={cn(
                  'max-w-[85%] rounded-xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-sage text-white text-xs'
                    : 'bg-white border border-border text-xs text-ink'
                )}>
                  {msg.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold mt-2 mb-1">{line.slice(2, -2)}</p>
                    }
                    if (line.startsWith('- ')) {
                      return <p key={i} className="pl-3 py-0.5 text-ink-secondary">{line}</p>
                    }
                    if (/^\d+\./.test(line)) {
                      return <p key={i} className="pl-3 py-0.5">{line}</p>
                    }
                    if (line.startsWith('*Note:')) {
                      return <p key={i} className="text-ink-secondary italic mt-2">{line.slice(1, -1)}</p>
                    }
                    return line ? <p key={i} className="py-0.5">{line}</p> : <br key={i} />
                  })}

                  {/* Render verified backend citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-border">
                      <div className="flex items-center gap-1.5 mb-2">
                        <ShieldCheck size={13} className="text-sage" />
                        <span className="text-[10px] font-mono font-bold tracking-wider text-sage uppercase">
                          Verified Grounded Evidence
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-oyster-100 border border-border text-[10px] font-mono text-ink"
                          >
                            <span className="font-bold text-sage">{c.identifier}</span>
                            <span className="text-ink-muted">·</span>
                            <span>{c.metricLabel}:</span>
                            <span className="font-semibold">{c.metricValue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-deep-ink flex items-center justify-center flex-shrink-0">
                  <BrainCircuit size={12} className="text-electric-lime" />
                </div>
                <div className="bg-white border border-border rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-border bg-white flex-shrink-0">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your profitability, orders, or margins…"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-electric-lime/50 focus:border-electric-lime/70 transition-colors min-h-[40px] max-h-32 leading-relaxed"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            variant="primary"
            size="sm"
            className="h-10 px-4 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </Button>
        </div>
        <p className="text-[10px] text-ink-secondary text-center mt-2 max-w-2xl mx-auto">
          Demo mode — responses are illustrative. Connect Shopify for live evidence-based analysis.
        </p>
      </div>
    </div>
  )
}
