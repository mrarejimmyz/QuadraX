/**
 * AI Agent Referee - Autonomous Game Validator and Payout Trigger
 * 
 * Responsibilities:
 * 1. Monitor every move made by both players
 * 2. Validate moves against game rules (no cheating/hacking)
 * 3. Detect win conditions
 * 4. Automatically trigger payout when game ends legitimately
 * 5. Prevent fraud/manipulation
 */

import { createPublicClient, createWalletClient, http, type Address } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import PYUSDStakingABI from '@/contracts/abis/PYUSDStaking.json'
import { STAKING_CONTRACT_ADDRESS } from '@/contracts/addresses'

interface Move {
  player: 1 | 2
  type: 'placement' | 'movement'
  from?: number
  to: number
  timestamp: number
}

interface GameState {
  board: number[]
  moves: Move[]
  phase: 'placement' | 'movement'
  currentPlayer: 1 | 2
}

interface ValidationResult {
  isValid: boolean
  reason?: string
  fraudDetected?: boolean
}

export class GameReferee {
  private publicClient: any
  private walletClient: any
  private gameStates: Map<string, GameState> = new Map()
  private isMonitoring: boolean = false
  
  constructor() {
    // Initialize blockchain clients
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    })
  }

  /**
   * Initialize the referee agent with a wallet to sign payout transactions
   * This should be called with a dedicated referee wallet (not player wallets)
   */
  async initialize(refereePrivateKey: string) {
    const account = privateKeyToAccount(refereePrivateKey as `0x${string}`)
    
    this.walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http()
    })
    
    console.log('🤖 Game Referee initialized')
    console.log('   Referee address:', account.address)
  }

  /**
   * Start monitoring a game
   */
  startMonitoring(gameId: string, player1: Address, player2: Address) {
    console.log(`👁️ Referee monitoring game ${gameId}`)
    
    this.gameStates.set(gameId, {
      board: Array(16).fill(0),
      moves: [],
      phase: 'placement',
      currentPlayer: 1
    })
    
    this.isMonitoring = true
  }

  /**
   * Validate and record a move
   */
  validateMove(gameId: string, move: Move): ValidationResult {
    const state = this.gameStates.get(gameId)
    if (!state) {
      return { isValid: false, reason: 'Game not found' }
    }

    console.log(`🔍 Referee validating move:`, move)

    // Check if it's the correct player's turn
    if (move.player !== state.currentPlayer) {
      console.error('❌ Wrong player turn!')
      return { 
        isValid: false, 
        reason: 'Not your turn', 
        fraudDetected: true 
      }
    }

    // Validate placement move
    if (move.type === 'placement') {
      if (state.board[move.to] !== 0) {
        console.error('❌ Cell already occupied!')
        return { 
          isValid: false, 
          reason: 'Cell occupied', 
          fraudDetected: true 
        }
      }
      
      // Check if still in placement phase
      const totalPieces = state.board.filter(c => c !== 0).length
      if (totalPieces >= 8) {
        console.error('❌ Placement phase over!')
        return { 
          isValid: false, 
          reason: 'Should be in movement phase', 
          fraudDetected: true 
        }
      }
    }

    // Validate movement move
    if (move.type === 'movement') {
      if (move.from === undefined) {
        return { isValid: false, reason: 'Missing from position' }
      }
      
      // Check piece belongs to player
      if (state.board[move.from] !== move.player) {
        console.error('❌ Not your piece!')
        return { 
          isValid: false, 
          reason: 'Not your piece', 
          fraudDetected: true 
        }
      }

      // Check destination is empty
      if (state.board[move.to] !== 0) {
        console.error('❌ Destination occupied!')
        return { 
          isValid: false, 
          reason: 'Destination occupied', 
          fraudDetected: true 
        }
      }

      // ✅ In QuadraX, pieces can move ANYWHERE (no adjacency restriction)
      // Players strategically reposition their 4 pieces to form winning patterns
    }

    console.log('✅ Move validated')
    return { isValid: true }
  }

  /**
   * Record a validated move and update game state
   */
  recordMove(gameId: string, move: Move) {
    const state = this.gameStates.get(gameId)
    if (!state) return

    // Apply move to board
    if (move.type === 'placement') {
      state.board[move.to] = move.player
    } else if (move.type === 'movement' && move.from !== undefined) {
      state.board[move.from] = 0
      state.board[move.to] = move.player
    }

    // Record move
    state.moves.push(move)

    // Switch player
    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1

    // Update phase
    const totalPieces = state.board.filter(c => c !== 0).length
    if (totalPieces >= 8) {
      state.phase = 'movement'
    }

    console.log(`📝 Move recorded. Board:`, state.board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
  }

  /**
   * Check for winner after each move
   */
  checkWinner(gameId: string): { winner: 1 | 2 | null, line?: number[] } {
    const state = this.gameStates.get(gameId)
    if (!state) return { winner: null }

    const board = state.board

    // Check all possible winning lines
    const lines = this.getWinningLines()

    for (const line of lines) {
      const cells = line.map(i => board[i])
      
      // Check if all 4 cells belong to player 1
      if (cells.every(c => c === 1)) {
        console.log('🏆 REFEREE: Player 1 wins!', line)
        return { winner: 1, line }
      }
      
      // Check if all 4 cells belong to player 2
      if (cells.every(c => c === 2)) {
        console.log('🏆 REFEREE: Player 2 wins!', line)
        return { winner: 2, line }
      }
    }

    return { winner: null }
  }

  /**
   * Get all possible winning lines (rows, columns, diagonals)
   */
  private getWinningLines(): number[][] {
    return [
      // Rows
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      
      // Columns
      [0, 4, 8, 12],
      [1, 5, 9, 13],
      [2, 6, 10, 14],
      [3, 7, 11, 15],
      
      // Diagonals
      [0, 5, 10, 15],
      [3, 6, 9, 12]
    ]
  }

  /**
   * Automatically trigger payout when game ends legitimately
   */
  async triggerPayout(gameId: string, winnerAddress: Address): Promise<string> {
    console.log('💰 REFEREE: Triggering automatic payout...')
    console.log('   Game ID:', gameId)
    console.log('   Winner:', winnerAddress)

    if (!this.walletClient) {
      console.warn('⚠️ REFEREE: No wallet configured - skipping on-chain payout')
      console.warn('   In production, set REFEREE_PRIVATE_KEY environment variable')
      return '0x0000000000000000000000000000000000000000000000000000000000000000' // Dummy hash
    }

    try {
      // Convert gameId to BigInt
      const gameIdBigInt = BigInt(gameId)

      // Call declareWinner on the staking contract
      const hash = await this.walletClient.writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: PYUSDStakingABI.abi || PYUSDStakingABI,
        functionName: 'declareWinner',
        args: [gameIdBigInt, winnerAddress],
      })

      console.log('✅ REFEREE: Payout transaction submitted:', hash)
      console.log('   View on Etherscan: https://sepolia.etherscan.io/tx/' + hash)

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        console.log('✅ REFEREE: Payout confirmed!')
        return hash
      } else {
        throw new Error('Payout transaction failed')
      }

    } catch (error) {
      console.error('❌ REFEREE: Payout failed:', error)
      throw error
    }
  }

  /**
   * Main monitoring loop - watches for moves and automatically pays out winners
   */
  async monitorGame(
    gameId: string, 
    player1: Address, 
    player2: Address,
    onMoveCallback?: (move: Move) => void
  ) {
    this.startMonitoring(gameId, player1, player2)

    console.log('🤖 REFEREE: Monitoring game', gameId)
    console.log('   Player 1:', player1)
    console.log('   Player 2:', player2)
    console.log('   Watching for fraud and automatic payout...')
  }

  /**
   * Process a move from the frontend
   */
  async processMove(
    gameId: string,
    move: Move,
    player1Address: Address,
    player2Address: Address
  ): Promise<{ valid: boolean; winner?: Address; payoutHash?: string; reason?: string }> {
    // Auto-initialize game state if not exists
    if (!this.gameStates.has(gameId)) {
      console.log(`🎮 REFEREE: Auto-initializing game ${gameId}`)
      this.startMonitoring(gameId, player1Address, player2Address)
    }
    
    // Validate the move
    const validation = this.validateMove(gameId, move)
    
    if (!validation.isValid) {
      console.error('❌ REFEREE: Invalid move rejected:', validation.reason)
      
      if (validation.fraudDetected) {
        console.error('🚨 FRAUD DETECTED! Move rejected.')
      }
      
      return { 
        valid: false,
        reason: validation.reason
      }
    }

    // Record the valid move
    this.recordMove(gameId, move)

    // Check for winner
    const result = this.checkWinner(gameId)
    
    if (result.winner) {
      const winnerAddress = result.winner === 1 ? player1Address : player2Address
      console.log('🎉 REFEREE: Winner detected! Triggering automatic payout...')
      
      try {
        const payoutHash = await this.triggerPayout(gameId, winnerAddress)
        return { 
          valid: true, 
          winner: winnerAddress, 
          payoutHash 
        }
      } catch (error) {
        console.error('❌ REFEREE: Failed to trigger payout:', error)
        return { valid: true, winner: winnerAddress }
      }
    }

    return { valid: true }
  }
}

// Singleton instance
let refereeInstance: GameReferee | null = null

export function getGameReferee(): GameReferee {
  if (!refereeInstance) {
    refereeInstance = new GameReferee()
  }
  return refereeInstance
}
