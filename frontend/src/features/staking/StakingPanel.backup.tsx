'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useWallet } from '@/lib/hooks/useWallet'
import { useBalances } from '@/lib/hooks/useBalances'
import { useContract } from '@/lib/hooks/useContract'

interface StakingPanelProps {
  onStakeComplete?: (amount: string) => void
  className?: string
}

export default function StakingPanel({
  onStakeComplete,
  className = ''
}: StakingPanelProps) {
  const [amount, setAmount] = useState('1')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Use the actual wallet hooks - these must be called unconditionally
  const walletState = useWallet()
  const balancesState = useBalances()
  const contractHook = useContract()
  
  // Handle hydration properly to prevent setState during render warnings
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Safely extract values without causing hydration issues
  const isConnected = mounted ? (walletState?.isConnected ?? false) : false
  const isWrongNetwork = mounted ? (walletState?.isWrongNetwork ?? false) : false
  const chainId = mounted ? (walletState?.chainId ?? 0) : 0
  
  const pyusd = mounted ? (balancesState?.pyusd ?? {
    formatted: '0',
    isLoading: false,
    error: null,
    raw: BigInt(0),
    decimals: 6,
    symbol: 'PYUSD'
  }) : {
    formatted: '0',
    isLoading: true,
    error: null,
    raw: BigInt(0),
    decimals: 6,
    symbol: 'PYUSD'
  }
  
  // Memoize the switch function to prevent re-renders
  const switchToSepolia = useCallback(async () => {
    if (walletState?.switchToSepolia) {
      await walletState.switchToSepolia()
    }
  }, [walletState?.switchToSepolia])
  
  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className={`glass rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-10 bg-white/20 rounded"></div>
        </div>
      </div>
    )
  }
  
  // Early return if there are critical errors
  if (pyusd?.error) {
    return (
      <div className={`glass rounded-xl p-6 ${className}`}>
        <h3 className="text-xl font-bold mb-4">Stake PYUSD</h3>
        <div className="text-center py-4 text-red-400">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="font-semibold mb-2">Unable to load PYUSD balance</p>
          <p className="text-sm text-white/70 mb-2">{pyusd.error}</p>
          {pyusd.error.includes('contract not deployed') ? (
            <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
              <p className="text-yellow-200 text-sm">
                🚧 PYUSD staking will be available after contract deployment
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/70">Please refresh and try again</p>
          )}
        </div>
      </div>
    )
  }

  const handleStake = useCallback(async () => {
    if (parseFloat(amount) >= 1 && isConnected) {
      setLoading(true)
      try {
        // TODO: Implement actual staking logic with contracts
        console.log('Staking:', amount, 'PYUSD')
        onStakeComplete?.(amount)
      } catch (error) {
        console.error('Staking failed:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [amount, isConnected, onStakeComplete])

  return (
    <div className={`glass rounded-xl p-6 hover:shadow-2xl transition-all duration-300 ${className}`}>
      {/* Animated Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center animate-pulse">
          💰
        </div>
        <div>
          <h3 className="text-xl font-bold">Stake PYUSD</h3>
          <p className="text-sm text-white/60">🏆 Hackathon: PayPal + Hedera Integration</p>
        </div>
      </div>

      {/* Network Switch Warning */}
      {isConnected && isWrongNetwork && (
        <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/40 rounded-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">🔄</div>
            <p className="font-semibold text-orange-200 mb-2">Switch to Sepolia Network</p>
            <p className="text-sm text-orange-200/80 mb-3">
              PYUSD is available on Sepolia testnet (Chain ID: 11155111). 
              You're currently on Chain ID: {chainId}
            </p>
            <button
              onClick={switchToSepolia}
              className="px-6 py-3 rounded-lg btn-gold btn-hover font-bold text-black
                       shadow-lg transform transition-all duration-300 hover:scale-105
                       animate-pulse"
            >
              🚀 Switch to Sepolia Now!
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Balance Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-white/70 mb-1 flex items-center gap-2">
              <span>💰</span> Your Balance
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              {pyusd.isLoading ? (
                <div className="animate-pulse flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/30 rounded-full animate-bounce"></div>
                  Loading...
                </div>
              ) : (
                `${pyusd.formatted} PYUSD`
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/50">Sepolia Testnet</div>
            <div className="text-xs text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Real PYUSD Contract
            </div>
          </div>
        </div>
      </div>

      {/* Stake Input */}
      {isConnected ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/70 mb-2 block">
              Stake Amount (min 1 PYUSD)
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                       focus:border-white/40 focus:outline-none text-white
                       placeholder:text-white/50"
              placeholder="Enter amount"
            />
          </div>

          <button
            onClick={handleStake}
            disabled={loading || parseFloat(amount) < 1}
            className="w-full py-4 px-6 rounded-xl btn-primary btn-hover btn-pulse
                     text-lg font-bold uppercase tracking-wider shadow-2xl
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     disabled:shadow-none disabled:animate-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                💰 Staking PYUSD...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🎮 Stake & Join Game! 🚀
              </span>
            )}
          </button>

          <p className="text-xs text-white/60 text-center">
            Your stake will be locked until the game ends
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-blue-400 text-4xl mb-2">🔗</div>
          <p className="font-semibold">Connect Wallet to Stake</p>
          <p className="text-sm text-white/70 mt-2">
            Connect your wallet to participate in staking
          </p>
        </div>
      )}
    </div>
  )
}
