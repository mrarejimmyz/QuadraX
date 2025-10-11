'use client'

import { useEffect, useState } from 'react'

export function WalletConnectSetupNotice() {
  const [showNotice, setShowNotice] = useState(false)

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    if (!projectId || projectId === '') {
      setShowNotice(true)
    }
  }, [])

  if (!showNotice) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-yellow-400 text-xl">⚠️</div>
        <div>
          <h3 className="text-yellow-100 font-semibold mb-2">WalletConnect Setup Needed</h3>
          <p className="text-yellow-200/80 text-sm mb-3">
            For full wallet compatibility (including mobile wallets), please:
          </p>
          <ol className="text-yellow-200/80 text-sm space-y-1 mb-3">
            <li>1. Visit <a href="https://cloud.walletconnect.com" target="_blank" rel="noopener noreferrer" className="text-yellow-300 underline">cloud.walletconnect.com</a></li>
            <li>2. Create an account and new project</li>
            <li>3. Copy the Project ID</li>
            <li>4. Add it to <code className="bg-black/20 px-1 rounded">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> in .env.local</li>
          </ol>
          <p className="text-yellow-200/60 text-xs">
            MetaMask and other browser wallets will still work without this setup.
          </p>
        </div>
      </div>
    </div>
  )
}