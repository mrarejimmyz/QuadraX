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
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      // Convert bullet points to proper list items
      .replace(/^• (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span class="text-blue-400 mt-0.5">•</span><span>$1</span></div>')
      // Convert numbered lists
      .replace(/^(\d+)\. (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span class="text-blue-400 font-medium">$1.</span><span>$2</span></div>')
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ backgroundColor: '#0f172a' }}>
      {messages.map(message => (
        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div 
            className={`max-w-[85%] rounded-xl shadow-lg backdrop-blur-sm ${
              message.sender === 'user' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500/30' 
                : message.sender === 'agent'
                ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-400/30 text-purple-50'
                : 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 text-gray-50 border border-gray-600/30'
            }`}
          >
            {message.agentName && (
              <div className="px-4 pt-3 pb-2 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-purple-200">{message.agentName}</span>
                  </div>
                  {message.confidence && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30">
                      {Math.round(message.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="p-4">
              <div 
                className="text-sm leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
              />
              <div className="text-xs opacity-70 mt-3 pt-2 border-t border-white/10">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      ))}
      {isProcessing && (
        <div className="flex justify-start">
          <div className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-sm text-gray-200 ml-2">AI processing...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}