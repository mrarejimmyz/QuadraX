'use client'

import React, { useRef, useEffect } from 'react'
import { Message } from '../types/chat.types'

interface MessageListProps {
  messages: Message[]
  isProcessing: boolean
}

export function MessageList({ messages, isProcessing }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatMessageText = (text: string) => {
    return text
      // Convert **bold** to proper styling
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-cyan-300">$1</strong>')
      // Convert bullet points to proper list items
      .replace(/^• (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span class="text-cyan-400 mt-0.5 text-xs">•</span><span class="text-white/90">$1</span></div>')
      // Convert numbered lists
      .replace(/^(\d+)\. (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span class="text-cyan-400 font-medium text-sm">$1.</span><span class="text-white/90">$2</span></div>')
      // Add line breaks for better readability
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/20">
      {messages.map(message => (
        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div 
            className={`max-w-[88%] rounded-2xl shadow-lg ${
              message.sender === 'user' 
                ? 'glass-thin border border-cyan-400/30 text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20' 
                : message.sender === 'agent'
                ? 'glass border border-purple-400/30 text-white bg-gradient-to-r from-purple-500/15 to-pink-500/15'
                : 'glass-thin border border-white/20 text-white bg-gradient-to-r from-gray-600/20 to-gray-700/20'
            }`}
          >
            {message.agentName && (
              <div className="px-4 pt-3 pb-2 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                    <span className="text-sm font-semibold text-white">{message.agentName}</span>
                  </div>
                  {message.confidence && (
                    <span className="text-xs glass-ultra-thin px-2 py-1 rounded-full border border-yellow-400/30 text-yellow-300">
                      {Math.round(message.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="p-4">
              <div 
                className="text-sm leading-relaxed space-y-2 text-white"
                dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
              />
              <div className="text-xs text-white/50 mt-3 pt-2 border-t border-white/20">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      ))}
      {isProcessing && (
        <div className="flex justify-start">
          <div className="glass-thin border border-white/20 text-white p-3 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-sm text-white/90 ml-2 font-medium">AI thinking...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}