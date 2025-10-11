/**
 * Enhanced hook for contract interactions with error handling
 */

'use client';

import { usePublicClient, useWalletClient, useWriteContract, useReadContract } from 'wagmi';
import { useCallback, useState } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS } from '../constants/contracts';
import { useWallet } from './useWallet';
import { useBalances } from './useBalances';

// Contract ABIs (minimal for interaction)
const TICTACTOE_ABI = [
  {
    name: 'makeMove',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'position', type: 'uint8' }
    ],
    outputs: [],
  },
  {
    name: 'createGame',
    type: 'function', 
    stateMutability: 'payable',
    inputs: [],
    outputs: [{ name: 'gameId', type: 'uint256' }],
  },
] as const;

const STAKING_ABI = [
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const;

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

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

  // Stake PYUSD
  const stakePyusd = useCallback(async (amount: string): Promise<ContractOperationResult> => {
    const amountWei = parseUnits(amount, 6);
    
    return executeTransaction(
      contracts.staking,
      STAKING_ABI,
      'stake',
      [amountWei]
    );
  }, [contracts.staking, executeTransaction]);

  // Make a move in tic-tac-toe
  const makeMove = useCallback(async (gameId: number, position: number): Promise<ContractOperationResult> => {
    return executeTransaction(
      contracts.ticTacToe,
      TICTACTOE_ABI,
      'makeMove',
      [gameId, position]
    );
  }, [contracts.ticTacToe, executeTransaction]);

  // Create new game
  const createGame = useCallback(async (): Promise<ContractOperationResult> => {
    return executeTransaction(
      contracts.ticTacToe,
      TICTACTOE_ABI,
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
