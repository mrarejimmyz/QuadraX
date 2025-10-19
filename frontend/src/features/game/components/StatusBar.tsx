'use client'

import React, { useState, useEffect } from 'react'
import { ASIStatus, ChatMode } from '../types/chat.types'
import { useChainId, useBlockNumber } from 'wagmi'
import { useWallet } from '../../../lib/hooks/useWallet'
import { useBalances } from '../../../lib/hooks/useBalances'

interface StatusBarProps {
  activeMode: ChatMode
  setActiveMode: (mode: ChatMode) => void
  asiStatus: ASIStatus
  agents: any[]
}

export function StatusBar({ activeMode, setActiveMode, asiStatus, agents }: StatusBarProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const chainId = useChainId()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const wallet = useWallet()
  const balances = useBalances()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getModeIcon = (mode: string) => {
    const icons = {
      chat: '💬',
      analysis: '📊', 
      negotiation: '🤝',
      strategy: '⚡'
    }
    return icons[mode as keyof typeof icons] || '💬'
  }

  return (
    <>
      {/* Improved Mode Selector */}
      <div className="px-4 py-3 border-b border-white/10 bg-black/30">
        <div className="flex gap-2 overflow-x-auto">
          {(['chat', 'analysis', 'negotiation', 'strategy'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl 
                        transition-all duration-200 whitespace-nowrap ${
                activeMode === mode 
                  ? 'glass-thin text-white shadow-lg border border-cyan-400/30 bg-cyan-400/10' 
                  : 'glass-ultra-thin text-white/70 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
            >
              <span className="text-sm">{getModeIcon(mode)}</span>
              <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simplified Status Bar */}
      <div className="border-b border-white/10 bg-black/20">
        <div 
          className="px-4 py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-white/5 transition-all duration-200"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
              <span className="text-white/80 font-medium">
                {chainId === 11155111 ? 'Sepolia' : chainId === 296 ? 'Hedera' : 'Network'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full shadow-lg ${
                isClient && wallet.isConnected 
                  ? 'bg-green-400 shadow-green-400/50' 
                  : 'bg-yellow-400 shadow-yellow-400/50'
              }`}></div>
              {isClient && wallet.isConnected ? (
                <span className="text-green-400 font-medium">
                  {balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted).toFixed(2) : '0.00'} PYUSD
                </span>
              ) : (
                <span className="text-yellow-400 font-medium">Wallet</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full shadow-lg ${
                asiStatus.connected 
                  ? 'bg-green-400 shadow-green-400/50' 
                  : 'bg-red-400 shadow-red-400/50'
              }`}></div>
              <span className={`font-medium ${asiStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                AI
              </span>
            </div>
          </div>
          <button className="flex items-center gap-1 text-white/60 hover:text-white transition-colors">
            <span className="text-xs">Info</span>
            <svg className={`w-3 h-3 transform transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Compact Technical Details */}
        {showTechnicalDetails && (
          <div className="px-4 py-3 text-xs border-t border-white/10 bg-black/20">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="text-white/60">Block:</span>
                <span className="text-white/90">#{blockNumber?.toString().slice(-6) || 'Syncing'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Latency:</span>
                <span className="text-white/90">{asiStatus.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Model:</span>
                <span className="text-white/90">{asiStatus.modelVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Agents:</span>
                <span className="text-white/90">{agents.length}/4</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}