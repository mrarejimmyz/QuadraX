/**
 * Referee Client - Sends moves to AI Referee Agent for validation
 */

import type { Address } from 'viem'

interface Move {
  player: 1 | 2
  type: 'placement' | 'movement'
  from?: number
  to: number
  timestamp: number
}

interface RefereeResponse {
  success: boolean
  winner?: Address
  payoutHash?: string
  message?: string
  error?: string
  fraudDetected?: boolean
}

/**
 * Submit a move to the AI Referee for validation and automatic payout
 */
export async function submitMoveToReferee(
  gameId: string,
  move: Move,
  player1Address: Address,
  player2Address: Address
): Promise<RefereeResponse> {
  try {
    console.log('📤 Sending move to AI Referee...', move)
    
    const response = await fetch('/api/referee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId,
        move,
        player1Address,
        player2Address,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Referee rejected move:', data)
      return {
        success: false,
        error: data.error || 'Move rejected',
        fraudDetected: data.fraudDetected,
      }
    }

    if (data.winner) {
      console.log('🎉 REFEREE DETECTED WINNER!')
      console.log('   Winner:', data.winner)
      console.log('   Payout hash:', data.payoutHash)
      console.log('   💰 Funds automatically transferred!')
    } else {
      console.log('✅ Move validated by referee - game continues')
    }

    return data

  } catch (error) {
    console.error('❌ Failed to contact referee:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check if referee is running
 */
export async function checkRefereeStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/referee')
    const data = await response.json()
    return data.refereeActive === true
  } catch (error) {
    console.error('❌ Referee health check failed:', error)
    return false
  }
}
