'use client'

import { useState } from 'react'

interface StakingPanelProps {
  onStake: (amount: string) => void
  isStaked?: boolean
  balance?: string
  loading?: boolean
}

export default function StakingPanel({
  onStake,
  isStaked = false,
  balance = '0',
  loading = false
}: StakingPanelProps) {
  const [amount, setAmount] = useState('1')

  const handleStake = () => {
    if (parseFloat(amount) >= 1) {
      onStake(amount)
    }
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">Stake PYUSD</h3>

      {/* Balance */}
      <div className="mb-4 p-3 bg-white/10 rounded-lg">
        <div className="text-sm text-white/70 mb-1">Your Balance</div>
        <div className="text-lg font-semibold">{balance} PYUSD</div>
      </div>

      {/* Stake Input */}
      {!isStaked ? (
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
          <div className="text-green-400 text-4xl mb-2">✓</div>
          <p className="font-semibold">Staked Successfully!</p>
          <p className="text-sm text-white/70 mt-2">
            Waiting for opponent to stake...
          </p>
        </div>
      )}
    </div>
  )
}
