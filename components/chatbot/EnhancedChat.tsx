'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { detectIntent, generateIntentContext, getSuggestedDataFetches, DetectedIntent } from '@/lib/intent-detector'
import DataPanel from '@/components/chatbot/DataPanel'
import { Send, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function EnhancedChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentIntent, setCurrentIntent] = useState<DetectedIntent | null>(null)
  const [panelData, setPanelData] = useState<Record<string, unknown> | undefined>()
  const [panelLoading, setPanelLoading] = useState(false)
  const [showPanel, setShowPanel] = useState(false) // Control when to show panel
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Handle input change - detect intent for display only
   * DO NOT fetch data while typing - only after Enter is pressed
   */
  const handleInputChange = (value: string) => {
    setInput(value)

    // Only detect intent for showing the intent indicator
    // Don't fetch any data until the message is actually sent
    if (value.length > 5) {
      const intent = detectIntent(value)
      setCurrentIntent(intent)
    } else {
      setCurrentIntent(null)
    }
  }

  /**
   * Fetch data for the right panel based on intent
   */
  const fetchPanelData = async (intent: DetectedIntent) => {
    // Don't fetch if it's a general query
    if (intent.type === 'general' || (!intent.tokens && !intent.wallets)) {
      setPanelLoading(false)
      return
    }

    setPanelLoading(true)
    try {
      const fetches = getSuggestedDataFetches(intent)

      if (fetches.length > 0) {
        // Fetch the first relevant data
        const fetch1 = fetches[0]
        const url = new URL(fetch1.endpoint, window.location.origin)
        Object.entries(fetch1.params).forEach(([key, value]) => {
          url.searchParams.append(key, value)
        })

        const response = await fetch(url)
        if (!response.ok) {
          console.error(`API error: ${response.status} for ${url}`)
          setPanelData(undefined)
          setPanelLoading(false)
          return
        }

        const data = await response.json()
        setPanelData(data)
      } else {
        // No data endpoints available for this intent
        setPanelData(undefined)
      }
    } catch (error) {
      console.error('Error fetching panel data:', error)
      setPanelData(undefined)
    } finally {
      setPanelLoading(false)
    }
  }

  /**
   * Send message to AI
   */
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Save current panel data and intent before clearing input
    const savedPanelData = panelData
    const savedIntent = currentIntent

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setShowPanel(false) // Hide panel initially
    setPanelLoading(true) // Keep panel in loading state

    // Fetch panel data based on the current intent
    if (savedIntent && savedIntent.type !== 'general' && (savedIntent.tokens || savedIntent.wallets)) {
      fetchPanelData(savedIntent)
    }

    try {
      // Generate intent context for AI
      const intentContext = savedIntent ? generateIntentContext(savedIntent) : ''

      // Call Claude API with Jupiter data context
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: 'default',
          userId: 'user_1',
          contextData: {
            intent: savedIntent,
            intentContext,
            jupiterData: savedPanelData, // Include fetched Jupiter data for Claude context
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.response || 'Unable to generate response',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // After chat response is ready, show the panel data
      // Add a small delay to make it feel more natural
      setTimeout(() => {
        setCurrentIntent(savedIntent)
        setShowPanel(true) // Now show the panel
        setPanelLoading(false)
      }, 500)

    } catch (error) {
      console.error('Error sending message:', error)

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
      setPanelData(undefined)
      setCurrentIntent(null)
      setShowPanel(false)
      setPanelLoading(false)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle suggested prompt click
   */
  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    handleInputChange(prompt)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full max-h-full">
      {/* Chat Interface - Left Side (Full width or ~60% on desktop) */}
      <div className={`flex flex-col bg-white rounded-lg border overflow-hidden min-h-0 ${messages.length > 0 ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Solana Alpha AI</h2>
                <p className="text-neutral-600">Ask about tokens, wallets, or market trends</p>
              </div>

              {/* Suggested Prompts */}
              <div className="w-full max-w-md space-y-2 mt-6">
                <p className="text-xs text-neutral-500 uppercase font-semibold px-4">
                  💡 Try asking:
                </p>
                <SuggestedPrompt
                  text="What's the price of SOL?"
                  onClick={() => handleSuggestedPrompt("What's the price of SOL?")}
                />
                <SuggestedPrompt
                  text="Show me smart money buying this week"
                  onClick={() =>
                    handleSuggestedPrompt('Show me smart money buying this week')
                  }
                />
                <SuggestedPrompt
                  text="Compare USDC vs USDT"
                  onClick={() => handleSuggestedPrompt('Compare USDC vs USDT')}
                />
                <SuggestedPrompt
                  text="Is PUMP token safe?"
                  onClick={() => handleSuggestedPrompt('Is PUMP token safe?')}
                />
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm text-neutral-500">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask about tokens, wallets, or market trends..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              size="sm"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Intent Indicator - Only show when typing before sending */}
          {messages.length === 0 && currentIntent && currentIntent.type !== 'general' && (
            <div className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded">
              <span className="font-semibold">Intent detected:</span> {currentIntent.type}
              {currentIntent.tokens && ` • ${currentIntent.tokens.join(', ')}`}
              {currentIntent.wallets && ` • ${currentIntent.wallets[0].slice(0, 10)}...`}
            </div>
          )}
        </div>
      </div>

      {/* Data Panel - Right Side (2/4) - Only show after first message */}
      {messages.length > 0 && (
        <div className="hidden lg:col-span-2 lg:flex flex-col bg-white rounded-lg border overflow-hidden">
          <DataPanel intent={showPanel ? currentIntent : null} data={showPanel ? panelData : undefined} loading={panelLoading} />
        </div>
      )}

      {/* Mobile Data Panel - Only show after first message */}
      {messages.length > 0 && (
        <div className="lg:hidden col-span-1 flex flex-col bg-white rounded-lg border overflow-hidden">
          <DataPanel intent={showPanel ? currentIntent : null} data={showPanel ? panelData : undefined} loading={panelLoading} />
        </div>
      )}
    </div>
  )
}

function SuggestedPrompt({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 rounded-lg border border-neutral-200 hover:border-blue-400 hover:bg-blue-50 text-left transition text-sm"
    >
      {text}
    </button>
  )
}
