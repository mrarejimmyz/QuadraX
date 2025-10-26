'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import { formatUnits } from 'viem'
import { sepolia } from 'wagmi/chains'

// PYUSD contract address on Sepolia - Official PayPal USD
const PYUSD_ADDRESS = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9'

export function WalletBalance() {
  const { address, isConnected, chain } = useAccount()
  const chainId = useChainId()
  
  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
  })

  // Get PYUSD balance
  const { data: pyusdBalance } = useBalance({
    address,
    token: PYUSD_ADDRESS as `0x${string}`,
  })

  if (!isConnected || !address) {
    return null
  }

  const isWrongNetwork = chainId !== sepolia.id

  const formatBalance = (balance: bigint | undefined, decimals: number = 18): string => {
    if (!balance) return '0.00'
    const formatted = parseFloat(formatUnits(balance, decimals))
    
    // Format with proper decimal places - avoid exponential notation
    if (formatted === 0) return '0.00'
    if (formatted < 0.000001) return formatted.toFixed(8) // Very tiny amounts
    if (formatted < 0.01) return formatted.toFixed(6)     // Small amounts like 0.000001
    if (formatted < 1) return formatted.toFixed(4)        // Sub-1 amounts
    if (formatted < 1000) return formatted.toFixed(2)     // Normal amounts
    return formatted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) // Large amounts with commas
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {isWrongNetwork && (
        <div className="px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30 text-red-400 text-xs font-semibold animate-pulse">
          ⚠️ Switch to Sepolia
        </div>
      )}
      
      {/* ETH Balance */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 hover:bg-white/15 transition-colors">
        <span className="text-gray-300">ETH:</span>
        <span className="text-white font-semibold tabular-nums">
          {formatBalance(ethBalance?.value)}
        </span>
      </div>

      {/* PYUSD Balance */}
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30 hover:bg-green-500/25 transition-colors">
        <span className="text-green-300">PYUSD:</span>
        <span className="text-green-400 font-semibold tabular-nums">
          {formatBalance(pyusdBalance?.value, 6)}
        </span>
      </div>
    </div>
  )
}
