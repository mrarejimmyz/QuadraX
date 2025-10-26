/**
 * Unified hook for dual-chain staking operations
 * Coordinates Sepolia PYUSD and Hedera escrow atomically
 */

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { getEscrowCoordinator } from '@/lib/escrow/EscrowCoordinator';
import type { Address, Hash } from 'viem';

interface StakingState {
  isDepositing: boolean;
  isPaying: boolean;
  error: string | null;
  sepoliaTx: Hash | null;
  hederaUpdated: boolean;
  bothDeposited: boolean;
}

interface DepositProgress {
  step: 'idle' | 'approving' | 'staking' | 'updating-hedera' | 'complete' | 'error';
  message: string;
  sepoliaTxHash?: Hash;
}

export function useDualChainStaking(gameId: string, escrowId: string) {
  const { address } = useAccount();
  const [state, setState] = useState<StakingState>({
    isDepositing: false,
    isPaying: false,
    error: null,
    sepoliaTx: null,
    hederaUpdated: false,
    bothDeposited: false,
  });
  const [progress, setProgress] = useState<DepositProgress>({
    step: 'idle',
    message: '',
  });

  /**
   * Deposit stake on both chains atomically
   * 1. Approve PYUSD on Sepolia
   * 2. Stake PYUSD on Sepolia
   * 3. Update Hedera escrow (only after Sepolia confirms)
   */
  const depositStake = useCallback(async (amount: string) => {
    if (!address) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isDepositing: true, 
      error: null,
      sepoliaTx: null,
      hederaUpdated: false,
    }));

    try {
      const coordinator = getEscrowCoordinator();

      // Step 1: Approving PYUSD
      setProgress({
        step: 'approving',
        message: 'Approving PYUSD token...',
      });

      // Step 2: Staking (coordinator handles approval + stake)
      setProgress({
        step: 'staking',
        message: 'Staking PYUSD on Sepolia...',
      });

      const result = await coordinator.depositStake(
        gameId,
        escrowId,
        address,
        amount
      );

      // Step 3: Updating Hedera
      setProgress({
        step: 'updating-hedera',
        message: 'Updating Hedera escrow state...',
      });

      // Step 4: Complete
      setProgress({
        step: 'complete',
        message: result.bothDeposited 
          ? '✅ Both players deposited! Game ready to start.'
          : '✅ Deposit complete! Waiting for opponent...',
        sepoliaTxHash: result.sepoliaTxHash,
      });

      setState(prev => ({
        ...prev,
        isDepositing: false,
        sepoliaTx: result.sepoliaTxHash,
        hederaUpdated: result.hederaUpdated,
        bothDeposited: result.bothDeposited,
      }));

    } catch (error: any) {
      console.error('Deposit failed:', error);
      
      setProgress({
        step: 'error',
        message: error.message || 'Deposit failed',
      });

      setState(prev => ({
        ...prev,
        isDepositing: false,
        error: error.message || 'Deposit failed',
      }));
    }
  }, [address, gameId, escrowId]);

  /**
   * Claim winnings on both chains
   */
  const claimWinnings = useCallback(async () => {
    if (!address) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isPaying: true, 
      error: null,
    }));

    try {
      const coordinator = getEscrowCoordinator();

      const result = await coordinator.payoutWinner(
        gameId,
        escrowId,
        address
      );

      console.log('🏆 Winnings claimed:', result);

      setState(prev => ({
        ...prev,
        isPaying: false,
        sepoliaTx: result.sepoliaTxHash,
        hederaUpdated: result.hederaReleased,
      }));

      return result;

    } catch (error: any) {
      console.error('Claim failed:', error);
      setState(prev => ({
        ...prev,
        isPaying: false,
        error: error.message || 'Claim failed',
      }));
    }
  }, [address, gameId, escrowId]);

  /**
   * Check if chains are in sync
   */
  const checkSync = useCallback(async () => {
    try {
      const coordinator = getEscrowCoordinator();
      const syncStatus = await coordinator.checkSyncStatus(gameId, escrowId);
      
      if (!syncStatus.synced) {
        console.warn('⚠️ Chains out of sync:', syncStatus.issues);
      }
      
      return syncStatus;
    } catch (error) {
      console.error('Sync check failed:', error);
      return null;
    }
  }, [gameId, escrowId]);

  return {
    ...state,
    progress,
    depositStake,
    claimWinnings,
    checkSync,
  };
}
