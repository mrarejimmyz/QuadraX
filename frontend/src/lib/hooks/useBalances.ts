/**
 * Hook for managing token balances with real-time updates
 */

'use client';

import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '../constants/contracts';

// ERC20 ABI (minimal for balance checking)
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
] as const;

export interface TokenBalance {
  raw: bigint;
  formatted: string;
  decimals: number;
  symbol: string;
  isLoading: boolean;
  error: string | null;
}

export interface BalanceHook {
  hbar: TokenBalance;
  pyusd: TokenBalance;
  refetchBalances: () => void;
}

export function useBalances(): BalanceHook {
  const { address, isConnected } = useAccount();
  
  // HBAR balance (native token)
  const {
    data: hbarBalance,
    isLoading: hbarLoading,
    error: hbarError,
    refetch: refetchHbar,
  } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // PYUSD balance
  const {
    data: pyusdBalanceRaw,
    isLoading: pyusdBalanceLoading,
    error: pyusdBalanceError,
    refetch: refetchPyusd,
  } = useReadContract({
    address: CONTRACTS.PYUSD.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && CONTRACTS.PYUSD.address !== '0x',
      refetchInterval: 10000,
    },
  });

  // PYUSD decimals
  const {
    data: pyusdDecimals,
    isLoading: pyusdDecimalsLoading,
  } = useReadContract({
    address: CONTRACTS.PYUSD.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: {
      enabled: CONTRACTS.PYUSD.address !== '0x',
    },
  });

  // PYUSD symbol
  const {
    data: pyusdSymbol,
  } = useReadContract({
    address: CONTRACTS.PYUSD.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: {
      enabled: CONTRACTS.PYUSD.address !== '0x',
    },
  });

  const refetchBalances = () => {
    refetchHbar();
    refetchPyusd();
  };

  // Debug logging removed to reduce console noise

  // Format HBAR balance with safe error handling
  const hbar: TokenBalance = {
    raw: hbarBalance?.value || BigInt(0),
    formatted: (() => {
      try {
        return hbarBalance && hbarBalance.value !== undefined && hbarBalance.decimals !== undefined
          ? formatUnits(hbarBalance.value, hbarBalance.decimals)
          : '0';
      } catch (error) {
        console.warn('Error formatting HBAR balance:', error);
        return '0';
      }
    })(),
    decimals: hbarBalance?.decimals || 18,
    symbol: hbarBalance?.symbol || 'HBAR',
    isLoading: hbarLoading,
    error: hbarError ? `HBAR Error: ${hbarError.message}` : null,
  };

  // Format PYUSD balance with safe error handling
  const pyusd: TokenBalance = {
    raw: pyusdBalanceRaw || BigInt(0),
    formatted: (() => {
      try {
        // Check if PYUSD contract is properly configured
        if (CONTRACTS.PYUSD.address === '0x' || CONTRACTS.PYUSD.address === '0x0000000000000000000000000000000000000003') {
          return 'Contract not deployed';
        }
        
        return pyusdBalanceRaw && 
               pyusdDecimals !== undefined && 
               pyusdDecimals !== null &&
               typeof pyusdDecimals === 'number' &&
               pyusdDecimals >= 0 && 
               pyusdDecimals <= 77  // Max safe decimals for formatUnits
          ? formatUnits(pyusdBalanceRaw, pyusdDecimals)
          : '0';
      } catch (error) {
        console.warn('Error formatting PYUSD balance:', error);
        return '0';
      }
    })(),
    decimals: pyusdDecimals || 6,
    symbol: pyusdSymbol || 'PYUSD',
    isLoading: pyusdBalanceLoading || pyusdDecimalsLoading,
    error: (() => {
      if (CONTRACTS.PYUSD.address === '0x' || CONTRACTS.PYUSD.address === '0x0000000000000000000000000000000000000003') {
        return 'PYUSD contract not deployed on Hedera Testnet';
      }
      return pyusdBalanceError ? `PYUSD Error: ${pyusdBalanceError.message}` : null;
    })(),
  };

  return {
    hbar,
    pyusd,
    refetchBalances,
  };
}

export function useFormattedBalance(amount: string, decimals: number = 18): string {
  try {
    if (!amount || amount === '0') return '0';
    const parsed = parseUnits(amount, decimals);
    return formatUnits(parsed, decimals);
  } catch {
    return '0';
  }
}