/**
 * Custom hook for contract interactions
 */

'use client';

import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { CONTRACTS } from '../constants/contracts';
import type { Address } from '../types/game';

export function useContract() {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const ticTacToeAddress = CONTRACTS.TIC_TAC_TOE.address;
  const stakingAddress = CONTRACTS.STAKING.address;
  const pyusdAddress = CONTRACTS.PYUSD.address;

  return {
    userAddress,
    publicClient,
    walletClient,
    contracts: {
      ticTacToe: ticTacToeAddress,
      staking: stakingAddress,
      pyusd: pyusdAddress,
    },
    isConnected: !!userAddress,
  };
}
