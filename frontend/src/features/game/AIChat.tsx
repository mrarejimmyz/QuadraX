'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: number
  sender: 'ai' | 'user'
  text: string
  timestamp: Date
}

interface AIChatProps {
  aiName?: string
  enabled?: boolean
}

export default function AIChat({ aiName = 'AI Agent', enabled = true }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm ready to play. How about we make this interesting with a 2 PYUSD stake?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (input.trim() && enabled) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'user',
        text: input,
        timestamp: new Date()
      }
      setMessages([...messages, newMessage])
      setInput('')

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          sender: 'ai',
          text: "Interesting move! I'm analyzing the board... Let's see how this plays out.",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
    }
  }

  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col h-[400px]">
      {/* Header */}
      <div className="bg-white/10 px-4 py-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold">{aiName}</h3>
          {!enabled && <span className="text-xs text-white/50">(Offline)</span>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-500/30 ml-auto'
                  : 'bg-white/10'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs text-white/50 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={!enabled}
            placeholder={enabled ? "Chat with AI..." : "AI offline"}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20
                     focus:border-white/40 focus:outline-none text-white text-sm
                     placeholder:text-white/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!enabled || !input.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600
                     font-semibold text-sm btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
