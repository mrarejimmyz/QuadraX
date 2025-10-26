// Hedera Escrow Status Component
// Shows escrow contract status and deposit progress

'use client'

import { useHederaEscrow } from '@/hooks/useHederaEscrow'
import { useAccount } from 'wagmi'
import { useState } from 'react'

interface HederaEscrowStatusProps {
  escrowId: string
  stakeAmount: number
  player1Address?: string
  player2Address?: string
  onBothDeposited?: () => void
}

export function HederaEscrowStatus({
  escrowId,
  stakeAmount,
  player1Address,
  player2Address,
  onBothDeposited
}: HederaEscrowStatusProps) {
  const { address } = useAccount()
  const { status, loading, depositStake } = useHederaEscrow(escrowId)
  const [depositing, setDepositing] = useState(false)

  const handleDeposit = async () => {
    if (!address) {
      alert('Please connect your wallet')
      return
    }

    setDepositing(true)
    try {
      await depositStake(address, stakeAmount)
      alert('Stake deposited successfully!')
      
      if (onBothDeposited && status?.player1Deposited && status?.player2Deposited) {
        onBothDeposited()
      }
    } catch (error: any) {
      alert(`Deposit failed: ${error.message}`)
    } finally {
      setDepositing(false)
    }
  }

  if (loading && !status) {
    return (
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="text-gray-300">Loading escrow status...</span>
        </div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  const isPlayer1 = address?.toLowerCase() === player1Address?.toLowerCase()
  const isPlayer2 = address?.toLowerCase() === player2Address?.toLowerCase()
  const currentPlayerDeposited = isPlayer1 ? status.player1Deposited : status.player2Deposited
  const bothDeposited = status.player1Deposited && status.player2Deposited

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Hedera Escrow</h3>
          <p className="text-sm text-gray-400">Contract: {escrowId}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-semibold">Active</span>
        </div>
      </div>

      {/* Stake Amount */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-white">{stakeAmount}</span>
          <span className="text-gray-400">PYUSD per player</span>
        </div>
        <div className="text-sm text-purple-400">
          Total pot: {stakeAmount * 2} PYUSD
        </div>
      </div>

      {/* Deposit Status */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status.player1Deposited ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
            }`}>
              {status.player1Deposited ? '✓' : '1'}
            </div>
            <div>
              <div className="text-white font-medium">Player 1</div>
              <div className="text-xs text-gray-400 truncate max-w-[120px]">
                {player1Address || 'Loading...'}
              </div>
            </div>
          </div>
          <div className={`text-sm font-semibold ${
            status.player1Deposited ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {status.player1Deposited ? 'Deposited' : 'Pending'}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status.player2Deposited ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
            }`}>
              {status.player2Deposited ? '✓' : '2'}
            </div>
            <div>
              <div className="text-white font-medium">Player 2 (AI)</div>
              <div className="text-xs text-gray-400 truncate max-w-[120px]">
                {player2Address || 'AI Opponent'}
              </div>
            </div>
          </div>
          <div className={`text-sm font-semibold ${
            status.player2Deposited ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {status.player2Deposited ? 'Deposited' : 'Pending'}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {!bothDeposited && (
        <div>
          {!currentPlayerDeposited && (isPlayer1 || isPlayer2) ? (
            <button
              onClick={handleDeposit}
              disabled={depositing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {depositing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Depositing...
                </span>
              ) : (
                `💰 Deposit ${stakeAmount} PYUSD`
              )}
            </button>
          ) : (
            <div className="text-center py-3 px-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <div className="text-yellow-400 font-semibold mb-1">
                ⏳ Waiting for opponent
              </div>
              <div className="text-sm text-gray-400">
                {currentPlayerDeposited ? 'You have deposited. Waiting for AI...' : 'Waiting for deposits...'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Both Deposited */}
      {bothDeposited && (
        <div className="text-center py-4 px-4 bg-green-500/10 rounded-xl border border-green-500/30">
          <div className="text-green-400 font-bold text-lg mb-1">
            ✅ Both Players Deposited!
          </div>
          <div className="text-sm text-gray-300">
            Escrow secured with {status.totalDeposited} PYUSD
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Winner will receive full payout automatically
          </div>
        </div>
      )}

      {/* Winner Declared */}
      {status.winner && (
        <div className="mt-4 text-center py-4 px-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-yellow-400 font-bold mb-1">
            {status.winner === 'TIE' ? 'Game Tied!' : 'Winner Declared!'}
          </div>
          <div className="text-sm text-gray-300">
            {status.fundsReleased 
              ? status.winner === 'TIE' 
                ? 'Stakes refunded to both players'
                : 'Funds released to winner'
              : 'Processing payout...'
            }
          </div>
        </div>
      )}
    </div>
  )
}
