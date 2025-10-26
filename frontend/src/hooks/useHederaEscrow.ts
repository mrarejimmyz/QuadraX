// Hook for managing Hedera escrow state

import { useState, useEffect, useCallback } from 'react'
import { getHederaAgent, type HederaEscrowStatus } from '@/lib/agents/hedera'

export function useHederaEscrow(escrowId: string | null) {
  const [status, setStatus] = useState<HederaEscrowStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch escrow status
  const fetchStatus = useCallback(async () => {
    if (!escrowId) return

    setLoading(true)
    setError(null)

    try {
      const agent = getHederaAgent()
      const escrowStatus = await agent.getEscrowStatus(escrowId)
      setStatus(escrowStatus)
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch escrow status:', err)
    } finally {
      setLoading(false)
    }
  }, [escrowId])

  // Deposit stake
  const depositStake = useCallback(async (
    playerAddress: string,
    amount: number
  ) => {
    if (!escrowId) {
      throw new Error('No escrow ID')
    }

    setLoading(true)
    setError(null)

    try {
      const agent = getHederaAgent()
      await agent.initialize()
      
      const result = await agent.depositStake(escrowId, playerAddress, amount)
      
      if (!result.success) {
        throw new Error(result.message)
      }

      // Refresh status
      await fetchStatus()

      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [escrowId, fetchStatus])

  // Release funds to winner
  const releaseToWinner = useCallback(async (winnerAddress: string) => {
    if (!escrowId) {
      throw new Error('No escrow ID')
    }

    setLoading(true)
    setError(null)

    try {
      const agent = getHederaAgent()
      await agent.initialize()
      
      const result = await agent.releaseToWinner(escrowId, winnerAddress)
      
      if (!result.success) {
        throw new Error(result.message)
      }

      // Refresh status
      await fetchStatus()

      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [escrowId, fetchStatus])

  // Refund stakes
  const refundStakes = useCallback(async () => {
    if (!escrowId) {
      throw new Error('No escrow ID')
    }

    setLoading(true)
    setError(null)

    try {
      const agent = getHederaAgent()
      await agent.initialize()
      
      const result = await agent.refundStakes(escrowId)
      
      if (!result.success) {
        throw new Error(result.message)
      }

      // Refresh status
      await fetchStatus()

      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [escrowId, fetchStatus])

  // Auto-fetch status on mount and when escrowId changes
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    depositStake,
    releaseToWinner,
    refundStakes,
    refreshStatus: fetchStatus
  }
}
