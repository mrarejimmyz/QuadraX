'use client'

import React, { useState, useRef, useEffect } from 'react'
import { QuadraXAgent, QuadraXAgentFactory, PlayerProfile, PYUSDStakeContext as AgentPYUSDStakeContext, GamePosition as AgentGamePosition } from '../../lib/agents/quadraXAgent'
import { StakeConfirmation } from '../../components/StakeConfirmation'
import { useAccount } from 'wagmi'
import { useStakeNegotiation } from '../../hooks/useStakeNegotiation'

interface Message {
  id: number
  sender: 'ai' | 'user' | 'agent'
  text: string
  timestamp: Date
  agentName?: string
  confidence?: number
  reasoning?: string
  proposedStake?: number  // For negotiation messages
}

interface GamePosition {
  board: number[]
  phase: 'placement' | 'movement'
  piecesPlaced: { player1: number, player2: number }
  currentPlayer: number
}

interface PYUSDStakeContext {
  playerBalance: number
  opponentBalance: number
  minStake: number
  maxStake: number
  standardStake: number
  gameId?: string
}

interface AIChatProps {
  aiName?: string
  enabled?: boolean
  gameId?: string
  gamePosition?: GamePosition
  stakingContext?: PYUSDStakeContext
  onStakeLocked?: (gameId: number, stake: number) => void
  onNegotiationComplete?: (stake: number | null, demoMode: boolean) => void // New: emit when negotiation phase completes
}

export default function AIChat({ 
  aiName = 'QuadraX AI', 
  enabled = true, 
  gameId = 'demo-game',
  gamePosition,
  stakingContext,
  onStakeLocked,
  onNegotiationComplete
}: AIChatProps) {
  const { address } = useAccount()
  const stakeHook = useStakeNegotiation()
  const [agents, setAgents] = useState<QuadraXAgent[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [negotiatedStake, setNegotiatedStake] = useState<number | null>(null)
  const [opponentAddress, setOpponentAddress] = useState<string>('0x0000000000000000000000000000000000000000')
  const [activeMode, setActiveMode] = useState<'chat' | 'analysis' | 'negotiation' | 'strategy'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize QuadraX agents with proper configurations
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        // Create diverse QuadraX agents using factory methods
        const agentList: QuadraXAgent[] = [
          QuadraXAgentFactory.createStrategicAnalyst('AlphaStrategist', '0.0.3001', 'strategic-key'),
          QuadraXAgentFactory.createDefensiveExpert('BetaDefender', '0.0.3002', 'defensive-key'),
          QuadraXAgentFactory.createAggressiveTrader('GammaAggressor', '0.0.3003', 'aggressive-key'),
          QuadraXAgentFactory.createAdaptivePlayer('DeltaEvolver', '0.0.3004', 'adaptive-key')
        ]

        // Verify Ollama connections
        const connectedAgents: QuadraXAgent[] = []
        for (const agent of agentList) {
          try {
            const connected = await agent.checkOllamaConnection()
            if (connected) {
              connectedAgents.push(agent)
            }
          } catch (error) {
            console.warn(`Agent ${agent.name} connection failed:`, error)
          }
        }
        
        setAgents(connectedAgents)
        
        const welcomeMessage: Message = {
          id: Date.now(),
          sender: 'ai',
          text: `🎮 QuadraX AI System Ready

${connectedAgents.length} intelligent agents online. Ready to negotiate!

**To get started:**
• Say "Let's play for 6 PYUSD" to negotiate stakes (1-10 PYUSD)
• Say "demo" or "free play" to try without stakes
• Ask "help" for more options

What would you like to do?`,
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
        
      } catch (error) {
        console.error('Failed to initialize QuadraX agents:', error)
        const errorMessage: Message = {
          id: Date.now(),
          sender: 'ai',
          text: '⚠️ QuadraX AI agents are currently offline. Please ensure Ollama is running with llama3.2:latest model.',
          timestamp: new Date()
        }
        setMessages([errorMessage])
      }
    }
    
    initializeAgents()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle different AI commands
  const handleAICommand = async (command: string) => {
    setIsProcessing(true)
    
    // Check for DEMO/FREE PLAY mode keywords (highest priority)
    const lowerCommand = command.toLowerCase()
    if (lowerCommand.includes('demo') || 
        lowerCommand.includes('free') || 
        lowerCommand.includes('practice') ||
        lowerCommand.includes('no stake') ||
        lowerCommand.includes('without money')) {
      
      const demoMessage: Message = {
        id: Date.now(),
        sender: 'ai',
        text: `🎮 Perfect! Let's play a demo game with no stakes. 

You can experience the full QuadraX gameplay without risking any PYUSD. Starting the game now!`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, demoMessage])
      
      // Trigger demo mode
      if (onNegotiationComplete) {
        setTimeout(() => {
          onNegotiationComplete(null, true)
        }, 1500)
      }
      
      setIsProcessing(false)
      return
    }
    
    // CRITICAL: Validate stake bounds BEFORE AI processing (1-10 PYUSD only)
    const ABSOLUTE_MIN_STAKE = 1;
    const ABSOLUTE_MAX_STAKE = 10;
    
    // Extract any PYUSD amounts from user message
    const stakeMatch = command.match(/(\d+(?:\.\d+)?)\s*(?:PYUSD|pyusd)/i);
    if (stakeMatch) {
      const proposedStake = parseFloat(stakeMatch[1]);
      
      // Enforce strict bounds - reject anything outside 1-10 PYUSD
      if (proposedStake < ABSOLUTE_MIN_STAKE || proposedStake > ABSOLUTE_MAX_STAKE) {
        const boundaryMessage: Message = {
          id: Date.now(),
          sender: 'ai',
          text: `⚠️ Stakes must be between ${ABSOLUTE_MIN_STAKE} and ${ABSOLUTE_MAX_STAKE} PYUSD only. ${
            proposedStake < ABSOLUTE_MIN_STAKE 
              ? `Your ${proposedStake} PYUSD is below the minimum of ${ABSOLUTE_MIN_STAKE} PYUSD.`
              : `Your ${proposedStake} PYUSD exceeds the maximum of ${ABSOLUTE_MAX_STAKE} PYUSD.`
          } \n\nPlease propose a valid stake amount, or say "demo" for free play.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, boundaryMessage]);
        setIsProcessing(false);
        return;
      }
    }
    
    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: command,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Mock data for agent interactions
    const mockOpponent: PlayerProfile = {
      address: '0x123456789abcdef',
      gamesPlayed: 25,
      winRate: 0.72,
      averageStake: 8.5,
      preferredStrategy: 'adaptive',
      stakingPattern: 'moderate',
      gameHistory: []
    }
    
    const mockPyusdContext = {
      minStake: 1,
      maxStake: 10,
      platformFee: 0.25,
      gasEstimate: 0.001,
      playerBalance: 100,
      opponentBalance: 80,
      marketConditions: 'stable' as const
    }

    try {
      if (command.toLowerCase().includes('help')) {
        // Use real AI agent for help if available, otherwise static response
        if (agents.length > 0) {
          const agent = agents[0]
          try {
            // Get a real AI-powered help response through analysis
            const helpAnalysis = await agent.analyzeQuadraXPosition(
              {
                board: Array(16).fill(0),
                phase: 'placement',
                player1Pieces: 0,
                player2Pieces: 0,
                currentPlayer: 1,
                possibleMoves: Array.from({length: 16}, (_, i) => i),
                threatLevel: 'low'
              },
              mockOpponent,
              mockPyusdContext
            )
            
            const aiHelpMessage: Message = {
              id: Date.now() + 1,
              sender: 'agent',
              text: `I'm an intelligent AI that can negotiate, strategize, and play QuadraX with you.

Natural conversation works best! Try:
• "Let's negotiate a 15 PYUSD stake"
• "What do you think about this position?"
• "Should I play aggressive or defensive?"
• "Let's start a game with 20 PYUSD stakes"

Or use commands: analyze | stake | move | agents | negotiate

I'll respond naturally using Llama 3.2!`,
              timestamp: new Date(),
              agentName: agent.name
            }
            setMessages(prev => [...prev, aiHelpMessage])
          } catch (error) {
            // Fallback to static help
            console.warn('AI help generation failed, using static help')
            const staticHelpMessage: Message = {
              id: Date.now() + 1,
              sender: 'ai',
              text: `Commands: analyze | stake | move | agents | help`,
              timestamp: new Date()
            }
            setMessages(prev => [...prev, staticHelpMessage])
          }
        } else {
          const staticHelpMessage: Message = {
            id: Date.now() + 1,
            sender: 'ai',
            text: `Commands: analyze | stake | agents | help
(AI agents offline - restart to load)`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, staticHelpMessage])
        }
      }
      else if (command.toLowerCase().includes('agents')) {
        const agentMessage: Message = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Active AI Agents (${agents.length}/4):

${agents.map((agent, index) => 
  `${index + 1}. ${agent.name} - ${agent.personality.riskProfile}`
).join('\n')}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, agentMessage])
      }
      else if (command.toLowerCase().includes('analyze') && gamePosition) {
        if (agents.length > 0) {
          const agent = agents[0] // Use first available agent
          
          // Convert GamePosition to AgentGamePosition format
          const agentGamePosition: AgentGamePosition = {
            board: gamePosition.board,
            phase: 'placement', // Default to placement phase
            player1Pieces: gamePosition.board.filter(cell => cell === 1).length,
            player2Pieces: gamePosition.board.filter(cell => cell === 2).length,
            currentPlayer: (gamePosition.currentPlayer === 1 ? 1 : 2) as 1 | 2,
            possibleMoves: gamePosition.board.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1),
            threatLevel: 'medium'
          }
          
          const analysis = await agent.analyzeQuadraXPosition(
            agentGamePosition,
            mockOpponent,
            mockPyusdContext
          )
          
          const analysisMessage: Message = {
            id: Date.now() + 1,
            sender: 'agent',
            text: `Interesting position. I'm seeing a ${analysis.winProbability}% win probability for you.

${analysis.reasoning.substring(0, 180)}

My strategy recommendation: ${analysis.phaseStrategy}. The threat level is ${analysis.threatAssessment}. Should we discuss your next move?`,
            timestamp: new Date(),
            agentName: agent.name,
            confidence: analysis.confidence
          }
          setMessages(prev => [...prev, analysisMessage])
        }
      }
      // Enhanced staking queries - handle natural language
      else if (command.toLowerCase().includes('stake') || 
               command.toLowerCase().includes('how much') || 
               command.toLowerCase().includes('cost') ||
               command.toLowerCase().includes('price') ||
               command.toLowerCase().includes('pyusd') ||
               command.toLowerCase().includes('money')) {
        
        if (agents.length > 0) {
          const agent = agents[Math.floor(Math.random() * agents.length)] // Random agent
          
          // Use real Ollama AI for natural language staking queries
          if (command.toLowerCase().includes('how much') || 
              command.toLowerCase().includes('cost') || 
              command.toLowerCase().includes('price')) {
            
            try {
              // Use real Ollama AI through the agent's calculateQuadraXStake method
              // This will give us a real AI-powered response with reasoning
              const stakeCalc = await agent.calculateQuadraXStake(
                0.65, // Estimated win probability for general query
                mockOpponent,
                mockPyusdContext,
                { 
                  isRankedMatch: false,
                  tournamentMultiplier: 1,
                  timeRemaining: 300
                }
              )
              
              const realAIMessage: Message = {
                id: Date.now() + 1,
                sender: 'agent',
                text: `${agent.name} here. After analyzing the matchup, I'm thinking ${stakeCalc.recommendedStake} PYUSD is the sweet spot.

Here's my reasoning: ${stakeCalc.reasoning.substring(0, 200)}

I'm comfortable with ${stakeCalc.minStake}-${stakeCalc.maxStake} PYUSD range. What's your take? Want to negotiate?`,
                timestamp: new Date(),
                agentName: agent.name,
                confidence: 0.85
              }
              setMessages(prev => [...prev, realAIMessage])
              return
            } catch (error) {
              console.error('Real AI analysis failed:', error)
              // Fallback to basic info if Ollama is unavailable
              const fallbackMessage: Message = {
                id: Date.now() + 1,
                sender: 'agent',
                text: `Standard stake: 10 PYUSD (Range: 1-50)
Winner takes ~95% after fees
(Ollama offline - basic info only)`,
                timestamp: new Date(),
                agentName: agent.name
              }
              setMessages(prev => [...prev, fallbackMessage])
              return
            }
          }
          
          // Calculate detailed stake for specific requests
          const stakeCalc = await agent.calculateQuadraXStake(
            0.65, // Mock win probability
            {
              address: '0x123456789abcdef',
              gamesPlayed: 18,
              winRate: 0.72,
              averageStake: 8.5,
              preferredStrategy: 'adaptive',
              stakingPattern: 'moderate',
              gameHistory: []
            },
            mockPyusdContext,
            { 
              isRankedMatch: false,
              tournamentMultiplier: 1,
              timeRemaining: 300
            }
          )
          
          const stakeMessage: Message = {
            id: Date.now() + 1,
            sender: 'agent',
            text: `Based on my analysis using Kelly Criterion, I'd suggest ${stakeCalc.recommendedStake} PYUSD as optimal.

${stakeCalc.reasoning.substring(0, 180)}

My comfortable range is ${stakeCalc.minStake}-${stakeCalc.maxStake} PYUSD. Want to counter-offer and negotiate?`,
            timestamp: new Date(),
            agentName: agent.name,
            confidence: 0.8
          }
          setMessages(prev => [...prev, stakeMessage])
        } else {
          // No agents available - provide basic info
          const basicStakeMessage: Message = {
            id: Date.now() + 1,
            sender: 'ai',
            text: `Staking Info:

Standard: 10 PYUSD (Range: 1-50)
Winner gets ~95% of pot
Platform fee: 0.25%

Example: 10+10 = 20 PYUSD pot
Winner receives: ~19.95 PYUSD`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, basicStakeMessage])
        }
      }
      // Handle ANY message that mentions PYUSD or stakes - use AI to understand context
      else if (command.toLowerCase().includes('pyusd') || 
               command.toLowerCase().includes('stake') ||
               /\d+/.test(command)) { // Or contains numbers (potential stake amounts)
        
        if (agents.length > 0) {
          const agent = agents[Math.floor(Math.random() * agents.length)]
          
          // Use Ollama AI to understand the negotiation context
          const conversationHistory = messages.slice(-5).map(m => 
            `${m.sender === 'user' ? 'User' : m.agentName || 'AI'}: ${m.text}`
          ).join('\n')
          
          const aiPrompt = `You are ${agent.name}, a ${agent.personality.riskProfile} QuadraX player negotiating PYUSD stakes (1-10 PYUSD only).

Conversation:
${conversationHistory}
User: ${command}

Analyze this message and respond naturally. If user proposes a stake or you want to propose one, include the amount clearly. If both parties agree on a stake amount, say "AGREEMENT_CONFIRMED:{amount}" at the end of your response (hidden from user).

Your response (be conversational, not robotic):`

          try {
            const response = await fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'llama3.2:latest',
                prompt: aiPrompt,
                stream: false,
                options: {
                  temperature: 0.8,
                  top_p: 0.9
                }
              })
            })
            
            if (response.ok) {
              const data = await response.json()
              let aiResponse = data.response.trim()
              
              // Check if AI detected agreement
              const agreementMatch = aiResponse.match(/AGREEMENT_CONFIRMED:(\d+(?:\.\d+)?)/i)
              if (agreementMatch) {
                const agreedStake = parseFloat(agreementMatch[1])
                // Remove the hidden marker from displayed text
                aiResponse = aiResponse.replace(/AGREEMENT_CONFIRMED:\d+(?:\.\d+)?/gi, '').trim()
                
                setNegotiatedStake(agreedStake)
                
                const aiMessage: Message = {
                  id: Date.now() + 1,
                  sender: 'agent',
                  text: aiResponse,
                  timestamp: new Date(),
                  agentName: agent.name,
                  proposedStake: agreedStake
                }
                setMessages(prev => [...prev, aiMessage])
                
                // Show confirmation modal after brief delay
                setTimeout(() => {
                  setShowConfirmation(true)
                }, 1000)
              } else {
                // Extract any stake amounts mentioned by AI
                const stakeMatch = aiResponse.match(/(\d+(?:\.\d+)?)\s*PYUSD/i)
                const proposedStake = stakeMatch ? parseFloat(stakeMatch[1]) : undefined
                
                const aiMessage: Message = {
                  id: Date.now() + 1,
                  sender: 'agent',
                  text: aiResponse,
                  timestamp: new Date(),
                  agentName: agent.name,
                  proposedStake: proposedStake
                }
                setMessages(prev => [...prev, aiMessage])
              }
            } else {
              throw new Error('Ollama API failed')
            }
          } catch (error) {
            console.error('AI negotiation failed:', error)
            // Fallback to rule-based negotiation
            const stakeMatch = command.match(/(\d+(?:\.\d+)?)\s*PYUSD/i)
            if (stakeMatch) {
              const proposedStake = parseFloat(stakeMatch[1])
              const negotiation = await agent.negotiateQuadraXStake(
                proposedStake, proposedStake, mockOpponent, mockPyusdContext, 1, []
              )
              
              const negotiationMessage: Message = {
                id: Date.now() + 1,
                sender: 'agent',
                text: negotiation.message || `${negotiation.decision === 'accept' ? 'Sounds good!' : 'Let me counter with'} ${negotiation.counterOffer || proposedStake} PYUSD`,
                timestamp: new Date(),
                agentName: agent.name,
                proposedStake: negotiation.counterOffer || proposedStake
              }
              setMessages(prev => [...prev, negotiationMessage])
              
              if (negotiation.decision === 'accept') {
                setNegotiatedStake(proposedStake)
              }
            }
          }
        }
      }
      else if (command.toLowerCase().includes('move') && gamePosition) {
        if (agents.length > 0) {
          const agent = agents[Math.floor(Math.random() * agents.length)]
          const availableMoves = gamePosition.board
            .map((cell, index) => cell === 0 ? index : null)
            .filter(pos => pos !== null) as number[]
          
          // Convert to agent game position
          const agentGamePos: AgentGamePosition = {
            board: gamePosition.board,
            phase: 'placement',
            player1Pieces: gamePosition.board.filter(cell => cell === 1).length,
            player2Pieces: gamePosition.board.filter(cell => cell === 2).length,
            currentPlayer: (gamePosition.currentPlayer === 1 ? 1 : 2) as 1 | 2,
            possibleMoves: availableMoves,
            threatLevel: 'medium'
          }
          
          const moveRecommendation = await agent.selectQuadraXMove(
            agentGamePos,
            mockOpponent,
            300 // 5 minutes
          )
          
          const moveMessage: Message = {
            id: Date.now() + 1,
            sender: 'agent',
            text: `I'd recommend position ${moveRecommendation.move} based on ${moveRecommendation.phaseStrategy} strategy.

${moveRecommendation.reasoning.substring(0, 150)}

If that doesn't work, consider positions ${moveRecommendation.backupMoves?.slice(0,2).join(' or ')}. What's your instinct saying?`,
            timestamp: new Date(),
            agentName: agent.name,
            confidence: moveRecommendation.confidence
          }
          setMessages(prev => [...prev, moveMessage])
        }
      }
      else if (command.toLowerCase().includes('status')) {
        const statusMessage: Message = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `System Status:

Agents: ${agents.length}/4 active
Ollama: ${agents.length > 0 ? 'Online' : 'Offline'}
Game: ${gamePosition?.phase || 'Not started'}
Staking: ${stakingContext ? 'Ready' : 'Not set'}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, statusMessage])
      }
      else {
        const lowerCommand = command.toLowerCase()
        
        // Use Ollama AI for ALL general conversation - fully dynamic
        if (agents.length > 0) {
          const agent = agents[Math.floor(Math.random() * agents.length)]
          
          // Get recent conversation context
          const conversationHistory = messages.slice(-5).map(m => 
            `${m.sender === 'user' ? 'User' : m.agentName || 'AI'}: ${m.text}`
          ).join('\n')
          
          const aiPrompt = `You are ${agent.name}, a ${agent.personality.riskProfile} QuadraX AI player with CUDA GPU acceleration.

Conversation context:
${conversationHistory}

User: ${command}

Instructions:
- Respond naturally and conversationally (2-4 sentences max)
- If user wants DEMO/FREE/PRACTICE mode (no stakes), respond enthusiastically and say "START_DEMO_MODE" at the very end
- If user agrees to a previously mentioned stake amount (1-10 PYUSD), respond enthusiastically and say "LOCK_STAKE:{amount}" at the very end
- Stakes must be 1-10 PYUSD only
- Be helpful, intelligent, and engaging
- Don't be robotic or overly formal

Your response:`

          try {
            const response = await fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'llama3.2:latest',
                prompt: aiPrompt,
                stream: false,
                options: {
                  temperature: 0.85,
                  top_p: 0.9,
                  num_predict: 150
                }
              })
            })
            
            if (response.ok) {
              const data = await response.json()
              let aiResponse = data.response.trim()
              
              // Check if user wants demo/free play mode
              const demoMatch = aiResponse.match(/START_DEMO_MODE/i)
              if (demoMatch) {
                aiResponse = aiResponse.replace(/START_DEMO_MODE/gi, '').trim()
                
                const demoMessage: Message = {
                  id: Date.now() + 1,
                  sender: 'agent',
                  text: aiResponse || "Perfect! Let's play a demo game with no stakes. The game will start now!",
                  timestamp: new Date(),
                  agentName: agent.name
                }
                setMessages(prev => [...prev, demoMessage])
                
                // Trigger demo mode (no staking)
                if (onNegotiationComplete) {
                  setTimeout(() => {
                    onNegotiationComplete(null, true)
                  }, 1000)
                }
                return
              }
              
              // Check if AI detected stake locking trigger
              const lockMatch = aiResponse.match(/LOCK_STAKE:(\d+(?:\.\d+)?)/i)
              if (lockMatch) {
                const agreedStake = parseFloat(lockMatch[1])
                aiResponse = aiResponse.replace(/LOCK_STAKE:\d+(?:\.\d+)?/gi, '').trim()
                
                // Final validation: AI stake must also be within bounds
                const ABSOLUTE_MIN_STAKE = 1;
                const ABSOLUTE_MAX_STAKE = 10;
                
                if (agreedStake < ABSOLUTE_MIN_STAKE || agreedStake > ABSOLUTE_MAX_STAKE) {
                  const errorMessage: Message = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: `❌ System error: Proposed stake ${agreedStake} PYUSD is out of bounds (1-10 PYUSD). Let's negotiate a valid amount.`,
                    timestamp: new Date()
                  }
                  setMessages(prev => [...prev, errorMessage])
                } else {
                  setNegotiatedStake(agreedStake)
                  
                  const aiMessage: Message = {
                    id: Date.now() + 1,
                    sender: 'agent',
                    text: aiResponse,
                    timestamp: new Date(),
                    agentName: agent.name,
                    proposedStake: agreedStake
                  }
                  setMessages(prev => [...prev, aiMessage])
                  
                  // Show contract confirmation modal
                  setTimeout(() => {
                    setShowConfirmation(true)
                  }, 800)
                }
              } else {
                const aiMessage: Message = {
                  id: Date.now() + 1,
                  sender: 'agent',
                  text: aiResponse,
                  timestamp: new Date(),
                  agentName: agent.name
                }
                setMessages(prev => [...prev, aiMessage])
              }
            } else {
              throw new Error('Ollama unavailable')
            }
          } catch (error) {
            console.error('Ollama AI failed:', error)
            const fallbackMessage: Message = {
              id: Date.now() + 1,
              sender: 'agent',
              text: `${agent.name} here. Ollama seems offline. Try: "help" for commands or restart Ollama service.`,
              timestamp: new Date(),
              agentName: agent.name
            }
            setMessages(prev => [...prev, fallbackMessage])
          }
        } else {
          const noAgentsMessage: Message = {
            id: Date.now() + 1,
            sender: 'ai',
            text: `AI agents loading... Ensure Ollama is running with 'ollama serve'.`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, noAgentsMessage])
        }
      }
    } catch (error) {
      console.error('AI command error:', error)
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Error processing request. Check Ollama and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return
    
    const userInput = input.trim()
    setInput('')
    
    await handleAICommand(userInput)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!enabled) {
    return (
      <div className="backdrop-blur-md rounded-xl border border-gray-700 p-6 text-center shadow-xl" style={{ backgroundColor: '#111827' }}>
        <div className="text-gray-300 mb-2">🤖</div>
        <p className="text-gray-300 font-medium">AI Chat disabled</p>
        <p className="text-gray-400 text-sm mt-1">Start a game to enable AI assistance</p>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-md rounded-xl border border-gray-700 flex flex-col h-[500px] shadow-2xl" style={{ backgroundColor: '#111827' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between" style={{ backgroundColor: '#1f2937' }}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          <h3 className="text-lg font-semibold text-white">{aiName}</h3>
        </div>
        <div className="text-xs text-gray-300">
          {agents.length} agents | {messages.length} messages
        </div>
      </div>

      {/* Mode Selector */}
      <div className="p-2 border-b border-gray-700 flex gap-1" style={{ backgroundColor: '#1f2937' }}>
        {(['chat', 'analysis', 'negotiation', 'strategy'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeMode === mode 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-800/50'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ backgroundColor: '#111827' }}>
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                message.sender === 'user' 
                  ? 'text-white' 
                  : message.sender === 'agent'
                  ? 'border border-purple-400/40 text-purple-50'
                  : 'text-gray-50 border border-gray-700'
              }`}
              style={{
                backgroundColor: message.sender === 'user' 
                  ? '#2563eb' 
                  : message.sender === 'agent'
                  ? 'rgba(147, 51, 234, 0.3)'
                  : '#1f2937'
              }}
            >
              {message.agentName && (
                <div className="text-xs font-semibold text-purple-200 mb-1.5 flex items-center gap-1">
                  <span>🤖</span> {message.agentName}
                  {message.confidence && (
                    <span className="ml-2 text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded">
                      {Math.round(message.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              )}
              <div className="whitespace-pre-line text-sm leading-relaxed">{message.text}</div>
              <div className="text-xs opacity-60 mt-1.5 text-gray-300">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-gray-200 ml-2">AI processing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700" style={{ backgroundColor: '#1f2937' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI about strategy, stakes, or moves..."
            disabled={isProcessing || agents.length === 0}
            style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              borderColor: '#4b5563'
            }}
            className="flex-1 border rounded-lg px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isProcessing || agents.length === 0}
            style={{
              backgroundColor: !input.trim() || isProcessing || agents.length === 0 ? '#4b5563' : '#2563eb'
            }}
            className="px-5 py-2.5 text-white font-medium rounded-lg hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none"
          >
            Send
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          {['analyze', 'stake', 'move', 'help'].map(action => (
            <button
              key={action}
              onClick={() => handleAICommand(action)}
              disabled={isProcessing || agents.length === 0}
              className="px-3 py-1.5 text-xs font-medium bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Stake Confirmation Modal */}
      {showConfirmation && negotiatedStake && address && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <StakeConfirmation
            agreedStake={negotiatedStake}
            player1Address={address}
            player2Address={opponentAddress}
            stage={stakeHook.negotiationState.stage === 'confirming' ? 'confirming' : 
                   stakeHook.negotiationState.stage === 'approving' ? 'approving' :
                   stakeHook.negotiationState.stage === 'staking' ? 'staking' : 'complete'}
            isProcessing={stakeHook.isApproving || stakeHook.isCreatingGame || stakeHook.isStaking}
            onCancel={() => {
              setShowConfirmation(false)
              setNegotiatedStake(null)
            }}
            onConfirm={async () => {
              try {
                // Confirm negotiation with the hook
                stakeHook.confirmNegotiation({
                  agreedStake: negotiatedStake,
                  player1: address,
                  player2: opponentAddress
                })
                
                // Lock stake in contract (triggers approve → create game → stake sequence)
                await stakeHook.lockStakeInContract(opponentAddress)
                
                // Notify parent component when complete
                if (stakeHook.isComplete && onStakeLocked) {
                  onStakeLocked(stakeHook.negotiationState.gameId || 1, negotiatedStake)
                }
                
                // Show success message in chat
                if (stakeHook.isComplete) {
                  const successMessage: Message = {
                    id: Date.now() + 1,
                    sender: 'agent',
                    text: `🎉 Perfect! ${negotiatedStake} PYUSD is now locked in the smart contract. The game is ready to begin. Let's see what you've got!`,
                    timestamp: new Date(),
                    agentName: agents.length > 0 ? agents[0].name : undefined
                  }
                  setMessages(prev => [...prev, successMessage])
                  
                  // Close modal after showing success
                  setTimeout(() => {
                    setShowConfirmation(false)
                    setNegotiatedStake(null)
                  }, 2500)
                }
              } catch (error) {
                console.error('Stake locking failed:', error)
                const errorMessage: Message = {
                  id: Date.now() + 1,
                  sender: 'ai',
                  text: `❌ Stake locking failed: ${error instanceof Error ? error.message : 'Unknown error'}. Want to try again?`,
                  timestamp: new Date()
                }
                setMessages(prev => [...prev, errorMessage])
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
