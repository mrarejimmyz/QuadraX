/**
 * Enhanced hook for contract interactions with error handling
 */

'use client';

import { usePublicClient, useWalletClient, useWriteContract, useReadContract } from 'wagmi';
import { useCallback, useState } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS } from '../constants/contracts';
import { CONTRACT_ABIS, ERC20_ABI, PYUSD_STAKING_ABI, TIC_TAC_TOE_ABI } from '../constants/abis';
import { useWallet } from './useWallet';
import { useBalances } from './useBalances';

// Contract ABIs imported from centralized location

export interface ContractOperationResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export function useContract() {
  const { address: userAddress, isConnected, isWrongNetwork } = useWallet();
  const { refetchBalances } = useBalances();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  
  const [isTransacting, setIsTransacting] = useState(false);

  // Contract addresses
  const contracts = {
    ticTacToe: CONTRACTS.TIC_TAC_TOE.address,
    staking: CONTRACTS.STAKING.address,
    pyusd: CONTRACTS.PYUSD.address,
  };

  // Generic contract write function
  const executeTransaction = useCallback(async (
    address: `0x${string}`,
    abi: any,
    functionName: string,
    args?: any[],
    value?: bigint
  ): Promise<ContractOperationResult> => {
    if (!isConnected || isWrongNetwork) {
      return { success: false, error: 'Wallet not connected or wrong network' };
    }

    try {
      setIsTransacting(true);
      
      const hash = await writeContractAsync({
        address,
        abi,
        functionName,
        args: args || [],
        value,
      });

      // Refetch balances after transaction
      setTimeout(() => refetchBalances(), 2000);

      return { success: true, hash };
    } catch (error: any) {
      console.error('Transaction failed:', error);
      return { 
        success: false, 
        error: error.message || 'Transaction failed'
      };
    } finally {
      setIsTransacting(false);
    }
  }, [isConnected, isWrongNetwork, writeContractAsync, refetchBalances]);

  // Approve PYUSD spending
  const approvePyusd = useCallback(async (amount: string): Promise<ContractOperationResult> => {
    const amountWei = parseUnits(amount, 6); // PYUSD has 6 decimals
    
    return executeTransaction(
      contracts.pyusd,
      ERC20_ABI,
      'approve',
      [contracts.staking, amountWei]
    );
  }, [contracts.pyusd, contracts.staking, executeTransaction]);

  // Stake PYUSD tokens in a game
  const stakePyusd = useCallback(async (amount: string): Promise<ContractOperationResult> => {
    const amountWei = parseUnits(amount, 6); // PYUSD has 6 decimals
    
    return executeTransaction(
      contracts.staking,
      PYUSD_STAKING_ABI,
      'stake',
      [amountWei]
    );
  }, [contracts.staking, executeTransaction]);

  // Make a move in tic-tac-toe
  const makeMove = useCallback(async (gameId: number, position: number): Promise<ContractOperationResult> => {
    return executeTransaction(
      contracts.ticTacToe,
      TIC_TAC_TOE_ABI,
      'makeMove',
      [gameId, position]
    );
  }, [contracts.ticTacToe, executeTransaction]);

  // Create new game
  const createGame = useCallback(async (): Promise<ContractOperationResult> => {
    return executeTransaction(
      contracts.ticTacToe,
      TIC_TAC_TOE_ABI,
      'createGame'
    );
  }, [contracts.ticTacToe, executeTransaction]);

  return {
    // State
    userAddress,
    publicClient,
    walletClient,
    contracts,
    isConnected,
    isWrongNetwork,
    isTransacting,

    // Contract interactions
    approvePyusd,
    stakePyusd,
    makeMove,
    createGame,
    executeTransaction,
  };
}
