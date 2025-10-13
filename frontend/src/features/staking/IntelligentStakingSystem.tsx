/**
 * Integrated Staking Negotiation System
 * Connects intelligent AI agents with React game component and PYUSD contract
 */

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

// Agent Types
interface StakeNegotiationAgent {
  name: string
  personality: {
    primary: 'aggressive' | 'defensive' | 'analytical'
    riskTolerance: number
  }
  expertise: {
    rating: number
    specialty: string
  }
  bankroll: number
  confidence: number
}

interface GamePrediction {
  winProbability: number
  confidence: number
  reasoning: string
  opponentAnalysis: any
}

interface StakeProposal {
  amount: number
  reasoning: string
  confidence: number
  riskAssessment: string
  minAcceptable: number
  maxWillingToPay: number
}

interface NegotiationResult {
  agreed: boolean
  finalStake?: number
  reason?: string
}

// Intelligent Staking Hook
export function useIntelligentStaking() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  const [agents, setAgents] = useState<StakeNegotiationAgent[]>([])
  const [negotiationInProgress, setNegotiationInProgress] = useState(false)
  const [negotiationHistory, setNegotiationHistory] = useState<any[]>([])
  const [currentGameId, setCurrentGameId] = useState<number | null>(null)
  const [agreedStake, setAgreedStake] = useState<number | null>(null)

  // Initialize AI agents
  useEffect(() => {
    const initialAgents: StakeNegotiationAgent[] = [
      {
        name: 'AlphaStrategist',
        personality: { primary: 'aggressive', riskTolerance: 0.8 },
        expertise: { rating: 1200, specialty: 'tactical_offense' },
        bankroll: 1500,
        confidence: 0.85
      },
      {
        name: 'BetaDefender', 
        personality: { primary: 'defensive', riskTolerance: 0.3 },
        expertise: { rating: 1100, specialty: 'risk_management' },
        bankroll: 1200,
        confidence: 0.75
      },
      {
        name: 'GammaAnalyst',
        personality: { primary: 'analytical', riskTolerance: 0.5 },
        expertise: { rating: 1300, specialty: 'strategic_optimization' },
        bankroll: 2000,
        confidence: 0.9
      }
    ]
    setAgents(initialAgents)
  }, [])

  // Agent prediction engine
  const predictGameOutcome = useCallback((agent: StakeNegotiationAgent, opponent: StakeNegotiationAgent): GamePrediction => {
    // Calculate win probability based on expertise difference
    const expertiseDiff = (agent.expertise.rating - opponent.expertise.rating) / 200
    let baseProbability = 0.5 + expertiseDiff * 0.3

    // Personality matchup adjustments
    const personalityAdvantage = calculatePersonalityAdvantage(agent, opponent)
    baseProbability += personalityAdvantage

    // Clamp between 10% and 90%
    const winProbability = Math.max(0.1, Math.min(0.9, baseProbability))
    
    // Assess confidence (factors in agent's general confidence + prediction accuracy)
    const confidence = Math.min(0.95, agent.confidence + Math.abs(winProbability - 0.5) * 0.3)

    return {
      winProbability,
      confidence,
      reasoning: `${Math.round(winProbability * 100)}% win probability based on ${agent.personality.primary} analysis`,
      opponentAnalysis: {
        strength: opponent.expertise.rating,
        personality: opponent.personality.primary,
        weaknesses: [`Weakness in ${opponent.personality.primary} decision-making under pressure`]
      }
    }
  }, [])

  const calculatePersonalityAdvantage = (agent: StakeNegotiationAgent, opponent: StakeNegotiationAgent): number => {
    const advantages: Record<string, Record<string, number>> = {
      aggressive: { defensive: 0.1, analytical: 0.05 },
      defensive: { aggressive: -0.1, analytical: 0.05 },
      analytical: { aggressive: -0.05, defensive: -0.05 }
    }
    return advantages[agent.personality.primary]?.[opponent.personality.primary] || 0
  }

  // Stake calculation engine
  const calculateStakeProposal = useCallback((
    agent: StakeNegotiationAgent, 
    prediction: GamePrediction
  ): StakeProposal => {
    // Kelly Criterion: f = (bp - q) / b
    const p = prediction.winProbability
    const q = 1 - p
    const b = 1 // Even odds
    
    let kellyFraction = (b * p - q) / b
    kellyFraction = Math.max(0, kellyFraction * prediction.confidence)

    // Personality adjustments
    const personalityMultiplier = getPersonalityStakeMultiplier(agent)
    let adjustedFraction = kellyFraction * personalityMultiplier

    // Apply limits (never more than 25% of bankroll)
    adjustedFraction = Math.min(0.25, adjustedFraction)
    
    const baseStake = Math.floor(agent.bankroll * adjustedFraction)
    const finalStake = Math.max(10, Math.min(agent.bankroll * 0.3, baseStake))

    return {
      amount: finalStake,
      reasoning: `$${finalStake} based on ${Math.round(p * 100)}% win probability and ${agent.personality.primary} risk assessment`,
      confidence: prediction.confidence,
      riskAssessment: finalStake / agent.bankroll < 0.05 ? 'Low Risk' : 
                    finalStake / agent.bankroll < 0.15 ? 'Moderate Risk' : 'High Risk',
      minAcceptable: Math.floor(finalStake * 0.6),
      maxWillingToPay: Math.floor(finalStake * 1.4)
    }
  }, [])

  const getPersonalityStakeMultiplier = (agent: StakeNegotiationAgent): number => {
    const multipliers = {
      aggressive: 1.5,
      defensive: 0.7, 
      analytical: 1.0
    }
    return multipliers[agent.personality.primary]
  }

  // Negotiation engine
  const negotiateStakes = useCallback(async (
    agent1: StakeNegotiationAgent,
    agent2: StakeNegotiationAgent,
    onProgress?: (update: string) => void
  ): Promise<NegotiationResult> => {
    setNegotiationInProgress(true)
    
    try {
      onProgress?.('🔮 Agents analyzing matchup...')
      
      // Phase 1: Predictions
      const prediction1 = predictGameOutcome(agent1, agent2)
      const prediction2 = predictGameOutcome(agent2, agent1)
      
      onProgress?.(`📊 ${agent1.name}: ${Math.round(prediction1.winProbability * 100)}% win probability`)
      onProgress?.(`📊 ${agent2.name}: ${Math.round(prediction2.winProbability * 100)}% win probability`)
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Phase 2: Stake proposals  
      onProgress?.('💰 Calculating optimal stakes...')
      
      const proposal1 = calculateStakeProposal(agent1, prediction1)
      const proposal2 = calculateStakeProposal(agent2, prediction2)
      
      onProgress?.(`💵 ${agent1.name} proposes: $${proposal1.amount}`)
      onProgress?.(`💵 ${agent2.name} proposes: $${proposal2.amount}`)
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Phase 3: Negotiation
      onProgress?.('🤝 Entering negotiation...')
      
      const negotiationResult = await runNegotiationRounds(
        agent1, agent2, proposal1, proposal2, onProgress
      )

      setNegotiationHistory(prev => [...prev, {
        timestamp: new Date(),
        agent1: agent1.name,
        agent2: agent2.name,
        agent1Proposal: proposal1.amount,
        agent2Proposal: proposal2.amount,
        result: negotiationResult
      }])

      return negotiationResult

    } finally {
      setNegotiationInProgress(false)
    }
  }, [predictGameOutcome, calculateStakeProposal])

  const runNegotiationRounds = async (
    agent1: StakeNegotiationAgent,
    agent2: StakeNegotiationAgent,
    proposal1: StakeProposal,
    proposal2: StakeProposal,
    onProgress?: (update: string) => void
  ): Promise<NegotiationResult> => {
    
    let currentProposal1 = proposal1
    let currentProposal2 = proposal2
    
    const maxRounds = 5
    
    for (let round = 1; round <= maxRounds; round++) {
      onProgress?.(`--- Round ${round} ---`)
      
      // Check if proposals are close enough to agree
      const difference = Math.abs(currentProposal1.amount - currentProposal2.amount)
      const avgAmount = (currentProposal1.amount + currentProposal2.amount) / 2
      const percentDiff = difference / avgAmount
      
      if (percentDiff < 0.2) { // Within 20%
        const agreedAmount = Math.floor(avgAmount)
        onProgress?.(`✅ Agreement reached: $${agreedAmount}`)
        setAgreedStake(agreedAmount)
        return { agreed: true, finalStake: agreedAmount }
      }
      
      // Generate counter-offers based on personality
      const counter1 = generateCounterOffer(agent1, currentProposal1, currentProposal2)
      const counter2 = generateCounterOffer(agent2, currentProposal2, currentProposal1)
      
      onProgress?.(`💬 ${agent1.name} counters: $${counter1.amount}`)
      onProgress?.(`💬 ${agent2.name} counters: $${counter2.amount}`)
      
      currentProposal1 = counter1
      currentProposal2 = counter2
      
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    // No agreement after max rounds
    onProgress?.('💔 Negotiation failed - no agreement possible')
    return { 
      agreed: false, 
      reason: `Agents couldn't agree after ${maxRounds} rounds. Stakes too far apart.` 
    }
  }

  const generateCounterOffer = (
    agent: StakeNegotiationAgent,
    myProposal: StakeProposal,
    theirProposal: StakeProposal
  ): StakeProposal => {
    // Move toward opponent's offer based on personality
    let counterFactor = 0.3 // Default 30% movement
    
    if (agent.personality.primary === 'aggressive') {
      counterFactor = 0.2 // Smaller concessions
    } else if (agent.personality.primary === 'defensive') {
      counterFactor = 0.4 // Larger concessions for safety
    }
    
    const movement = (theirProposal.amount - myProposal.amount) * counterFactor
    const counterAmount = Math.floor(myProposal.amount + movement)
    
    // Ensure within acceptable range
    const finalAmount = Math.max(
      myProposal.minAcceptable,
      Math.min(myProposal.maxWillingToPay, counterAmount)
    )
    
    return {
      ...myProposal,
      amount: finalAmount,
      reasoning: `Adjusted to $${finalAmount} based on negotiation dynamics`
    }
  }

  // Contract interaction functions
  const stakeToContract = useCallback(async (
    gameId: number,
    stakeAmount: number,
    opponentAddress: string
  ) => {
    if (!address) throw new Error('Wallet not connected')
    
    const stakeAmountWei = parseUnits(stakeAmount.toString(), 6) // PYUSD has 6 decimals
    
    // First approve PYUSD spending
    await writeContract({
      address: process.env.NEXT_PUBLIC_PYUSD_ADDRESS as `0x${string}`,
      abi: [
        {
          name: 'approve',
          type: 'function',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }
      ],
      functionName: 'approve',
      args: [process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`, stakeAmountWei]
    })

    // Then stake in the game
    await writeContract({
      address: process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`,
      abi: [
        {
          name: 'stakeInGame',
          type: 'function', 
          inputs: [
            { name: 'gameId', type: 'uint256' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: []
        }
      ],
      functionName: 'stakeInGame',
      args: [BigInt(gameId), stakeAmountWei]
    })

    setCurrentGameId(gameId)
  }, [address, writeContract])

  return {
    agents,
    negotiationInProgress,
    negotiationHistory,
    agreedStake,
    currentGameId,
    negotiateStakes,
    stakeToContract,
    setAgreedStake,
    setCurrentGameId
  }
}

// React Component for Intelligent Staking Interface
export function IntelligentStakingPanel({ 
  onStakeComplete,
  gameId,
  opponentAddress 
}: {
  onStakeComplete: (amount: string) => void
  gameId?: number
  opponentAddress?: string
}) {
  const {
    agents,
    negotiationInProgress,
    agreedStake,
    negotiateStakes,
    stakeToContract
  } = useIntelligentStaking()

  const [selectedAgent1, setSelectedAgent1] = useState(0)
  const [selectedAgent2, setSelectedAgent2] = useState(1)
  const [negotiationLog, setNegotiationLog] = useState<string[]>([])
  const [stakingPhase, setStakingPhase] = useState<'negotiate' | 'stake' | 'complete'>('negotiate')

  const handleStartNegotiation = async () => {
    if (selectedAgent1 === selectedAgent2) {
      alert('Please select different agents')
      return
    }

    setNegotiationLog([])
    
    const result = await negotiateStakes(
      agents[selectedAgent1],
      agents[selectedAgent2],
      (update: string) => {
        setNegotiationLog(prev => [...prev, update])
      }
    )

    if (result.agreed && result.finalStake) {
      setStakingPhase('stake')
    }
  }

  const handleConfirmStake = async () => {
    if (!agreedStake || !gameId || !opponentAddress) return

    try {
      await stakeToContract(gameId, agreedStake, opponentAddress)
      setStakingPhase('complete')
      onStakeComplete(agreedStake.toString())
    } catch (error) {
      console.error('Staking failed:', error)
    }
  }

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        🤖 Intelligent Staking System
      </h3>

      {stakingPhase === 'negotiate' && (
        <>
          {/* Agent Selection */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Agent 1</label>
              <select 
                value={selectedAgent1} 
                onChange={(e) => setSelectedAgent1(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
              >
                {agents.map((agent, i) => (
                  <option key={i} value={i} className="bg-gray-800">
                    {agent.name} ({agent.personality.primary}) - ${agent.bankroll}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Agent 2</label>
              <select 
                value={selectedAgent2} 
                onChange={(e) => setSelectedAgent2(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
              >
                {agents.map((agent, i) => (
                  <option key={i} value={i} className="bg-gray-800">
                    {agent.name} ({agent.personality.primary}) - ${agent.bankroll}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleStartNegotiation}
            disabled={negotiationInProgress}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600
                     font-semibold btn-hover disabled:opacity-50"
          >
            {negotiationInProgress ? 'Negotiating...' : 'Start AI Negotiation'}
          </button>
        </>
      )}

      {stakingPhase === 'stake' && agreedStake && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">${agreedStake}</div>
            <div className="text-sm text-white/60">Agreed stake amount</div>
          </div>
          
          <button
            onClick={handleConfirmStake}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-blue-600
                     font-semibold btn-hover"
          >
            Confirm & Stake PYUSD
          </button>
        </div>
      )}

      {stakingPhase === 'complete' && (
        <div className="text-center text-green-400">
          ✅ Stakes confirmed! Game ready to start.
        </div>
      )}

      {/* Negotiation Log */}
      {negotiationLog.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Negotiation Progress:</h4>
          <div className="bg-black/30 rounded-lg p-3 max-h-40 overflow-y-auto">
            {negotiationLog.map((log, i) => (
              <div key={i} className="text-sm text-white/80 py-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}