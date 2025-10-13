'use client'

import React from 'react'

interface StakeConfirmationProps {
  agreedStake: number
  player1Address: string
  player2Address: string
  onConfirm: () => void
  onCancel: () => void
  isProcessing: boolean
  stage: 'confirming' | 'approving' | 'staking' | 'complete'
}

export function StakeConfirmation({
  agreedStake,
  player1Address,
  player2Address,
  onConfirm,
  onCancel,
  isProcessing,
  stage
}: StakeConfirmationProps) {
  const getStageMessage = () => {
    switch (stage) {
      case 'confirming':
        return 'Review and confirm stake';
      case 'approving':
        return 'Approving PYUSD spending...';
      case 'staking':
        return 'Locking stake in contract...';
      case 'complete':
        return 'Stake locked! Game ready to start.';
      default:
        return '';
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'confirming':
        return '📋';
      case 'approving':
        return '⏳';
      case 'staking':
        return '🔒';
      case 'complete':
        return '✅';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
      <div 
        className="rounded-xl border border-gray-700 p-6 max-w-md w-full mx-4 shadow-2xl"
        style={{ backgroundColor: '#111827' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{getStageIcon()}</span>
          <div>
            <h2 className="text-xl font-bold text-white">Stake Confirmation</h2>
            <p className="text-sm text-gray-400">{getStageMessage()}</p>
          </div>
        </div>

        {/* Stake Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-sm text-blue-200 mb-1">Agreed Stake Amount</div>
            <div className="text-3xl font-bold text-white">{agreedStake} PYUSD</div>
            <div className="text-xs text-blue-300 mt-1">
              Total Pot: {agreedStake * 2} PYUSD (after both players stake)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Player 1</div>
              <div className="text-sm font-mono text-white truncate">
                {player1Address.substring(0, 6)}...{player1Address.substring(player1Address.length - 4)}
              </div>
              <div className="text-xs text-green-400 mt-1">You</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Player 2</div>
              <div className="text-sm font-mono text-white truncate">
                {player2Address.substring(0, 6)}...{player2Address.substring(player2Address.length - 4)}
              </div>
              <div className="text-xs text-purple-400 mt-1">AI/Opponent</div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between text-gray-300">
              <span>Your stake:</span>
              <span>{agreedStake} PYUSD</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Opponent stake:</span>
              <span>{agreedStake} PYUSD</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Total pot:</span>
              <span>{agreedStake * 2} PYUSD</span>
            </div>
            <div className="flex justify-between text-gray-400 border-t border-gray-700 pt-1">
              <span>Platform fee (0.25%):</span>
              <span>~{((agreedStake * 2) * 0.0025).toFixed(4)} PYUSD</span>
            </div>
            <div className="flex justify-between text-green-400 font-medium border-t border-gray-700 pt-1">
              <span>Winner receives:</span>
              <span>~{((agreedStake * 2) * 0.9975).toFixed(2)} PYUSD</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        {stage !== 'confirming' && (
          <div className="mb-6 flex items-center justify-between text-xs">
            <div className={`flex-1 text-center ${stage === 'approving' || stage === 'staking' || stage === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
              {stage === 'approving' || stage === 'staking' || stage === 'complete' ? '✓' : '1'} Approve
            </div>
            <div className="flex-1 border-t border-gray-600"></div>
            <div className={`flex-1 text-center ${stage === 'staking' || stage === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
              {stage === 'staking' || stage === 'complete' ? '✓' : '2'} Lock Stake
            </div>
            <div className="flex-1 border-t border-gray-600"></div>
            <div className={`flex-1 text-center ${stage === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
              {stage === 'complete' ? '✓' : '3'} Complete
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {stage === 'confirming' ? (
            <>
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors font-medium shadow-lg shadow-blue-600/30"
              >
                Confirm & Lock Stake
              </button>
            </>
          ) : stage === 'complete' ? (
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium"
            >
              Start Game
            </button>
          ) : (
            <div className="w-full px-4 py-3 bg-gray-700 text-gray-300 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Processing transaction...</span>
              </div>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="mt-4 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <strong>⚠️ Important:</strong> Once confirmed, your {agreedStake} PYUSD will be locked in the smart contract. You can only withdraw if you win the game or if the game ends in a tie.
        </div>
      </div>
    </div>
  );
}
