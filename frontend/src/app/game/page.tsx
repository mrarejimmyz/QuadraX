'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Board, GameInfo, AIChat } from '@/features/game'
import StakeNegotiationChat from '@/features/game/StakeNegotiationChat'
import StakingPanel from '@/features/staking/StakingPanel'
import { IntelligentStakingPanel } from '@/features/staking/IntelligentStakingSystem'
import { useGameWithIntelligentStaking } from '@/features/game/CompleteGameIntegration'
import Link from 'next/link'

// Game position interface for AI analysis
interface GamePosition {
  board: number[]
  phase: 'placement' | 'movement'
  piecesPlaced: { player1: number, player2: number }
  currentPlayer: number
}

// PYUSD staking context for AI
interface PYUSDStakeContext {
  playerBalance: number
  opponentBalance: number
  minStake: number
  maxStake: number
  standardStake: number
  gameId?: string
}

export default function GamePage() {
  // Get wallet address
  const { address } = useAccount()
  
  // Read URL parameters
  const searchParams = useSearchParams()
  const urlStake = searchParams?.get('stake')
  const urlGameId = searchParams?.get('gameId')
  const urlEscrowId = searchParams?.get('escrowId')
  
  // === 3-PHASE FLOW STATE ===
  // Phase 1: negotiation → Phase 2: staking → Phase 3: gameplay
  // If we have URL params, skip negotiation and go straight to staking
  const initialPhase = (urlStake && urlGameId) ? 'staking' : 'negotiation'
  const [gamePhase, setGamePhase] = useState<'negotiation' | 'staking' | 'gameplay' | 'finished'>(initialPhase)
  const [isDemoMode, setIsDemoMode] = useState(false) // Free play without stakes
  
  // Strategic 4x4 QuadraX Game State
  const [board, setBoard] = useState<number[]>(Array(16).fill(0))
  const [currentPlayer, setCurrentPlayer] = useState<number>(1)
  const [gameId] = useState<number>(Math.floor(Math.random() * 1000000))
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [placementPhase, setPlacementPhase] = useState(true)
  
  // Staking state
  const [negotiatedStake, setNegotiatedStake] = useState<number | null>(null)
  const [isStaked, setIsStaked] = useState(false)
  const [pot, setPot] = useState('0')
  const [payoutClaimed, setPayoutClaimed] = useState(false)
  
  // Game position for AI analysis (live updates during gameplay)
  const [gamePosition, setGamePosition] = useState<GamePosition>({
    board: Array(16).fill(0),
    phase: 'placement',
    piecesPlaced: { player1: 0, player2: 0 },
    currentPlayer: 1
  })

  // ASI Alliance decision tracking
  const [lastASIDecision, setLastASIDecision] = useState<{
    agent: string
    reasoning: string
    confidence: number
    move: any
    timestamp: number
  } | null>(null)
  
  // Staking context for AI
  const [stakingContext, setStakingContext] = useState<PYUSDStakeContext>({
    playerBalance: 100,
    opponentBalance: 100,
    minStake: 1,
    maxStake: 10,
    standardStake: 6,
    gameId: gameId.toString()
  })
  
  // Auto-configure from URL parameters (from negotiate page)
  useEffect(() => {
    if (urlStake && urlGameId) {
      const stakeAmount = parseFloat(urlStake)
      console.log('🎯 Auto-configuring from URL params:')
      console.log('   Stake:', stakeAmount, 'PYUSD')
      console.log('   Game ID:', urlGameId)
      console.log('   Escrow ID:', urlEscrowId)
      console.log('   Phase:', gamePhase)
      
      setNegotiatedStake(stakeAmount)
      setPot((stakeAmount * 2).toString()) // Both players stake same amount
    }
  }, [urlStake, urlGameId, urlEscrowId, gamePhase])
  
  // Function to claim payout when game ends
  // NOTE: This is now handled by the AI Referee Agent automatically
  const claimPayout = async (winner: 'player1' | 'player2') => {
    if (!address || !urlGameId || !urlEscrowId || isDemoMode || payoutClaimed) {
      console.log('⚠️ Skipping payout:', { address, urlGameId, urlEscrowId, isDemoMode, payoutClaimed })
      return
    }
    
    try {
      console.log('💰 Game ended - AI Referee will handle payout automatically')
      const { PLATFORM_TREASURY } = await import('@/contracts/addresses')
      
      // Determine winner address
      const winnerAddress = winner === 'player1' ? address : PLATFORM_TREASURY
      
      console.log('   Winner:', winnerAddress)
      console.log('   🤖 AI Referee Agent is validating game and triggering payout...')
      console.log('   ⏳ No user action required - payout is automatic!')
      
      setPayoutClaimed(true)
      
      const payoutAmount = (parseFloat(pot) * 0.9975).toFixed(4)
      if (winner === 'player1') {
        alert(`🎉 You won!\n💰 ${payoutAmount} PYUSD will be sent automatically\n🤖 AI Referee is processing the payout...`)
      } else {
        alert(`🤖 AI won!\n💰 ${payoutAmount} PYUSD will be sent automatically\n🤖 AI Referee is processing the payout...`)
      }
    } catch (error) {
      console.error('❌ Error:', error)
    }
  }
  
  // Update game position when board changes (for AI commentary)
  useEffect(() => {
    // 🔥 CRITICAL CHECK: Detect existing wins before any other processing
    console.log('🎯 USEEFFECT: Board state check at start - Game Phase:', gamePhase)
    console.log('🎲 USEEFFECT: Current board:', board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
    console.log('🎮 USEEFFECT: Current player:', currentPlayer)
    
    // ALWAYS check for wins regardless of game phase
    console.log('🔍 USEEFFECT: Calling checkWinner for Player 1...')
    const player1Won = checkWinner(board, 1)
    console.log('🔍 USEEFFECT: Player 1 win result:', player1Won)
    
    if (player1Won) {
      console.log('🏆 USEEFFECT: Player 1 has ALREADY WON! Ending game immediately.')
      setGamePhase('finished')
      
      // Claim payout automatically
      claimPayout('player1')
      
      setTimeout(() => {
        alert(`🎉 You win!${!isDemoMode ? `\n💰 Claiming payout of ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD...` : ''}`)
      }, 100)
      return
    }
    
    console.log('🔍 USEEFFECT: Calling checkWinner for Player 2...')
    const player2Won = checkWinner(board, 2)
    console.log('🔍 USEEFFECT: Player 2 win result:', player2Won)
    
    if (player2Won) {
      console.log('🤖 USEEFFECT: Player 2 has ALREADY WON! Ending game immediately.')
      setGamePhase('finished')
      
      // Claim payout automatically (AI won)
      claimPayout('player2')
      
      setTimeout(() => {
        alert('🤖 AI wins!')
      }, 100)
      return
    }
    
    const player1Pieces = board.filter(cell => cell === 1).length
    const player2Pieces = board.filter(cell => cell === 2).length
    const totalPieces = player1Pieces + player2Pieces
    
    console.log('🎯 USEEFFECT: Piece count - P1:', player1Pieces, 'P2:', player2Pieces, 'Total:', totalPieces)
    
    // Determine current phase based on pieces placed
    const currentPhase = totalPieces < 8 ? 'placement' : 'movement'
    
    setGamePosition({
      board,
      phase: currentPhase, // ✅ FIXED: Dynamic phase detection
      piecesPlaced: {
        player1: player1Pieces,
        player2: player2Pieces
      },
      currentPlayer
    })
  }, [board, currentPlayer, gamePhase, isDemoMode, pot, address, urlGameId, urlEscrowId, payoutClaimed])

  // === PHASE 1: NEGOTIATION HANDLERS ===
  const handleNegotiationComplete = (stake: number | null, demo: boolean) => {
    console.log('handleNegotiationComplete called:', { stake, demo })
    if (demo) {
      console.log('Setting demo mode and transitioning to gameplay...')
      setIsDemoMode(true)
      setNegotiatedStake(0)
      setPot('0')
      // Skip staking, go directly to gameplay
      setGamePhase('gameplay')
      console.log('Demo mode activated, gamePhase set to gameplay')
    } else if (stake && stake >= 1 && stake <= 10) {
      setNegotiatedStake(stake)
      setPot((stake * 2).toString())
      // Move to staking phase
      setGamePhase('staking')
    }
  }
  
  // === PHASE 2: STAKING HANDLERS ===
  const handleStakeLocked = (lockedGameId: number, stake: number) => {
    console.log('✅ Stake locked:', stake, 'PYUSD for game', lockedGameId)
    setIsStaked(true)
    // Move to gameplay phase after stake is locked
    setGamePhase('gameplay')
  }
  
  // === STRATEGIC 4x4 QUADRAX GAMEPLAY ===
  const handleCellClick = async (index: number) => {
    console.log('🎯 CELL CLICK: Player clicked cell', index)
    console.log('🎮 CELL CLICK: Game phase:', gamePhase, 'Current player:', currentPlayer)
    
    // 🚨 EMERGENCY WIN CHECK: Before processing any move, check if game should have ended
    console.log('🚨 CELL EMERGENCY: Testing for existing wins before processing click...')
    console.log('🎲 CELL EMERGENCY: Board:', board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
    
    if (checkWinner(board, 1)) {
      console.log('🏆 CELL EMERGENCY: Player 1 has ALREADY WON! Game should have ended!')
      setGamePhase('finished')
      setTimeout(() => {
        alert(`🎉 You win!${!isDemoMode ? `\n💰 Payout: ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD` : ''}`)
      }, 100)
      return
    }
    
    if (checkWinner(board, 2)) {
      console.log('🤖 CELL EMERGENCY: Player 2 has ALREADY WON! Game should have ended!')
      setGamePhase('finished')
      setTimeout(() => {
        alert('🤖 AI wins!')
      }, 100)
      return
    }
    
    console.log('✅ CELL EMERGENCY: No existing wins detected, proceeding with move...')
    
    if (gamePhase !== 'gameplay' || currentPlayer !== 1) return

    const player1Pieces = board.filter(cell => cell === 1).length
    const player2Pieces = board.filter(cell => cell === 2).length

    // PLACEMENT PHASE: Each player places 4 pieces
    if (placementPhase) {
      if (board[index] !== 0) return // Cell must be empty
      if (player1Pieces >= 4) return // Player already has 4 pieces

      const newBoard = [...board]
      newBoard[index] = 1 // Player 1 places X
      setBoard(newBoard)

      // 🤖 Send move to AI Referee for validation and auto-payout
      if (!isDemoMode && urlGameId) {
        const { submitMoveToReferee } = await import('@/lib/referee/client')
        const { PLATFORM_TREASURY } = await import('@/contracts/addresses')
        
        const moveData = {
          player: 1 as 1 | 2,
          type: 'placement' as 'placement' | 'movement',
          to: index,
          timestamp: Date.now()
        }
        
        const refereeResult = await submitMoveToReferee(
          urlGameId,
          moveData,
          address!,
          PLATFORM_TREASURY
        )
        
        if (refereeResult.winner) {
          console.log('🏆 REFEREE CONFIRMED WIN AND TRIGGERED PAYOUT!')
          setGamePhase('finished')
          setPayoutClaimed(true)
          setTimeout(() => {
            alert(`🎉 You win!\n💰 ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD automatically sent!\nTx: ${refereeResult.payoutHash}`)
          }, 100)
          return
        }
      }

      // Check for winner after placement (can win anytime during placement!)
      const newPlayer1Count = newBoard.filter(cell => cell === 1).length
      const newPlayer2Count = newBoard.filter(cell => cell === 2).length
      
      console.log('🎯 WIN CHECK: After player placement, checking for player 1 win...')
      console.log('🎲 WIN CHECK: Board:', newBoard.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
      
      if (checkWinner(newBoard, 1)) {
        console.log('🏆 PLAYER WINS! Game ending...')
        setGamePhase('finished')
        
        // Claim payout
        claimPayout('player1')
        
        // Delay alert to allow board to visually update
        setTimeout(() => {
          alert(`🎉 You win during placement!${!isDemoMode ? `\n💰 Claiming payout of ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD...` : ''}`)
        }, 100)
        return
      } else {
        console.log('❌ WIN CHECK: No win detected for player 1')
      }

      // Check if placement phase is complete
      if (newPlayer1Count === 4 && newPlayer2Count === 4) {
        setPlacementPhase(false)
      }

      // Switch to AI turn
      setCurrentPlayer(2)

      // Trigger AI placement after delay
      setTimeout(() => {
        makeAIPlacement(newBoard)
      }, 800)

    } else {
      // MOVEMENT PHASE: Select and move existing pieces
      if (selectedCell === null) {
        // First click: select a piece to move
        if (board[index] === 1) { // Only select player's own pieces
          setSelectedCell(index)
        }
      } else {
        // Second click: move the selected piece
        if (index === selectedCell) {
          // Clicking same cell deselects
          setSelectedCell(null)
          return
        }

        // Move the selected piece
        if (board[index] === 0) { // Can only move to empty cells
          const newBoard = [...board]
          newBoard[selectedCell] = 0 // Remove from old position
          newBoard[index] = 1 // Place in new position
          setBoard(newBoard)
          setSelectedCell(null)

          // 🤖 Send move to AI Referee for validation and auto-payout
          if (!isDemoMode && urlGameId) {
            const { submitMoveToReferee } = await import('@/lib/referee/client')
            const { PLATFORM_TREASURY } = await import('@/contracts/addresses')
            
            const moveData = {
              player: 1 as 1 | 2,
              type: 'movement' as 'placement' | 'movement',
              from: selectedCell,
              to: index,
              timestamp: Date.now()
            }
            
            const refereeResult = await submitMoveToReferee(
              urlGameId,
              moveData,
              address!,
              PLATFORM_TREASURY
            )
            
            if (refereeResult.winner) {
              console.log('🏆 REFEREE CONFIRMED WIN AND TRIGGERED PAYOUT!')
              setGamePhase('finished')
              setPayoutClaimed(true)
              setTimeout(() => {
                alert(`🎉 You win!\n💰 ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD automatically sent!\nTx: ${refereeResult.payoutHash}`)
              }, 100)
              return
            }
          }

          // Check for winner after movement
          console.log('🎯 WIN CHECK: After player movement, checking for player 1 win...')
          console.log('🎲 WIN CHECK: Board:', newBoard.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
          
          if (checkWinner(newBoard, 1)) {
            console.log('🏆 PLAYER WINS! Game ending...')
            setGamePhase('finished')
            
            // Claim payout
            claimPayout('player1')
            
            // Delay alert to allow board to visually update
            setTimeout(() => {
              alert(`🎉 You win!${!isDemoMode ? `\n💰 Claiming payout of ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD...` : ''}`)
            }, 100)
            return
          } else {
            console.log('❌ WIN CHECK: No win detected for player 1')
          }

          // Switch to AI turn
          setCurrentPlayer(2)

          // Trigger AI movement after delay
          setTimeout(() => {
            makeAIMovement(newBoard)
          }, 800)
        }
      }
    }
  }

  const checkWinner = (board: number[], player: number): boolean => {
    console.log(`🔍 WIN DETECTION: Starting checkWinner for player ${player}`)
    console.log(`🎲 WIN DETECTION: Board state:`, board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
    
    // Horizontal (4 rows)
    for (let row = 0; row < 4; row++) {
      const start = row * 4
      if (
        board[start] === player &&
        board[start + 1] === player &&
        board[start + 2] === player &&
        board[start + 3] === player
      ) {
        console.log(`🏆 WIN DETECTION: Found horizontal line for player ${player} at row ${row}:`, [start, start+1, start+2, start+3])
        return true
      }
    }

    // Vertical (4 columns)
    for (let col = 0; col < 4; col++) {
      if (
        board[col] === player &&
        board[col + 4] === player &&
        board[col + 8] === player &&
        board[col + 12] === player
      ) {
        console.log(`🏆 WIN DETECTION: Found vertical line for player ${player} at col ${col}:`, [col, col+4, col+8, col+12])
        return true
      }
    }

    // Diagonal (top-left to bottom-right)
    if (
      board[0] === player &&
      board[5] === player &&
      board[10] === player &&
      board[15] === player
    ) {
      console.log(`🏆 WIN DETECTION: Found diagonal (TL-BR) for player ${player}:`, [0, 5, 10, 15])
      return true
    }

    // Diagonal (top-right to bottom-left)
    if (
      board[3] === player &&
      board[6] === player &&
      board[9] === player &&
      board[12] === player
    ) {
      console.log(`🏆 WIN DETECTION: Found diagonal (TR-BL) for player ${player}:`, [3, 6, 9, 12])
      return true
    }

    // 2x2 squares (9 possible positions)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const topLeft = row * 4 + col
        if (
          board[topLeft] === player &&
          board[topLeft + 1] === player &&
          board[topLeft + 4] === player &&
          board[topLeft + 5] === player
        ) {
          console.log(`🏆 WIN DETECTION: Found 2x2 square for player ${player} at position ${topLeft}:`, [topLeft, topLeft+1, topLeft+4, topLeft+5])
          return true
        }
      }
    }

    console.log(`❌ WIN DETECTION: No win found for player ${player}`)
    return false
  }

  // AI Agent-Powered Move Selection
  const getAIMove = async (board: number[], phase: 'placement' | 'movement', availableMoves: number[]): Promise<number> => {
    console.log('🤖 AI Move Request:', { board, phase, availableMoves })
    
    // Prepare board analysis for AI agents
    const boardAnalysis = {
      board: board,
      phase: phase,
      playerPieces: board.filter(cell => cell === 1).length,
      aiPieces: board.filter(cell => cell === 2).length,
      availableMoves: availableMoves,
      winningPatterns: getWinningPatterns()
    }

    try {
      // Query Enhanced ASI Alliance (4 agents + Ollama fallback)
      const response = await fetch('/api/ai/strategic-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: board,
          phase: 'placement',
          currentPlayer: 2,
          placedPieces: { 1: board.filter(cell => cell === 1).length, 2: board.filter(cell => cell === 2).length }
        })
      })

      if (!response.ok) {
        console.error('❌ AI API Error:', response.status, response.statusText)
        // Fallback to first available move if API fails
        return availableMoves[0] || 0
      }

      const aiDecision = await response.json()
      console.log('🎯 ASI Alliance Decision:', aiDecision)
      
      // Track the ASI decision for UI display
      if (aiDecision.agent && aiDecision.reasoning) {
        setLastASIDecision({
          agent: aiDecision.agent,
          reasoning: aiDecision.reasoning,
          confidence: aiDecision.confidence || 0.8,
          move: aiDecision.move,
          timestamp: Date.now()
        })
      }
      
      // Validate the AI's move
      if (aiDecision.move !== undefined && availableMoves.includes(aiDecision.move)) {
        console.log(`✅ ${aiDecision.agent} Selected Move:`, aiDecision.move)
        console.log(`🧠 Reasoning: ${aiDecision.reasoning}`)
        return aiDecision.move
      } else {
        console.warn('⚠️ ASI Alliance returned invalid move:', aiDecision.move, 'Available:', availableMoves)
        return availableMoves[0] || 0
      }
    } catch (error) {
      console.error('💥 AI Request Failed:', error)
      // Fallback to first available move
      return availableMoves[0] || 0
    }
  }

  const getAIMovement = async (board: number[], aiPieces: number[]): Promise<{from: number, to: number} | null> => {
    console.log('🔄 AI Movement Request:', { board, aiPieces })
    console.log('🎲 CRITICAL DEBUG: Board state:', board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
    console.log('🤖 CRITICAL DEBUG: AI pieces (Player 2):', aiPieces)
    console.log('👤 CRITICAL DEBUG: Human pieces (Player 1):', board.map((cell, index) => cell === 1 ? index : null).filter(i => i !== null))
    
    // 🚨 CRITICAL: Position Abandonment Analysis
    console.log('🚨 ABANDONMENT CHECK: Analyzing if moving FROM any AI position enables opponent wins...')
    for (const aiPosition of aiPieces) {
      // Simulate AI piece leaving this position
      const testBoard = [...board]
      testBoard[aiPosition] = 0 // Remove AI piece temporarily
      
      // Check if opponent can win by moving to the abandoned position
      testBoard[aiPosition] = 1 // Test if player can win here
      
      if (checkWinner(testBoard, 1)) {
        console.log(`🚨 CRITICAL THREAT: If AI moves FROM position ${aiPosition}, player can win by moving TO position ${aiPosition}!`)
        console.log(`🛡️ BLOCKING ABANDONMENT: Position ${aiPosition} is FORBIDDEN to vacate!`)
        
        // Remove this position from possible moves
        aiPieces = aiPieces.filter(pos => pos !== aiPosition)
        console.log('🔒 PROTECTED POSITIONS: AI cannot move from position', aiPosition)
      } else {
        console.log(`✅ SAFE TO VACATE: Position ${aiPosition} can be safely abandoned`)
      }
      
      // Restore board
      testBoard[aiPosition] = 2
    }
    
    console.log('✅ ABANDONMENT ANALYSIS COMPLETE: Safe pieces to move:', aiPieces)
    
    // Get all possible moves
    const possibleMoves = []
    const emptySpaces = board.map((cell, index) => cell === 0 ? index : null).filter(i => i !== null) as number[]
    console.log('🎯 CRITICAL DEBUG: Empty spaces:', emptySpaces)
    
    for (const piece of aiPieces) {
      for (const target of emptySpaces) {
        possibleMoves.push({ from: piece, to: target })
      }
    }

    console.log('🎯 Possible AI Movements:', possibleMoves.length, 'options')
    console.log('🎯 CRITICAL DEBUG: Sample moves:', possibleMoves.slice(0, 5).map(m => `${m.from}→${m.to}`).join(', '))

    // Check if any moves are possible after abandonment filtering
    if (possibleMoves.length === 0) {
      console.log('🚨 NO SAFE MOVES: All AI positions are required to block opponent wins!')
      console.log('🏃 EMERGENCY: AI cannot move without allowing player to win')
      return null
    }

    try {
      // Query Enhanced ASI Alliance for movement
      const response = await fetch('/api/ai/strategic-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: board,
          phase: 'movement',
          currentPlayer: 2,
          placedPieces: { 1: board.filter(cell => cell === 1).length, 2: board.filter(cell => cell === 2).length },
          safePieces: aiPieces  // 🚨 CRITICAL: Send only the safe pieces that can be moved
        })
      })

      if (!response.ok) {
        console.error('❌ AI Movement API Error:', response.status)
        return possibleMoves.length > 0 ? possibleMoves[0] : null
      }

      const aiDecision = await response.json()
      console.log('🎯 AI Movement Response:', aiDecision)
      
      if (aiDecision.move && typeof aiDecision.move === 'object' && 'from' in aiDecision.move) {
        console.log('✅ ASI Alliance Selected Movement:', aiDecision.move)
        console.log('🧠 Decision by:', aiDecision.agent, '- Confidence:', aiDecision.confidence)
        return aiDecision.move
      } else {
        console.warn('⚠️ ASI Alliance returned invalid movement, using fallback')
        return possibleMoves.length > 0 ? possibleMoves[0] : null
      }
    } catch (error) {
      console.error('💥 AI Movement Request Failed:', error)
      return possibleMoves.length > 0 ? possibleMoves[0] : null
    }
  }

  const makeAIPlacement = async (currentBoard: number[]) => {
    console.log('🤖 AI Placement Turn Started')
    console.log('🔍 DEBUG - Current board passed to makeAIPlacement:', currentBoard)
    
    // 🚨 EMERGENCY WIN CHECK: Before AI does anything, check if game should have ended
    console.log('🚨 EMERGENCY CHECK: Testing for existing wins before AI move...')
    console.log('🎲 EMERGENCY: Board:', currentBoard.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
    
    if (checkWinner(currentBoard, 1)) {
      console.log('🏆 EMERGENCY: Player 1 has ALREADY WON! Game should have ended!')
      setGamePhase('finished')
      setTimeout(() => {
        alert(`🎉 You win!${!isDemoMode ? `\n💰 Payout: ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD` : ''}`)
      }, 100)
      return
    }
    
    if (checkWinner(currentBoard, 2)) {
      console.log('🤖 EMERGENCY: Player 2 has ALREADY WON! Game should have ended!')
      setGamePhase('finished')
      setTimeout(() => {
        alert('🤖 AI wins!')
      }, 100)
      return
    }
    
    console.log('✅ EMERGENCY: No existing wins detected, proceeding with AI turn...')
    
    console.log('🎨 DEBUG - Board visualization:')
    for (let i = 0; i < 4; i++) {
      const row = currentBoard.slice(i * 4, (i + 1) * 4)
        .map((cell) => cell === 0 ? '_' : cell === 1 ? 'X' : 'O')
        .join(' ')
      console.log(`   Row ${i}: ${row}`)
    }
    console.log('🔍 DEBUG - X positions:', currentBoard.map((cell, i) => cell === 1 ? i : -1).filter(i => i !== -1))
    console.log('🔍 DEBUG - O positions:', currentBoard.map((cell, i) => cell === 2 ? i : -1).filter(i => i !== -1))
    
    const availableMoves = currentBoard.map((cell, index) => cell === 0 ? index : null).filter(i => i !== null) as number[]
    console.log('📍 Available placement moves:', availableMoves)
    if (availableMoves.length === 0) return

    const aiMove = await getAIMove(currentBoard, 'placement', availableMoves)
    console.log('🎯 AI Selected Position:', aiMove)

    const newBoard = [...currentBoard]
    newBoard[aiMove] = 2 // AI places O
    setBoard(newBoard)

    // 🤖 Send AI move to Referee for validation and auto-payout
    if (!isDemoMode && urlGameId && address) {
      const { submitMoveToReferee } = await import('@/lib/referee/client')
      const { PLATFORM_TREASURY } = await import('@/contracts/addresses')
      
      const moveData = {
        player: 2 as 1 | 2,
        type: 'placement' as 'placement' | 'movement',
        to: aiMove,
        timestamp: Date.now()
      }
      
      const refereeResult = await submitMoveToReferee(
        urlGameId,
        moveData,
        address,
        PLATFORM_TREASURY
      )
      
      if (refereeResult.winner) {
        console.log('🏆 REFEREE CONFIRMED AI WIN AND TRIGGERED PAYOUT!')
        setGamePhase('finished')
        setPayoutClaimed(true)
        setTimeout(() => {
          alert(`🤖 AI wins!\n💰 ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD automatically sent to AI!\nTx: ${refereeResult.payoutHash}`)
        }, 100)
        return
      }
    }

    // Check for AI winner (can win anytime during placement!)
    const finalPlayer1Count = newBoard.filter(cell => cell === 1).length
    const finalPlayer2Count = newBoard.filter(cell => cell === 2).length
    
    console.log('🎯 WIN CHECK: After AI placement, checking for AI win...')
    console.log('🎲 WIN CHECK: Board:', newBoard.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
    
    if (checkWinner(newBoard, 2)) {
      console.log('🤖 AI WINS! Game ending...')
      setGamePhase('finished')
      
      // Claim payout for AI
      claimPayout('player2')
      
      // Delay alert to allow board to visually update
      setTimeout(() => {
        alert('🤖 AI wins during placement!')
      }, 100)
      return
    } else {
      console.log('❌ WIN CHECK: No win detected for AI')
    }
    
    // Also check if player won (in case of race condition)
    if (checkWinner(newBoard, 1)) {
      console.log('🏆 PLAYER WINS! (Detected after AI move) Game ending...')
      setGamePhase('finished')
      setTimeout(() => {
        alert(`🎉 You win!${!isDemoMode ? `\n💰 Payout: ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD` : ''}`)
      }, 100)
      return
    }

    // Check if placement phase is complete
    if (finalPlayer1Count === 4 && finalPlayer2Count === 4) {
      setPlacementPhase(false)
    }

    // Switch back to player
    setCurrentPlayer(1)
  }

  const makeAIMovement = async (currentBoard: number[]) => {
    console.log('🚀 AI Movement Turn Started')
    const aiPieces = currentBoard.map((cell, index) => cell === 2 ? index : null).filter(i => i !== null) as number[]
    console.log('🔍 AI Pieces on board:', aiPieces)
    if (aiPieces.length === 0) return

    const aiMovement = await getAIMovement(currentBoard, aiPieces)
    console.log('➡️ AI Movement Decision:', aiMovement)
    if (!aiMovement) return

    const newBoard = [...currentBoard]
    newBoard[aiMovement.from] = 0 // Remove from old position
    newBoard[aiMovement.to] = 2 // Place in new position
    setBoard(newBoard)

    // 🤖 Send AI move to Referee for validation and auto-payout
    if (!isDemoMode && urlGameId && address) {
      const { submitMoveToReferee } = await import('@/lib/referee/client')
      const { PLATFORM_TREASURY } = await import('@/contracts/addresses')
      
      const moveData = {
        player: 2 as 1 | 2,
        type: 'movement' as 'placement' | 'movement',
        from: aiMovement.from,
        to: aiMovement.to,
        timestamp: Date.now()
      }
      
      const refereeResult = await submitMoveToReferee(
        urlGameId,
        moveData,
        address,
        PLATFORM_TREASURY
      )
      
      if (refereeResult.winner) {
        console.log('🏆 REFEREE CONFIRMED AI WIN AND TRIGGERED PAYOUT!')
        setGamePhase('finished')
        setPayoutClaimed(true)
        setTimeout(() => {
          alert(`🤖 AI wins!\n💰 ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD automatically sent to AI!\nTx: ${refereeResult.payoutHash}`)
        }, 100)
        return
      }
    }

    // Check for AI winner
    console.log('🎯 WIN CHECK: After AI movement, checking for AI win...')
    console.log('🎲 WIN CHECK: Board:', newBoard.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))
    
    if (checkWinner(newBoard, 2)) {
      console.log('🤖 AI WINS! Game ending...')
      setGamePhase('finished')
      
      // Claim payout for AI
      claimPayout('player2')
      
      // Delay alert to allow board to visually update
      setTimeout(() => {
        alert('🤖 AI wins!')
      }, 100)
      return
    } else {
      console.log('❌ WIN CHECK: No win detected for AI')
    }
    
    // Also check if player won (in case of race condition)
    if (checkWinner(newBoard, 1)) {
      console.log('🏆 PLAYER WINS! (Detected after AI movement) Game ending...')
      setGamePhase('finished')
      setTimeout(() => {
        alert(`🎉 You win!${!isDemoMode ? `\n💰 Payout: ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD` : ''}`)
      }, 100)
      return
    }

    // Switch back to player
    setCurrentPlayer(1)
  }

  const getWinningPatterns = () => {
    return [
      // Horizontal
      [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
      // Vertical  
      [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
      // Diagonal
      [0,5,10,15], [3,6,9,12],
      // 2x2 Squares
      [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], 
      [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]
    ]
  }

  const findWinningMove = (board: number[], player: number): number | null => {
    const patterns = getWinningPatterns()
    
    for (const pattern of patterns) {
      const cells = pattern.map(i => board[i])
      const playerCount = cells.filter(cell => cell === player).length
      const emptyCount = cells.filter(cell => cell === 0).length
      
      // If 3 pieces and 1 empty, that's a winning move
      if (playerCount === 3 && emptyCount === 1) {
        const emptyIndex = pattern[cells.indexOf(0)]
        return emptyIndex
      }
    }
    
    return null
  }

  const handleReset = () => {
    setBoard(Array(16).fill(0))
    setCurrentPlayer(1)
    setGamePhase('negotiation')
    setIsStaked(false)
    setPot('0')
    setNegotiatedStake(null)
    setIsDemoMode(false)
    setSelectedCell(null)
    setPlacementPhase(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-bold">QuadraX</span>
              <span className="text-sm text-white/60">Game Room</span>
            </Link>
            <ConnectButton showBalance={false} />
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* === Apple-style PHASE INDICATOR === */}
          <div className="lg:col-span-3 mb-8">
            <div className="glass-thick rounded-3xl p-6 relative overflow-hidden">
              {/* Subtle top highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <div className="flex items-center justify-center gap-6 relative z-10">
                {/* Phase 1: Negotiation */}
                <div className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 ${
                  gamePhase === 'negotiation' 
                    ? 'glass-regular border-2 border-blue-400/50 shadow-lg scale-105' 
                    : gamePhase === 'staking' || gamePhase === 'gameplay' || gamePhase === 'finished'
                    ? 'glass-ultra-thin border border-green-400/30'
                    : 'glass-ultra-thin border border-white/10'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    gamePhase === 'negotiation'
                      ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg animate-pulse'
                      : gamePhase === 'staking' || gamePhase === 'gameplay' || gamePhase === 'finished'
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : 'bg-white/10'
                  }`}>
                    <span className="text-lg">{gamePhase === 'negotiation' ? '🤖' : '✅'}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Negotiation</div>
                    <div className="text-xs text-white/60">AI Chat Setup</div>
                  </div>
                </div>

                {/* Connection line */}
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 via-white/40 to-white/20 relative">
                  <div className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full transition-all ${
                    gamePhase === 'staking' || gamePhase === 'gameplay' || gamePhase === 'finished'
                      ? 'bg-green-400 shadow-lg left-full animate-pulse'
                      : 'bg-white/40 left-0'
                  }`}></div>
                </div>

                {/* Phase 2: Staking */}
                <div className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 ${
                  gamePhase === 'staking' 
                    ? 'glass-regular border-2 border-purple-400/50 shadow-lg scale-105' 
                    : gamePhase === 'gameplay' || gamePhase === 'finished'
                    ? 'glass-ultra-thin border border-green-400/30'
                    : 'glass-ultra-thin border border-white/10'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    gamePhase === 'staking'
                      ? 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg animate-pulse'
                      : gamePhase === 'gameplay' || gamePhase === 'finished'
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : 'bg-white/10'
                  }`}>
                    <span className="text-lg">
                      {gamePhase === 'staking' ? '💰' : 
                       gamePhase === 'gameplay' || gamePhase === 'finished' ? '✅' : '🔒'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      Staking
                      {isDemoMode && (gamePhase === 'gameplay' || gamePhase === 'finished') && (
                        <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 
                                       text-black px-2 py-0.5 rounded-full font-bold">DEMO</span>
                      )}
                    </div>
                    <div className="text-xs text-white/60">Lock PYUSD</div>
                  </div>
                </div>

                {/* Connection line */}
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 via-white/40 to-white/20 relative">
                  <div className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full transition-all ${
                    gamePhase === 'gameplay' || gamePhase === 'finished'
                      ? 'bg-green-400 shadow-lg left-full animate-pulse'
                      : 'bg-white/40 left-0'
                  }`}></div>
                </div>

                {/* Phase 3: Gameplay */}
                <div className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 ${
                  gamePhase === 'gameplay' 
                    ? 'glass-regular border-2 border-green-400/50 shadow-lg scale-105' 
                    : gamePhase === 'finished'
                    ? 'glass-regular border-2 border-yellow-400/50 shadow-lg'
                    : 'glass-ultra-thin border border-white/10'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    gamePhase === 'gameplay'
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg animate-pulse'
                      : gamePhase === 'finished'
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                      : 'bg-white/10'
                  }`}>
                    <span className="text-lg">
                      {gamePhase === 'gameplay' ? '🎮' : gamePhase === 'finished' ? '🏆' : '⏳'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {gamePhase === 'finished' ? 'Complete' : 'Gameplay'}
                    </div>
                    <div className="text-xs text-white/60">Strategic Battle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Panel - Game Info */}
          <div className="space-y-6">
            <GameInfo
              currentPlayer={currentPlayer}
              player1Address="0x1234...5678"
              player2Address="0x8765...4321"
              pot={pot}
              gameStatus={gamePhase === 'gameplay' ? 'playing' : gamePhase === 'finished' ? 'finished' : 'waiting'}
            />

            {/* Phase-specific panels */}
            {gamePhase === 'staking' && negotiatedStake && urlGameId && (
              <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold mb-4">💰 Stake Confirmation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Agreed Stake:</span>
                    <span className="font-bold text-green-400">{negotiatedStake} PYUSD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Pot:</span>
                    <span className="font-bold">{negotiatedStake * 2} PYUSD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Platform Fee:</span>
                    <span>0.25%</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                    <span className="text-white/60">Winner Gets:</span>
                    <span className="font-bold text-blue-400">{(negotiatedStake * 2 * 0.9975).toFixed(4)} PYUSD</span>
                  </div>
                </div>
                
                {/* Staking Action Panel */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  {!isStaked ? (
                    <button
                      onClick={async () => {
                        try {
                          console.log('🎯 Starting staking process...')
                          console.log('   Game ID:', urlGameId)
                          console.log('   Stake Amount:', negotiatedStake)
                          console.log('   Escrow ID:', urlEscrowId)
                          
                          if (!address) {
                            alert('Please connect your wallet first')
                            return
                          }
                          
                          // Use EscrowCoordinator for dual-chain staking
                          const { getEscrowCoordinator } = await import('@/lib/escrow/EscrowCoordinator')
                          const coordinator = getEscrowCoordinator()
                          
                          await coordinator.depositStake(
                            urlGameId,
                            urlEscrowId || '',
                            address,
                            negotiatedStake.toString()
                          )
                          
                          setIsStaked(true)
                          setGamePhase('gameplay')
                          console.log('✅ Staking complete!')
                          alert('✅ Staking successful! Game starting...')
                        } catch (error: any) {
                          console.error('❌ Staking failed:', error)
                          
                          // Better error messages
                          if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
                            alert('❌ Transaction rejected in MetaMask. Please try again and click "Confirm".')
                          } else if (error.message?.includes('insufficient')) {
                            alert('❌ Insufficient PYUSD balance. You need ' + negotiatedStake + ' PYUSD.')
                          } else if (error.message?.includes('allowance')) {
                            alert('❌ Approval failed. Please approve PYUSD spending first.')
                          } else {
                            alert('❌ Staking failed: ' + error.message)
                          }
                        }
                      }}
                      className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-blue-600
                               font-semibold btn-hover text-white"
                    >
                      💰 Approve & Stake {negotiatedStake} PYUSD
                    </button>
                  ) : (
                    <div className="text-center py-3 text-green-400">
                      ✅ Stake Confirmed! Starting game...
                    </div>
                  )}
                </div>
              </div>
            )}

            {gamePhase === 'finished' && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 text-green-400">🎉 Game Over!</h3>
                <button
                  onClick={handleReset}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-blue-600
                           font-semibold btn-hover"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Center - Game Board */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* ASI Alliance Decision Display */}
              {lastASIDecision && currentPlayer === 2 && (
                <div className="mb-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-xl 
                              border border-purple-400/30 rounded-2xl p-4 glass-effect">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      🤖 <span className="text-purple-300">ASI Alliance</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-200 text-sm font-medium">{lastASIDecision.agent}</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-white text-sm mb-2 leading-relaxed">
                      <span className="text-purple-300 font-semibold">💭 Reasoning:</span> {lastASIDecision.reasoning}
                    </p>
                    <div className="flex justify-between items-center text-xs text-purple-200 pt-2 border-t border-white/10">
                      <span className="font-medium">🎯 Move: Position {lastASIDecision.move}</span>
                      <span className="font-medium">📊 Confidence: {Math.round(lastASIDecision.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}

              <Board
                board={board}
                onCellClick={handleCellClick}
                currentPlayer={currentPlayer}
                disabled={gamePhase !== 'gameplay'}
                selectedCell={selectedCell}
                gamePhase={placementPhase ? 'placement' : 'movement'}
                piecesPlaced={{
                  player1: board.filter(cell => cell === 1).length,
                  player2: board.filter(cell => cell === 2).length
                }}
              />

              {/* Phase status message */}
              <div className="mt-4 glass rounded-xl p-4 text-center">
                {gamePhase === 'negotiation' && (
                  <div className="space-y-3">
                    <p className="text-sm text-white/80">
                      💬 <strong>Step 1:</strong> Chat with AI to negotiate stakes or try demo mode
                    </p>
                    
                    {/* Apple-style Demo Button */}
                    <div className="pt-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
                      <button
                        onClick={() => {
                          console.log('Demo button clicked!')
                          handleNegotiationComplete(null, true)
                        }}
                        className="btn-primary w-full py-4 px-6 rounded-2xl font-semibold text-lg relative overflow-hidden group 
                                 cursor-pointer z-10"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-2xl group-hover:animate-bounce">🎮</span>
                          <span>Start Demo Game</span>
                        </div>
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-shimmer group-hover:translate-x-full 
                                      bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                      transition-transform duration-1000 pointer-events-none"></div>
                      </button>
                      
                      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/60">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                          <span>Skip negotiation</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          <span>No stakes required</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                          <span>Instant play</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {gamePhase === 'staking' && (
                  <p className="text-sm text-white/80">
                    🔐 <strong>Step 2:</strong> Confirm stake and lock PYUSD in smart contract
                  </p>
                )}
                {gamePhase === 'gameplay' && (
                  <p className="text-sm text-green-400">
                    🎮 <strong>Playing!</strong> Make your moves - AI is watching
                  </p>
                )}
                {gamePhase === 'finished' && (
                  <p className="text-sm text-yellow-400">
                    🏆 <strong>Game Complete!</strong> Check results above
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Game Strategy & AI */}
          <div className="space-y-6">
            {/* Compact QuadraX Rules */}
            <div className="glass-thick rounded-2xl overflow-hidden border border-white/20 relative">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 
                                  flex items-center justify-center shadow-lg">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">QuadraX Rules</h3>
                    <p className="text-xs text-white/70">4×4 Strategic Battle</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Compact Game Flow */}
                <div className="flex items-center justify-between glass-ultra-thin rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-400/20 flex items-center justify-center">
                      <span className="text-xs">🔹</span>
                    </div>
                    <span className="text-sm text-white/90">Place 4 pieces</span>
                  </div>
                  <span className="text-white/40">→</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-400/20 flex items-center justify-center">
                      <span className="text-xs">🔄</span>
                    </div>
                    <span className="text-sm text-white/90">Move freely</span>
                  </div>
                </div>

                {/* Win Patterns Grid */}
                <div>
                  <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></span>
                    Win Patterns
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* 4-in-Row Pattern */}
                    <div className="glass-ultra-thin rounded-xl p-3 group hover:scale-105 transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-cyan-400">4-in-Row</span>
                        <span className="text-xs text-white/60">→</span>
                      </div>
                      <div className="grid grid-cols-4 gap-0.5 mb-2">
                        {[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0].map((cell, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-sm transition-all ${
                            cell === 1 
                              ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm group-hover:shadow-lg' 
                              : 'bg-white/10'
                          }`}></div>
                        ))}
                      </div>
                      <p className="text-xs text-white/70">H • V • D</p>
                    </div>
                    
                    {/* 2×2 Block Pattern */}
                    <div className="glass-ultra-thin rounded-xl p-3 group hover:scale-105 transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-400">2×2 Block</span>
                        <span className="text-xs text-white/60">⬛</span>
                      </div>
                      <div className="grid grid-cols-4 gap-0.5 mb-2">
                        {[1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0].map((cell, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-sm transition-all ${
                            cell === 1 
                              ? 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-sm group-hover:shadow-lg' 
                              : 'bg-white/10'
                          }`}></div>
                        ))}
                      </div>
                      <p className="text-xs text-white/70">Any position</p>
                    </div>
                  </div>
                </div>

                {/* Live Game Status */}
                {gamePhase === 'gameplay' && (
                  <div className="glass-ultra-thin rounded-xl p-3 border border-green-400/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        Live Game
                      </h4>
                      <div className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 
                                    border border-yellow-400/30 text-yellow-400 font-medium">
                        {placementPhase ? 'Placement' : 'Movement'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {/* Player X Stats */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 
                                        flex items-center justify-center shadow-md">
                          <span className="text-xs text-white font-bold">X</span>
                        </div>
                        <div className="text-xs">
                          <div className="text-cyan-400 font-semibold">Player</div>
                          <div className="text-white/70">{board.filter(cell => cell === 1).length}/4</div>
                        </div>
                      </div>
                      
                      <div className="text-white/30">vs</div>
                      
                      {/* AI O Stats */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-400 to-red-500 
                                        flex items-center justify-center shadow-md">
                          <span className="text-xs text-white font-bold">O</span>
                        </div>
                        <div className="text-xs">
                          <div className="text-pink-400 font-semibold">AI</div>
                          <div className="text-white/70">{board.filter(cell => cell === 2).length}/4</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced ASI Alliance Status */}
                {gamePhase === 'gameplay' && (
                  <div className="glass-ultra-thin rounded-xl p-3 border border-purple-400/30 mt-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                        ASI Alliance Active
                      </h4>
                      <div className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 
                                    border border-purple-400/30 text-purple-400 font-medium">
                        4 Agents
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {/* Alpha Agent */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">α</span>
                        </div>
                        <div className="text-xs">
                          <div className="text-blue-400 font-semibold">Alpha</div>
                          <div className="text-white/60">Strategic</div>
                        </div>
                      </div>
                      
                      {/* Beta Agent */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">β</span>
                        </div>
                        <div className="text-xs">
                          <div className="text-green-400 font-semibold">Beta</div>
                          <div className="text-white/60">Defensive</div>
                        </div>
                      </div>
                      
                      {/* Gamma Agent */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">γ</span>
                        </div>
                        <div className="text-xs">
                          <div className="text-red-400 font-semibold">Gamma</div>
                          <div className="text-white/60">Aggressive</div>
                        </div>
                      </div>
                      
                      {/* Delta Agent */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">δ</span>
                        </div>
                        <div className="text-xs">
                          <div className="text-yellow-400 font-semibold">Delta</div>
                          <div className="text-white/60">Adaptive</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-purple-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                        <span>Ollama + Llama 3.2 Ready</span>
                      </div>
                      <div className="text-white/50">Referee: Active</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stake Negotiation Chat */}
            <StakeNegotiationChat 
              aiName="PYUSD Stake Advisor" 
              enabled={true}
              gameId={gameId.toString()}
              gamePosition={gamePhase === 'gameplay' ? gamePosition : undefined}
              stakingContext={stakingContext}
              onStakeLocked={(stake: number) => handleStakeLocked(gameId, stake)}
              onNegotiationComplete={handleNegotiationComplete}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-sm text-white/60">
            Built for ETHOnline 2025 | PYUSD × ASI × Hedera
          </p>
        </div>
      </footer>
    </div>
  )
}
