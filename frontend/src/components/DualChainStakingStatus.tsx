/**
 * Unified Dual-Chain Staking Status
 * Shows both Sepolia PYUSD and Hedera escrow state in real-time
 */

'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useDualChainStaking } from '@/hooks/useDualChainStaking';
import { useHederaEscrow } from '@/hooks/useHederaEscrow';

interface DualChainStatusProps {
  gameId: string;
  escrowId: string;
  stakeAmount: string;
  player1: string;
  player2: string;
}

export function DualChainStakingStatus({
  gameId,
  escrowId,
  stakeAmount,
  player1,
  player2,
}: DualChainStatusProps) {
  const { address } = useAccount();
  const { 
    depositStake, 
    claimWinnings, 
    progress, 
    isDepositing,
    isPaying,
    error,
    bothDeposited,
  } = useDualChainStaking(gameId, escrowId);
  
  const { status: hederaStatus, loading: hederaLoading } = useHederaEscrow(escrowId);

  const isPlayer1 = address?.toLowerCase() === player1.toLowerCase();
  const isPlayer2 = address?.toLowerCase() === player2.toLowerCase();
  const playerDeposited = isPlayer1 
    ? hederaStatus?.player1Deposited 
    : hederaStatus?.player2Deposited;

  const handleDeposit = () => {
    depositStake(stakeAmount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Dual-Chain Staking</h2>
        <p className="text-gray-400">
          PYUSD on Sepolia + Escrow on Hedera
        </p>
      </div>

      {/* Chain Status Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sepolia Status */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="text-2xl">⛓️</span>
              Sepolia (PYUSD)
            </h3>
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
              Primary
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Game ID:</span>
              <code className="text-blue-400">{gameId.slice(0, 8)}...</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stake Amount:</span>
              <span className="font-mono">{stakeAmount} PYUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-green-400">Sepolia Testnet</span>
            </div>
          </div>

          {progress.sepoliaTxHash && (
            <div className="mt-3 p-2 bg-green-500/10 rounded border border-green-500/30">
              <a
                href={`https://sepolia.etherscan.io/tx/${progress.sepoliaTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-400 hover:underline flex items-center gap-1"
              >
                View Transaction ↗
              </a>
            </div>
          )}
        </div>

        {/* Hedera Status */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="text-2xl">🔷</span>
              Hedera (Escrow)
            </h3>
            <span className={`text-xs px-2 py-1 rounded ${
              hederaStatus && (hederaStatus.player1Deposited || hederaStatus.player2Deposited)
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {hederaStatus && (hederaStatus.player1Deposited || hederaStatus.player2Deposited) ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Contract ID:</span>
              <code className="text-purple-400">{escrowId}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Pot:</span>
              <span className="font-mono">{hederaStatus?.totalDeposited || '0'} PYUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-green-400">Hedera Testnet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Progress */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="font-semibold mb-3">Deposit Progress</h3>
        
        <div className="space-y-3">
          {/* Player 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                hederaStatus?.player1Deposited 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {hederaStatus?.player1Deposited ? '✓' : '1'}
              </div>
              <div>
                <div className="text-sm font-medium">
                  Player 1 {isPlayer1 && '(You)'}
                </div>
                <div className="text-xs text-gray-400">
                  {player1.slice(0, 6)}...{player1.slice(-4)}
                </div>
              </div>
            </div>
            <div className="text-sm">
              {hederaStatus?.player1Deposited ? (
                <span className="text-green-400">✓ Deposited</span>
              ) : (
                <span className="text-gray-400">⏳ Waiting...</span>
              )}
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                hederaStatus?.player2Deposited 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {hederaStatus?.player2Deposited ? '✓' : '2'}
              </div>
              <div>
                <div className="text-sm font-medium">
                  Player 2 {isPlayer2 && '(You)'}
                </div>
                <div className="text-xs text-gray-400">
                  {player2.slice(0, 6)}...{player2.slice(-4)}
                </div>
              </div>
            </div>
            <div className="text-sm">
              {hederaStatus?.player2Deposited ? (
                <span className="text-green-400">✓ Deposited</span>
              ) : (
                <span className="text-gray-400">⏳ Waiting...</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Message */}
        {progress.step !== 'idle' && (
          <div className={`mt-4 p-3 rounded ${
            progress.step === 'error' 
              ? 'bg-red-500/10 border border-red-500/30' 
              : progress.step === 'complete'
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-blue-500/10 border border-blue-500/30'
          }`}>
            <div className="flex items-center gap-2">
              {progress.step === 'complete' ? '✅' : 
               progress.step === 'error' ? '❌' : '⏳'}
              <span className="text-sm">{progress.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {!playerDeposited && (isPlayer1 || isPlayer2) && (
          <button
            onClick={handleDeposit}
            disabled={isDepositing || playerDeposited}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isDepositing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {progress.message || 'Processing...'}
              </span>
            ) : playerDeposited ? (
              '✓ Already Deposited'
            ) : (
              `Deposit ${stakeAmount} PYUSD`
            )}
          </button>
        )}

        {bothDeposited && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <div className="text-green-400 font-semibold mb-1">
              🎉 Both Players Ready!
            </div>
            <div className="text-sm text-gray-400">
              Total pot: {hederaStatus?.totalDeposited || (parseFloat(stakeAmount) * 2).toString()} PYUSD
            </div>
          </div>
        )}

        {hederaStatus?.winner && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-yellow-400 font-semibold mb-2">
              🏆 Winner: {hederaStatus.winner === address ? 'You!' : 'Opponent'}
            </div>
            {hederaStatus.winner === address && (
              <button
                onClick={claimWinnings}
                disabled={isPaying}
                className="w-full py-2 bg-yellow-500 text-black rounded font-semibold hover:bg-yellow-400 disabled:opacity-50 transition-all"
              >
                {isPaying ? 'Claiming...' : `Claim ${hederaStatus.totalDeposited} PYUSD`}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Chain Sync Status */}
      <div className="text-xs text-gray-500 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Chains synchronized • Real-time updates
        </div>
      </div>
    </div>
  );
}
