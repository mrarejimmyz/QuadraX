'use client'

import React from 'react'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  isProcessing: boolean
  enabled: boolean
  onSendMessage: () => void
}

export function ChatInput({ input, setInput, isProcessing, enabled, onSendMessage }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const getActionIcon = (action: string) => {
    const icons = {
      analyze: '📊',
      stake: '💰',
      move: '⚡',
      help: '❓'
    }
    return icons[action as keyof typeof icons] || '⚡'
  }

  return (
    <div className="p-4 border-t border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={enabled ? "Ask AI about strategy or moves..." : "Start a game to enable chat"}
            disabled={!enabled || isProcessing}
            className="w-full glass-thin border border-white/20 rounded-xl px-4 py-3 text-white 
                     placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 
                     focus:border-cyan-400/50 transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isProcessing && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onSendMessage}
          disabled={!enabled || !input.trim() || isProcessing}
          className="glass-thin border border-white/20 px-4 py-3 rounded-xl font-medium 
                   transition-all duration-200 focus:outline-none hover:scale-105 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                   text-white hover:bg-white/10"
        >
          {isProcessing ? (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Improved Quick Actions */}
      <div className="flex gap-2 mt-3 overflow-x-auto">
        {(['analyze', 'stake', 'move', 'help'] as const).map(action => (
          <button
            key={action}
            onClick={() => {
              setInput(action)
              setTimeout(onSendMessage, 10)
            }}
            disabled={!enabled || isProcessing}
            className="glass-ultra-thin border border-white/10 flex items-center gap-1.5 
                     text-xs px-3 py-1.5 rounded-lg transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     hover:scale-105 hover:bg-white/5 active:scale-95 text-white/80
                     hover:text-white whitespace-nowrap"
          >
            <span className="text-sm">{getActionIcon(action)}</span>
            <span className="capitalize font-medium">{action}</span>
          </button>
        ))}
      </div>
    </div>
  )
}