/**
 * Contract addresses and ABIs
 */

export const CONTRACTS = {
  TIC_TAC_TOE: {
    address: (process.env.NEXT_PUBLIC_TICTACTOE_CONTRACT || '0x') as `0x${string}`,
    name: 'TicTacToe',
  },
  STAKING: {
    address: (process.env.NEXT_PUBLIC_STAKING_CONTRACT || '0x') as `0x${string}`,
    name: 'PYUSDStaking',
  },
  PYUSD: {
    address: (process.env.NEXT_PUBLIC_PYUSD_TOKEN || '0x') as `0x${string}`,
    name: 'PYUSD',
  },
} as const;

export const CHAIN_CONFIG = {
  HEDERA_TESTNET: {
    id: 296,
    name: 'Hedera Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_HEDERA_RPC_URL || 'https://testnet.hashio.io/api',
    blockExplorer: 'https://hashscan.io/testnet',
  },
  LOCAL: {
    id: 1337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
  },
} as const;

export const MIN_STAKE = 1000000; // 1 PYUSD (6 decimals)
export const PLATFORM_FEE_BPS = 25; // 0.25%
