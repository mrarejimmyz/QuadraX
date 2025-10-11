'use client'

import { useState } from 'react'
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
  
  // Use the actual wallet hooks
  const { isConnected } = useWallet()
  const { pyusd } = useBalances()
  const contractHook = useContract()

  const handleStake = async () => {
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
  }

  return (
    <div className={`glass rounded-xl p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4">Stake PYUSD</h3>

      {/* Balance */}
      <div className="mb-4 p-3 bg-white/10 rounded-lg">
        <div className="text-sm text-white/70 mb-1">Your Balance</div>
        <div className="text-lg font-semibold">
          {pyusd.isLoading ? 'Loading...' : `${pyusd.formatted} PYUSD`}
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
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600
                     font-semibold btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Staking...' : 'Stake & Join Game'}
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
