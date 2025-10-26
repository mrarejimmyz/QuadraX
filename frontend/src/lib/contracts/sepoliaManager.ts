// Sepolia Contract Integration for QuadraX
// Manages PYUSD staking and game treasury on Sepolia testnet

import { createPublicClient, createWalletClient, custom, http, type Address, type Hash } from 'viem'
import { sepolia } from 'viem/chains'
import PYUSDStakingABI from '@/contracts/abis/PYUSDStaking.json'
import { getContractAddress } from '@/contracts/addresses'

// ERC20 ABI for PYUSD approval
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export interface GameDeployment {
  gameId: bigint
  player1: Address
  player2: Address
  stakeAmount: bigint
  transactionHash: Hash
  ready: boolean
}

export interface StakeResult {
  success: boolean
  transactionHash: Hash
  gameStarted: boolean
  error?: string
}

export class SepoliaContractManager {
  private publicClient
  private pyusdAddress: Address
  private stakingAddress: Address | null = null

  constructor() {
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    })

    this.pyusdAddress = getContractAddress('sepolia', 'PYUSD') as Address

    // Check if staking contract is deployed
    const stakingAddr = getContractAddress('sepolia', 'PYUSDStaking')
    if (stakingAddr) {
      this.stakingAddress = stakingAddr as Address
    }
  }

  /**
   * Check if PYUSDStaking contract is deployed
   */
  isContractDeployed(): boolean {
    return this.stakingAddress !== null && this.stakingAddress !== ''
  }

  /**
   * Create a new game on-chain
   */
  async createGame(
    player1Address: Address,
    player2Address: Address
  ): Promise<GameDeployment> {
    if (!this.stakingAddress) {
      throw new Error('PYUSDStaking contract not deployed on Sepolia')
    }

    if (!window.ethereum) {
      throw new Error('No wallet found')
    }

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum)
    })

    console.log('📝 Creating game on-chain...')
    console.log(`  Player 1: ${player1Address}`)
    console.log(`  Player 2: ${player2Address}`)

    // Call createGame on the contract
    const hash = await walletClient.writeContract({
      address: this.stakingAddress,
      abi: PYUSDStakingABI.abi,
      functionName: 'createGame',
      args: [player2Address],
      account: player1Address
    })

    console.log(`  Transaction hash: ${hash}`)

    // Wait for transaction confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

    // Parse GameCreated event to get gameId
    const gameCreatedEvent = receipt.logs.find(
      log => log.topics[0] === '0x...' // GameCreated event signature
    )

    // For now, read from contract to get latest gameId
    const gameCounter = await this.publicClient.readContract({
      address: this.stakingAddress,
      abi: PYUSDStakingABI.abi,
      functionName: 'gameCounter'
    }) as bigint

    const gameId = gameCounter - 1n // Latest game is counter - 1

    console.log(`✅ Game created with ID: ${gameId}`)

    return {
      gameId,
      player1: player1Address,
      player2: player2Address,
      stakeAmount: 0n,
      transactionHash: hash,
      ready: true
    }
  }

  /**
   * Check PYUSD balance
   */
  async getPYUSDBalance(address: Address): Promise<bigint> {
    const balance = await this.publicClient.readContract({
      address: this.pyusdAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address]
    }) as bigint

    return balance
  }

  /**
   * Check PYUSD allowance for staking contract
   */
  async getPYUSDAllowance(ownerAddress: Address): Promise<bigint> {
    if (!this.stakingAddress) {
      return 0n
    }

    const allowance = await this.publicClient.readContract({
      address: this.pyusdAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [ownerAddress, this.stakingAddress]
    }) as bigint

    return allowance
  }

  /**
   * Approve PYUSD for staking contract
   */
  async approvePYUSD(
    userAddress: Address,
    amount: bigint
  ): Promise<Hash> {
    if (!this.stakingAddress) {
      throw new Error('PYUSDStaking contract not deployed')
    }

    if (!window.ethereum) {
      throw new Error('No wallet found')
    }

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum)
    })

    console.log('✅ Approving PYUSD...')
    console.log(`  Amount: ${amount} (${Number(amount) / 1e6} PYUSD)`)

    const hash = await walletClient.writeContract({
      address: this.pyusdAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [this.stakingAddress, amount],
      account: userAddress
    })

    await this.publicClient.waitForTransactionReceipt({ hash })
    console.log('✅ PYUSD approved')

    return hash
  }

  /**
   * Stake PYUSD for a game
   */
  async stakeForGame(
    gameId: bigint,
    userAddress: Address,
    amount: bigint
  ): Promise<StakeResult> {
    if (!this.stakingAddress) {
      return {
        success: false,
        transactionHash: '0x0' as Hash,
        gameStarted: false,
        error: 'PYUSDStaking contract not deployed'
      }
    }

    if (!window.ethereum) {
      return {
        success: false,
        transactionHash: '0x0' as Hash,
        gameStarted: false,
        error: 'No wallet found'
      }
    }

    try {
      // Check allowance
      const allowance = await this.getPYUSDAllowance(userAddress)
      
      if (allowance < amount) {
        console.log('⚠️ Insufficient allowance, requesting approval...')
        await this.approvePYUSD(userAddress, amount)
      }

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
      })

      console.log('💰 Staking PYUSD...')
      console.log(`  Game ID: ${gameId}`)
      console.log(`  Amount: ${amount} (${Number(amount) / 1e6} PYUSD)`)

      const hash = await walletClient.writeContract({
        address: this.stakingAddress,
        abi: PYUSDStakingABI.abi,
        functionName: 'stake',
        args: [gameId, amount],
        account: userAddress
      })

      console.log(`  Transaction hash: ${hash}`)

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

      // Check if GameStarted event was emitted
      const gameStartedEvent = receipt.logs.find(
        log => log.topics.length > 0 // Check for GameStarted event
      )

      console.log('✅ Stake successful!')

      return {
        success: true,
        transactionHash: hash,
        gameStarted: !!gameStartedEvent,
        error: undefined
      }
    } catch (error: any) {
      console.error('❌ Staking failed:', error)
      return {
        success: false,
        transactionHash: '0x0' as Hash,
        gameStarted: false,
        error: error.message
      }
    }
  }

  /**
   * Get game details
   */
  async getGameDetails(gameId: bigint) {
    if (!this.stakingAddress) {
      throw new Error('PYUSDStaking contract not deployed')
    }

    const game = await this.publicClient.readContract({
      address: this.stakingAddress,
      abi: PYUSDStakingABI.abi,
      functionName: 'games',
      args: [gameId]
    }) as any

    return {
      player1: game[0] as Address,
      player2: game[1] as Address,
      player1Stake: game[2] as bigint,
      player2Stake: game[3] as bigint,
      totalPot: game[4] as bigint,
      player1Staked: game[5] as boolean,
      player2Staked: game[6] as boolean,
      gameStarted: game[7] as boolean,
      gameEnded: game[8] as boolean,
      winner: game[9] as Address,
      isTie: game[10] as boolean
    }
  }

  /**
   * Declare winner and trigger payout
   */
  async declareWinner(
    gameId: bigint,
    winnerAddress: Address,
    callerAddress: Address
  ): Promise<Hash> {
    if (!this.stakingAddress) {
      throw new Error('PYUSDStaking contract not deployed')
    }

    if (!window.ethereum) {
      throw new Error('No wallet found')
    }

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum)
    })

    console.log('🏆 Declaring winner...')
    console.log(`  Game ID: ${gameId}`)
    console.log(`  Winner: ${winnerAddress}`)

    const hash = await walletClient.writeContract({
      address: this.stakingAddress,
      abi: PYUSDStakingABI.abi,
      functionName: 'declareWinner',
      args: [gameId, winnerAddress],
      account: callerAddress
    })

    await this.publicClient.waitForTransactionReceipt({ hash })
    console.log('✅ Winner declared and paid out!')

    return hash
  }
}

// Singleton instance
let contractManager: SepoliaContractManager | null = null

export function getContractManager(): SepoliaContractManager {
  if (!contractManager) {
    contractManager = new SepoliaContractManager()
  }
  return contractManager
}
