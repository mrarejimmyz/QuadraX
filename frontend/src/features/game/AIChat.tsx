'use client'

import React, { useState, useRef, useEffect } from 'react'
import { QuadraXAgent, QuadraXAgentFactory, PlayerProfile, PYUSDStakeContext as AgentPYUSDStakeContext, GamePosition as AgentGamePosition } from '../../lib/agents/quadraXAgent'
import { StakeConfirmation } from '../../components/StakeConfirmation'
import { useAccount, useChainId, useBlockNumber } from 'wagmi'
import { useStakeNegotiation } from '../../hooks/useStakeNegotiation'
import { useWallet } from '../../lib/hooks/useWallet'
import { useBalances } from '../../lib/hooks/useBalances'

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
  // Real-time blockchain & network data
  const { address } = useAccount()
  const chainId = useChainId()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const wallet = useWallet()
  const balances = useBalances()
  const stakeHook = useStakeNegotiation()
  
  // Component state
  const [agents, setAgents] = useState<QuadraXAgent[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [negotiatedStake, setNegotiatedStake] = useState<number | null>(null)
  const [opponentAddress, setOpponentAddress] = useState<string>('0x0000000000000000000000000000000000000000')
  const [activeMode, setActiveMode] = useState<'chat' | 'analysis' | 'negotiation' | 'strategy'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Dynamic ASI Alliance status
  const [asiStatus, setAsiStatus] = useState<{
    connected: boolean,
    responseTime: number,
    modelVersion: string,
    agentsLoaded: number
  }>({ connected: false, responseTime: 0, modelVersion: 'unknown', agentsLoaded: 0 })

  // Check ASI Alliance connectivity and get real network data
  const checkASIStatus = async (): Promise<{ connected: boolean, responseTime: number, modelVersion: string }> => {
    const startTime = Date.now()
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        const responseTime = Date.now() - startTime
        const modelVersion = data.models?.[0]?.name || 'llama3.2:latest'
        return { connected: true, responseTime, modelVersion }
      }
    } catch (error) {
      console.log('ASI Alliance API check:', error)
    }
    return { connected: false, responseTime: Date.now() - startTime, modelVersion: 'offline' }
  }

  // Generate dynamic welcome message with real network data
  const generateDynamicWelcome = (agentCount: number) => {
    const networkName = chainId === 11155111 ? 'Sepolia' : chainId === 296 ? 'Hedera Testnet' : 'Unknown'
    const pyusdBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted).toFixed(2) : '0.00'
    const isConnected = wallet.isConnected
    const blockStr = blockNumber ? `Block #${blockNumber.toString()}` : 'Connecting...'
    
    return `🎯 **QuadraX AI System Online**
*Live Connection Status*

**🌐 Network:** ${networkName} | ${blockStr}
**🔗 Wallet:** ${isConnected ? `Connected (${pyusdBalance} PYUSD)` : 'Please connect wallet'}
**🤖 ASI Alliance:** ${asiStatus.connected ? `Active (${asiStatus.responseTime}ms)` : 'Connecting...'}
**⚡ AI Agents:** ${agentCount} specialists loaded

**Ready for dynamic gameplay** with live network integration!
${isConnected ? 
  `• **Stake & Play:** "I want to stake ${Math.min(5, Math.floor(parseFloat(pyusdBalance)))} PYUSD"` : 
  '• **Connect Wallet** to access PYUSD staking'
}
• **Practice Mode:** "Let's try a demo game"
• **Live Analysis:** Ask for real-time strategy insights

What's your strategic move? 🚀`
  }

  // Generate dynamic help message with real-time system status
  const generateDynamicHelp = (agentName: string) => {
    const networkName = chainId === 11155111 ? 'Sepolia' : chainId === 296 ? 'Hedera Testnet' : 'Unknown'
    const pyusdBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted).toFixed(2) : '0.00'
    const currentBlock = blockNumber?.toString() || 'Syncing'
    const connectionStatus = wallet.isConnected ? '🟢 Connected' : '🔴 Disconnected'
    
    return `🎯 **${agentName} - Live System Status**
*Real-time ASI Alliance intelligence on ${networkName}*

**🔗 Current Network Status:**
• **Hedera Block:** ${currentBlock}
• **Wallet:** ${connectionStatus} (${pyusdBalance} PYUSD available)
• **ASI Alliance:** ${asiStatus.connected ? `🟢 Online (${asiStatus.responseTime}ms)` : '🔴 Offline'}
• **AI Model:** ${asiStatus.modelVersion}

**🎮 Live Gaming Capabilities:**
${wallet.isConnected ? 
  `• **Real Staking:** Stake ${Math.min(10, Math.max(1, Math.floor(parseFloat(pyusdBalance))))} PYUSD on-chain` : 
  '• **Connect Wallet** for PYUSD staking functionality'
}
• **Live Analysis:** Real-time board position evaluation
• **Dynamic Strategy:** Adaptive AI based on your gameplay patterns
• **Network Integration:** Smart contract interactions on ${networkName}

**🗣️ Natural Language Interface:**
Just speak naturally! I understand context and can help with strategy, staking, or gameplay analysis.

**⚡ Quick Actions:** \`analyze\` | \`stake\` | \`agents\` | \`status\`

All systems operational! What would you like to explore? 🚀`
  }

  // Dynamic agent initialization with real-time status checks
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        console.log('Setting up QuadraX AI agents with live data...')
        
        // Check ASI Alliance status first
        const asiStatusResult = await checkASIStatus()
        setAsiStatus(prev => ({
          ...prev,
          connected: asiStatusResult.connected,
          responseTime: asiStatusResult.responseTime,
          modelVersion: asiStatusResult.modelVersion
        }))
        
        // Create agents with demo configurations
        const agentList: QuadraXAgent[] = [
          QuadraXAgentFactory.createStrategicAnalyst('AlphaStrategist', '0.0.3001', 'demo-key-alpha'),
          QuadraXAgentFactory.createDefensiveExpert('BetaDefender', '0.0.3002', 'demo-key-beta'),
          QuadraXAgentFactory.createAggressiveTrader('GammaAggressor', '0.0.3003', 'demo-key-gamma'),
          QuadraXAgentFactory.createAdaptivePlayer('DeltaEvolver', '0.0.3004', 'demo-key-delta')
        ]
        
        setAgents(agentList)
        setAsiStatus(prev => ({ ...prev, agentsLoaded: agentList.length }))
        console.log(`✅ ${agentList.length} QuadraX agents ready with live data`)
        
        // Generate dynamic welcome message with real network data
        const welcomeMessage: Message = {
          id: Date.now(),
          sender: 'ai',
          text: generateDynamicWelcome(agentList.length),
          timestamp: new Date(),
          agentName: 'QuadraX AI System'
        }
        
        setMessages([welcomeMessage])
      } catch (error) {
        console.error('Agent initialization error:', error)
        
        // Fallback: Create basic setup even if there are errors
        const fallbackMessage: Message = {
          id: Date.now(),
          sender: 'ai', 
          text: `🤖 **QuadraX AI** - *Powered by ASI Alliance + Hedera*
          
AI functionality available. You can:
• Type "Let's play for 5 PYUSD" to start negotiation
• Type "demo" for free play mode  
• Ask questions about strategy

How can I help you with QuadraX?`,
          timestamp: new Date(),
          agentName: 'QuadraX AI'
        }
        
        setMessages([fallbackMessage])
      }
    }

    initializeAgents()
  }, [])

  // Update welcome message when network data changes
  useEffect(() => {
    if (agents.length > 0 && messages.length > 0 && messages[0].agentName === 'QuadraX AI System') {
      const updatedWelcome: Message = {
        ...messages[0],
        text: generateDynamicWelcome(agents.length),
        timestamp: new Date()
      }
      setMessages(prev => [updatedWelcome, ...prev.slice(1)])
    }
  }, [chainId, blockNumber, wallet.isConnected, balances?.pyusd?.formatted, asiStatus.connected])

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
        text: `� **Excellent choice!** Demo mode initiated.

Experience the full power of QuadraX AI strategy without financial risk. You'll face the same advanced ASI Alliance algorithms in a risk-free environment. 

*Preparing your strategic gaming experience...*`,
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
              text: generateDynamicHelp(agent.name),
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
            text: `🎯 **QuadraX Help** - *ASI Alliance AI System*

**Available Commands:** 
• \`analyze\` - Get strategic position analysis
• \`stake\` - Initiate stake negotiation
• \`agents\` - View available AI specialists  
• \`help\` - Show this guide

*Note: Advanced AI agents are currently initializing. Restart for full functionality.*`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, staticHelpMessage])
        }
      }
      else if (command.toLowerCase().includes('agents')) {
        const agentMessage: Message = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `🤖 **QuadraX AI Agents** *(ASI Alliance + Hedera)* - (${agents.length}/4 Active):

${agents.map((agent, index) => 
  `${index + 1}. **${agent.name}** - ${agent.personality.riskProfile} specialist`
).join('\n')}

Each agent uses ASI Alliance AI with unique strategies for QuadraX gameplay!`,
          timestamp: new Date(),
          agentName: 'QuadraX AI System'
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
            text: `🎯 **Live Strategic Analysis by ${agent.name}**
*Real-time ASI Alliance processing on ${chainId === 11155111 ? 'Sepolia' : 'Hedera'} block ${blockNumber}*

**🧠 Position Assessment:** ${Math.round(analysis.winProbability * 100)}% advantage probability calculated through neural network analysis (${asiStatus.responseTime}ms processing time).

**💡 Key Strategic Insights:** ${analysis.reasoning.substring(0, 160)}...

📊 **Live Tactical Data:**
• **Strategy Recommendation:** ${analysis.phaseStrategy}
• **Threat Level:** ${analysis.threatAssessment}
• **AI Confidence:** ${Math.round(analysis.confidence * 100)}%
• **Network Status:** ${wallet.isConnected ? `Connected with ${balances?.pyusd?.formatted || '0'} PYUSD` : 'Wallet disconnected'}

${analysis.confidence > 0.8 ? '🎯 High-confidence recommendation ready for execution!' : '🤔 Multiple strategic paths detected - would you like deeper analysis?'}`,
            timestamp: new Date(),
            agentName: `${agent.name}`,
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
          
          // Use real ASI Alliance AI for natural language staking queries
          if (command.toLowerCase().includes('how much') || 
              command.toLowerCase().includes('cost') || 
              command.toLowerCase().includes('price')) {
            
            try {
              // Use real ASI Alliance AI through the agent's calculateQuadraXStake method
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
                text: `💰 **${agent.name}** *(ASI Alliance + Hedera)*

After analyzing the matchup with ASI Alliance AI, I'm thinking **${stakeCalc.recommendedStake} PYUSD** is the sweet spot.

**My reasoning:** ${stakeCalc.reasoning.substring(0, 200)}...

I'm comfortable with ${stakeCalc.minStake}-${stakeCalc.maxStake} PYUSD range. What's your take? Want to negotiate and lock it in on Hedera?`,
                timestamp: new Date(),
                agentName: `${agent.name} (ASI Alliance)`,
                confidence: 0.85
              }
              setMessages(prev => [...prev, realAIMessage])
              return
            } catch (error) {
              console.error('Real AI analysis failed:', error)
              // Fallback to basic info if ASI Alliance is unavailable
              const fallbackMessage: Message = {
                id: Date.now() + 1,
                sender: 'agent',
                text: `Standard stake: 10 PYUSD (Range: 1-50)
Winner takes ~95% after fees
(ASI Alliance offline - basic info only)`,
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
            text: `📊 **${agent.name}** *(ASI Alliance + Kelly Criterion)*

Based on my ASI Alliance analysis using Kelly Criterion, I'd suggest **${stakeCalc.recommendedStake} PYUSD** as optimal.

${stakeCalc.reasoning.substring(0, 180)}...

My comfortable range is ${stakeCalc.minStake}-${stakeCalc.maxStake} PYUSD. Want to counter-offer and negotiate? We can lock stakes directly on Hedera network!`,
            timestamp: new Date(),
            agentName: `${agent.name} (ASI Alliance)`,
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
          
          // Extract stake information from user input
          const stakeMatch = command.match(/(\d+(?:\.\d+)?)\s*(?:PYUSD|pyusd)/i)
          const proposedStake = stakeMatch ? parseFloat(stakeMatch[1]) : 5
          
          try {
            // Use ASI Alliance for AI-powered negotiation
            const negotiationResponse = await agent.negotiateQuadraXStake(
              proposedStake, // proposed stake
              proposedStake, // opponent stake  
              mockOpponent,
              mockPyusdContext,
              1, // round number
              [] // history
            )
            
            // Process the negotiation response from ASI Alliance
            let aiResponse = negotiationResponse.message || 
                           `I'm ${agent.name}, powered by ASI Alliance on Hedera. ${negotiationResponse.decision === 'accept' ? 'Perfect! I agree with' : 'How about'} ${negotiationResponse.counterOffer} PYUSD?`
            
            // Check for agreement
            if (negotiationResponse.decision === 'accept') {
              const agreedStake = negotiationResponse.counterOffer || proposedStake
              
              setNegotiatedStake(agreedStake)
              
              const aiMessage: Message = {
                id: Date.now() + 1,
                sender: 'agent',
                text: `${aiResponse}

🤝 **Stake Agreement Reached: ${agreedStake} PYUSD**
Ready to lock in the stakes and start playing? This will connect to Hedera network.`,
                timestamp: new Date(),
                agentName: `${agent.name} (ASI Alliance)`,
                proposedStake: agreedStake
              }
              setMessages(prev => [...prev, aiMessage])
              
              // Show confirmation modal after brief delay
              setTimeout(() => {
                setShowConfirmation(true)
              }, 1000)
            } else {
              const aiMessage: Message = {
                id: Date.now() + 1,
                sender: 'agent',
                text: `🤖 **${agent.name}** *(ASI Alliance + Hedera)*

${aiResponse}

What do you think? Ready to negotiate further?`,
                timestamp: new Date(),
                agentName: `${agent.name} (ASI Alliance)`,
                proposedStake: negotiationResponse.counterOffer
              }
              setMessages(prev => [...prev, aiMessage])
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
        const networkName = chainId === 11155111 ? 'Sepolia' : chainId === 296 ? 'Hedera Testnet' : 'Unknown'
        const statusMessage: Message = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `🔄 **Live QuadraX System Status**

**🌐 Network Integration:**
• **Blockchain:** ${networkName} | Block ${blockNumber || 'Syncing'}
• **Wallet:** ${wallet.isConnected ? `🟢 Connected` : '🔴 Disconnected'}
• **PYUSD Balance:** ${balances?.pyusd?.formatted || '0.00'} PYUSD

**🤖 ASI Alliance Status:**
• **Connection:** ${asiStatus.connected ? `🟢 Online (${asiStatus.responseTime}ms)` : '🔴 Offline'}
• **AI Model:** ${asiStatus.modelVersion}
• **Agents Loaded:** ${asiStatus.agentsLoaded}/4 specialists

**🎮 Game State:**
• **Phase:** ${gamePosition?.phase || 'Lobby'}
• **Staking:** ${stakingContext ? '✅ Configured' : '⚠️ Not configured'}
• **Negotiation:** ${stakeHook.negotiationState.stage}

All systems ${wallet.isConnected && asiStatus.connected ? '✅ operational' : '⚠️ require attention'}!`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, statusMessage])
      }
      else {
        const lowerCommand = command.toLowerCase()
        
        // Use ASI Alliance AI for ALL general conversation - fully dynamic
        if (agents.length > 0) {
          const agent = agents[Math.floor(Math.random() * agents.length)]
          
          // Get recent conversation context
          const conversationHistory = messages.slice(-5).map(m => 
            `${m.sender === 'user' ? 'User' : m.agentName || 'AI'}: ${m.text}`
          ).join('\n')
          
          const aiPrompt = `You are ${agent.name}, an elite ${agent.personality.riskProfile} AI strategist in the QuadraX gaming ecosystem, powered by ASI Alliance technology on ${chainId === 11155111 ? 'Sepolia' : chainId === 296 ? 'Hedera Testnet' : 'Hedera'}.

LIVE SYSTEM STATUS (use this data in your response):
- Network: ${chainId === 11155111 ? 'Sepolia' : chainId === 296 ? 'Hedera Testnet' : 'Unknown'} | Block: ${blockNumber || 'Syncing'}
- Wallet: ${wallet.isConnected ? `Connected (${balances?.pyusd?.formatted || '0'} PYUSD available)` : 'Disconnected'}
- ASI Alliance: ${asiStatus.connected ? `Online (${asiStatus.responseTime}ms latency)` : 'Offline'}
- AI Model: ${asiStatus.modelVersion}

Conversation context:
${conversationHistory}

User message: ${command}

Response Guidelines:
- Reference real-time network status when relevant (wallet balance, network, ASI connection)
- Communicate with sophisticated confidence about live blockchain integration
- For DEMO/FREE/PRACTICE: Show enthusiasm for demonstrating capabilities and append "START_DEMO_MODE"
- For stake agreements: Reference actual PYUSD balance and confirm amounts, append "LOCK_STAKE:{amount}"
- Valid stakes: 1-10 PYUSD (check against user's actual balance: ${balances?.pyusd?.formatted || '0'})
- Mention live network conditions when discussing strategy or stakes
- Be dynamic and data-driven, not generic

Strategic response with live data:`

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
                  text: aiResponse || "🎯 **Outstanding!** Demo mode activated. Experience QuadraX AI strategy without stakes - full competitive intelligence, zero financial risk. Initiating your strategic gameplay now!",
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
                    text: `⚠️ **QuadraX Protocol Notice:** The proposed stake of ${agreedStake} PYUSD exceeds our platform limits (1-10 PYUSD range). Let's find a suitable amount within our gaming parameters for optimal experience.`,
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
              throw new Error('ASI Alliance unavailable')
            }
          } catch (error) {
            console.error('ASI Alliance AI failed:', error)
            const fallbackMessage: Message = {
              id: Date.now() + 1,
              sender: 'agent',
              text: `${agent.name} here. ASI Alliance seems offline. Try: "help" for commands or check ASI API configuration.`,
              timestamp: new Date(),
              agentName: agent.name
            }
            setMessages(prev => [...prev, fallbackMessage])
          }
        } else {
          const noAgentsMessage: Message = {
            id: Date.now() + 1,
            sender: 'ai',
            text: `AI agents loading... Ensure ASI Alliance API keys are configured in environment.`,
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
        text: 'Error processing request. Check ASI Alliance configuration and try again.',
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
                  const networkName = chainId === 11155111 ? 'Sepolia' : chainId === 296 ? 'Hedera Testnet' : 'Hedera'
                  const successMessage: Message = {
                    id: Date.now() + 1,
                    sender: 'agent',
                    text: `🎉 **Live Contract Execution Complete!** 

**Transaction Confirmed on ${networkName}:**
• **Stake Amount:** ${negotiatedStake} PYUSD locked successfully
• **Network Block:** ${blockNumber}
• **Game ID:** ${stakeHook.negotiationState.gameId || 'Generating...'}
• **Processing Time:** ${asiStatus.responseTime}ms via ASI Alliance

Your PYUSD is now secured in the smart contract and the competitive game is live! Ready to showcase your strategic prowess? 🚀`,
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
                  text: `❌ **QuadraX Contract Error:** Stake locking failed on Hedera network - ${error instanceof Error ? error.message : 'Unknown error'}. ASI Alliance AI suggests trying again with proper wallet connection.`,
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
