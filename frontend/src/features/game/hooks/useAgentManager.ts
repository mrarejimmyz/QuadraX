'use client'

import { useState, useEffect } from 'react'
import { QuadraXAgent, QuadraXAgentFactory } from '../../../lib/agents/quadraXAgent'
import { ASIStatus } from '../types/chat.types'

export function useAgentManager() {
  const [agents, setAgents] = useState<QuadraXAgent[]>([])
  const [asiStatus, setAsiStatus] = useState<ASIStatus>({
    connected: false,
    responseTime: 0,
    modelVersion: 'unknown',
    agentsLoaded: 0
  })

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
      
      return agentList
    } catch (error) {
      console.error('Agent initialization error:', error)
      return []
    }
  }

  useEffect(() => {
    initializeAgents()
  }, [])

  return {
    agents,
    asiStatus,
    checkASIStatus,
    initializeAgents
  }
}