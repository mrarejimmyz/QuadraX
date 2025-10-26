// Contract addresses for QuadraX on different networks

export const CONTRACTS = {
  sepolia: {
    PYUSD: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9', // PYUSD on Sepolia
    PYUSDStaking: '', // Deploy this contract
    TicTacToe: '', // Game logic contract
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
