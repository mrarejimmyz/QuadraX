/**
 * API Route: AI Referee Agent
 * 
 * This endpoint receives move notifications from the frontend,
 * validates them, and automatically triggers payouts when games end.
 * 
 * POST /api/referee
 * Body: { gameId, move, player1Address, player2Address }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getGameReferee } from '@/lib/referee/GameReferee'

// Initialize referee with environment variable private key
const REFEREE_PRIVATE_KEY = process.env.REFEREE_PRIVATE_KEY || ''

let refereeInitialized = false

async function ensureRefereeInitialized() {
  if (!refereeInitialized && REFEREE_PRIVATE_KEY) {
    const referee = getGameReferee()
    await referee.initialize(REFEREE_PRIVATE_KEY)
    refereeInitialized = true
    console.log('🤖 Referee initialized')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId, move, player1Address, player2Address } = body

    if (!gameId || !move || !player1Address || !player2Address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize referee if needed (optional - only needed for payouts)
    if (REFEREE_PRIVATE_KEY) {
      await ensureRefereeInitialized()
    } else {
      console.warn('⚠️ REFEREE_PRIVATE_KEY not set - validation only mode')
    }

    const referee = getGameReferee()

    // Process the move
    console.log(`📨 Referee received move for game ${gameId}:`)
    console.log('   Move:', JSON.stringify(move, null, 2))
    console.log('   Player 1:', player1Address)
    console.log('   Player 2:', player2Address)
    
    const result = await referee.processMove(
      gameId,
      move,
      player1Address,
      player2Address
    )

    if (!result.valid) {
      console.error('❌ Referee rejected invalid move')
      console.error('   Reason:', result.reason)
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.reason || 'Invalid move rejected by referee',
          fraudDetected: true
        },
        { status: 400 }
      )
    }

    if (result.winner) {
      console.log('🏆 Referee detected winner and triggered payout!')
      return NextResponse.json({
        success: true,
        winner: result.winner,
        payoutHash: result.payoutHash,
        message: 'Winner detected - payout automatically triggered'
      })
    }

    console.log('✅ Referee validated move - game continues')
    return NextResponse.json({
      success: true,
      message: 'Move validated - game continues'
    })

  } catch (error) {
    console.error('❌ Referee API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  await ensureRefereeInitialized()
  
  return NextResponse.json({
    status: 'healthy',
    refereeActive: refereeInitialized,
    message: 'AI Referee Agent is running'
  })
}
