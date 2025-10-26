// Contract addresses for QuadraX on different networks

// Platform/AI Treasury Address (holds PYUSD for AI opponent stakes)
export const PLATFORM_TREASURY = '0x224783d70d55f9ab790fe27fcfc4629241f45371' as const

// Main staking contract address (referee uses this)
export const STAKING_CONTRACT_ADDRESS = '0x1E7A9732C25DaD9880ac9437d00a071B937c1807' as `0x${string}`

export const CONTRACTS = {
  sepolia: {
    PYUSD: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9', // PYUSD on Sepolia (Official)
    PYUSDStaking: '0x1E7A9732C25DaD9880ac9437d00a071B937c1807', // Deployed Oct 26, 2025
    TicTacToe: '0xFD7B057CcdD731a446eFfd29ae95D03b0a63a986', // Deployed Oct 26, 2025
  },
  mainnet: {
    PYUSD: '', // PYUSD on mainnet
    PYUSDStaking: '',
    TicTacToe: '',
  }
} as const

export const SUPPORTED_CHAINS = {
  sepolia: 11155111,
  mainnet: 1,
} as const

export type SupportedChain = keyof typeof CONTRACTS
export type ContractName = keyof typeof CONTRACTS.sepolia

// Get contract address for current chain
export function getContractAddress(
  chain: SupportedChain,
  contract: ContractName
): string {
  const address = CONTRACTS[chain][contract]
  if (!address) {
    throw new Error(`Contract ${contract} not deployed on ${chain}`)
  }
  return address
}
