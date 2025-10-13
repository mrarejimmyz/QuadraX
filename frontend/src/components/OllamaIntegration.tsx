'use client'

import React from 'react'
import { useEnhancedHederaAgents, OllamaStatusInterface } from '@/lib/agents/enhancedHederaAgentKit'
import { QuadraXAgent } from '@/lib/agents/quadraXAgent'

export function OllamaStatusPanel({ 
  status, 
  onRefresh 
}: { 
  status: OllamaStatusInterface
  onRefresh: () => void
}) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          Ollama Status
        </h3>
        <button onClick={onRefresh} className="px-4 py-2 rounded-lg bg-white/10">
          Refresh
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">Server: {status.connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.connected && status.model ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="text-sm">Model: {status.connected && status.model ? status.model : 'Not Available'}</span>
        </div>
      </div>
    </div>
  )
}

export function EnhancedAINegotiationPanel() {
  const { agents, ollamaStatus, initializeAgents } = useEnhancedHederaAgents()
  const [selectedAgent1, setSelectedAgent1] = React.useState(0)
  const [selectedAgent2, setSelectedAgent2] = React.useState(1)

  return (
    <div className="space-y-6">
      <OllamaStatusPanel status={ollamaStatus} onRefresh={initializeAgents} />
      
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">AI Agents</h3>
        {agents.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <select value={selectedAgent1} onChange={(e) => setSelectedAgent1(Number(e.target.value))}
                    className="p-3 rounded-lg bg-white/10">
              {agents.map((agent: QuadraXAgent, i: number) => (
                <option key={i} value={i}>{agent.name}</option>
              ))}
            </select>
            <select value={selectedAgent2} onChange={(e) => setSelectedAgent2(Number(e.target.value))}
                    className="p-3 rounded-lg bg-white/10">
              {agents.map((agent: QuadraXAgent, i: number) => (
                <option key={i} value={i}>{agent.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OllamaIntegration() {
  const { agents, ollamaStatus, initializeAgents } = useEnhancedHederaAgents()
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">QuadraX AI Integration</h1>
        <OllamaStatusPanel status={ollamaStatus} onRefresh={initializeAgents} />
      </div>
    </div>
  )
}
