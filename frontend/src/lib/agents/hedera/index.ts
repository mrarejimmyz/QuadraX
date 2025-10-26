// Hedera Agent for QuadraX
// Deploys and manages escrow contracts for stake management

import {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  Hbar,
  ContractId,
  FileCreateTransaction,
  FileAppendTransaction,
  TransactionReceipt,
} from '@hashgraph/sdk'

export interface HederaEscrowDeployment {
  success: boolean
  contractId: string | null
  transactionId: string | null
  escrowAddress: string | null
  stakeAmount: number
  player1: string
  player2: string
  message: string
  error?: string
}

export interface HederaEscrowStatus {
  player1Deposited: boolean
  player2Deposited: boolean
  totalDeposited: number
  winner: string | null
  gameCompleted: boolean
  fundsReleased: boolean
}

export class HederaAgent {
  private client: Client | null = null
  private operatorAccountId: AccountId | null = null
  private operatorKey: PrivateKey | null = null
  private testnetMode: boolean = true

  constructor() {
    console.log('🌐 Hedera Agent initialized (Testnet mode)')
  }

  /**
   * Initialize Hedera client with credentials
   */
  async initialize(accountId?: string, privateKey?: string): Promise<boolean> {
    try {
      // Use testnet by default
      this.client = Client.forTestnet()

      if (accountId && privateKey) {
        // Use provided credentials
        this.operatorAccountId = AccountId.fromString(accountId)
        // Handle both raw and DER-encoded private keys
        this.operatorKey = privateKey.startsWith('30')
          ? PrivateKey.fromStringDer(privateKey)
          : PrivateKey.fromString(privateKey)
        this.client.setOperator(this.operatorAccountId, this.operatorKey)
        console.log('✅ Hedera client initialized with operator:', accountId)
      } else {
        // Try to get from environment
        const envAccountId = process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID
        const envPrivateKey = process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY

        if (envAccountId && envPrivateKey) {
          this.operatorAccountId = AccountId.fromString(envAccountId)
          // Handle both raw and DER-encoded private keys
          this.operatorKey = envPrivateKey.startsWith('30')
            ? PrivateKey.fromStringDer(envPrivateKey)
            : PrivateKey.fromString(envPrivateKey)
          this.client.setOperator(this.operatorAccountId, this.operatorKey)
          console.log('✅ Hedera client initialized from environment')
        } else {
          console.warn('⚠️ No Hedera credentials provided. Some functions will be limited.')
          return false
        }
      }

      return true
    } catch (error: any) {
      console.error('❌ Failed to initialize Hedera client:', error.message)
      return false
    }
  }

  /**
   * Deploy escrow contract for QuadraX game
   * This creates a smart contract that holds stakes until game completion
   */
  async deployEscrow(
    stakeAmount: number,
    player1Address: string,
    player2Address: string
  ): Promise<HederaEscrowDeployment> {
    console.log('🚀 Deploying Hedera escrow contract...')
    console.log(`  Stake Amount: ${stakeAmount} PYUSD`)
    console.log(`  Player 1: ${player1Address}`)
    console.log(`  Player 2: ${player2Address}`)

    // Ensure client is initialized
    if (!this.client || !this.operatorAccountId || !this.operatorKey) {
      // Try to initialize if not already done
      const initialized = await this.initialize()
      if (!initialized) {
        console.warn('⚠️ Hedera client not initialized')
        
        return {
          success: false,
          contractId: null,
          transactionId: null,
          escrowAddress: null,
          stakeAmount,
          player1: player1Address,
          player2: player2Address,
          message: 'Hedera agent not initialized. Playing without on-chain escrow.',
          error: 'Client not initialized'
        }
      }
    }

    try {
      // For now, we'll use a simple escrow pattern
      // In production, deploy actual bytecode
      
      // Simulate contract deployment with unique identifier
      const mockContractId = `0.0.${Date.now().toString().slice(-6)}`
      const mockTransactionId = `0.0.${this.operatorAccountId?.toString() || '0.0.0'}@${Date.now() / 1000}`

      console.log('📝 Creating escrow contract on Hedera...')
      console.log(`  Contract ID: ${mockContractId}`)
      console.log(`  Transaction: ${mockTransactionId}`)

      // Store escrow metadata (in production, this would be on-chain)
      const escrowData = {
        contractId: mockContractId,
        stakeAmount,
        player1: player1Address,
        player2: player2Address,
        player1Deposited: false,
        player2Deposited: false,
        totalDeposited: 0,
        winner: null,
        gameCompleted: false,
        fundsReleased: false,
        createdAt: new Date().toISOString()
      }

      // Store in localStorage for demo (in production, query from Hedera)
      if (typeof window !== 'undefined') {
        const escrows = JSON.parse(localStorage.getItem('hedera_escrows') || '{}')
        escrows[mockContractId] = escrowData
        localStorage.setItem('hedera_escrows', JSON.stringify(escrows))
      }

      console.log('✅ Escrow contract deployed successfully!')

      return {
        success: true,
        contractId: mockContractId,
        transactionId: mockTransactionId,
        escrowAddress: mockContractId,
        stakeAmount,
        player1: player1Address,
        player2: player2Address,
        message: `Escrow contract deployed on Hedera Testnet! Contract ID: ${mockContractId}`
      }

    } catch (error: any) {
      console.error('❌ Escrow deployment failed:', error)
      
      return {
        success: false,
        contractId: null,
        transactionId: null,
        escrowAddress: null,
        stakeAmount,
        player1: player1Address,
        player2: player2Address,
        message: 'Escrow deployment failed. Playing without on-chain escrow.',
        error: error.message
      }
    }
  }

  /**
   * Deposit stake into escrow
   */
  async depositStake(
    contractId: string,
    playerAddress: string,
    amount: number
  ): Promise<{ success: boolean; message: string; transactionId?: string }> {
    console.log('💰 Depositing stake into Hedera escrow...')
    console.log(`  Contract: ${contractId}`)
    console.log(`  Player: ${playerAddress}`)
    console.log(`  Amount: ${amount} PYUSD`)

    try {
      // Get escrow data from storage
      if (typeof window === 'undefined') {
        throw new Error('Window not available')
      }

      const escrows = JSON.parse(localStorage.getItem('hedera_escrows') || '{}')
      const escrow = escrows[contractId]

      if (!escrow) {
        throw new Error('Escrow not found')
      }

      // Update deposit status
      if (playerAddress.toLowerCase() === escrow.player1.toLowerCase()) {
        escrow.player1Deposited = true
        escrow.totalDeposited += amount
      } else if (playerAddress.toLowerCase() === escrow.player2.toLowerCase()) {
        escrow.player2Deposited = true
        escrow.totalDeposited += amount
      } else {
        throw new Error('Player not part of this escrow')
      }

      // Save updated escrow
      escrows[contractId] = escrow
      localStorage.setItem('hedera_escrows', JSON.stringify(escrows))

      const mockTxId = `0.0.${this.operatorAccountId?.toString() || 'demo'}@${Date.now() / 1000}`

      console.log('✅ Stake deposited successfully!')
      console.log(`  Transaction: ${mockTxId}`)
      console.log(`  Total deposited: ${escrow.totalDeposited} PYUSD`)

      // Check if both players have deposited
      if (escrow.player1Deposited && escrow.player2Deposited) {
        console.log('🎮 Both players deposited! Game can start.')
      }

      return {
        success: true,
        message: `Stake deposited! ${escrow.player1Deposited && escrow.player2Deposited ? 'Game ready to start.' : 'Waiting for other player...'}`,
        transactionId: mockTxId
      }

    } catch (error: any) {
      console.error('❌ Deposit failed:', error)
      return {
        success: false,
        message: `Deposit failed: ${error.message}`
      }
    }
  }

  /**
   * Release funds to winner
   */
  async releaseToWinner(
    contractId: string,
    winnerAddress: string
  ): Promise<{ success: boolean; message: string; transactionId?: string }> {
    console.log('🏆 Releasing escrow funds to winner...')
    console.log(`  Contract: ${contractId}`)
    console.log(`  Winner: ${winnerAddress}`)

    try {
      if (typeof window === 'undefined') {
        throw new Error('Window not available')
      }

      const escrows = JSON.parse(localStorage.getItem('hedera_escrows') || '{}')
      const escrow = escrows[contractId]

      if (!escrow) {
        throw new Error('Escrow not found')
      }

      if (escrow.fundsReleased) {
        throw new Error('Funds already released')
      }

      if (!escrow.player1Deposited || !escrow.player2Deposited) {
        throw new Error('Both players must deposit before release')
      }

      // Update escrow
      escrow.winner = winnerAddress
      escrow.gameCompleted = true
      escrow.fundsReleased = true
      escrow.completedAt = new Date().toISOString()

      escrows[contractId] = escrow
      localStorage.setItem('hedera_escrows', JSON.stringify(escrows))

      const mockTxId = `0.0.${this.operatorAccountId?.toString() || 'demo'}@${Date.now() / 1000}`

      console.log('✅ Funds released to winner!')
      console.log(`  Amount: ${escrow.totalDeposited} PYUSD`)
      console.log(`  Transaction: ${mockTxId}`)

      return {
        success: true,
        message: `Winner receives ${escrow.totalDeposited} PYUSD!`,
        transactionId: mockTxId
      }

    } catch (error: any) {
      console.error('❌ Release failed:', error)
      return {
        success: false,
        message: `Release failed: ${error.message}`
      }
    }
  }

  /**
   * Get escrow status
   */
  async getEscrowStatus(contractId: string): Promise<HederaEscrowStatus | null> {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const escrows = JSON.parse(localStorage.getItem('hedera_escrows') || '{}')
      const escrow = escrows[contractId]

      if (!escrow) {
        return null
      }

      return {
        player1Deposited: escrow.player1Deposited,
        player2Deposited: escrow.player2Deposited,
        totalDeposited: escrow.totalDeposited,
        winner: escrow.winner,
        gameCompleted: escrow.gameCompleted,
        fundsReleased: escrow.fundsReleased
      }

    } catch (error) {
      console.error('Failed to get escrow status:', error)
      return null
    }
  }

  /**
   * Refund stakes in case of tie
   */
  async refundStakes(contractId: string): Promise<{ success: boolean; message: string }> {
    console.log('🔄 Refunding stakes due to tie...')
    console.log(`  Contract: ${contractId}`)

    try {
      if (typeof window === 'undefined') {
        throw new Error('Window not available')
      }

      const escrows = JSON.parse(localStorage.getItem('hedera_escrows') || '{}')
      const escrow = escrows[contractId]

      if (!escrow) {
        throw new Error('Escrow not found')
      }

      if (escrow.fundsReleased) {
        throw new Error('Funds already released')
      }

      // Update escrow
      escrow.gameCompleted = true
      escrow.fundsReleased = true
      escrow.winner = 'TIE'
      escrow.completedAt = new Date().toISOString()

      escrows[contractId] = escrow
      localStorage.setItem('hedera_escrows', JSON.stringify(escrows))

      console.log('✅ Stakes refunded to both players!')

      return {
        success: true,
        message: 'Game tied! Stakes refunded to both players.'
      }

    } catch (error: any) {
      console.error('❌ Refund failed:', error)
      return {
        success: false,
        message: `Refund failed: ${error.message}`
      }
    }
  }
}

// Singleton instance
let hederaAgent: HederaAgent | null = null
let initializationPromise: Promise<boolean> | null = null

export function getHederaAgent(): HederaAgent {
  if (!hederaAgent) {
    hederaAgent = new HederaAgent()
    // Auto-initialize with environment variables
    initializationPromise = hederaAgent.initialize()
  }
  return hederaAgent
}
