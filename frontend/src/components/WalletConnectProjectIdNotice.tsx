'use client'

import { useEffect, useState } from 'react'

export function WalletConnectProjectIdNotice() {
  const [needsRealProjectId, setNeedsRealProjectId] = useState(false)

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    const isPlaceholder = !projectId || 
                         projectId.includes('placeholder') || 
                         projectId === 'a1b2c3d4e5f6789012345678901234567890abcd' ||
                         projectId.length < 32

    setNeedsRealProjectId(isPlaceholder)
  }, [])

  if (!needsRealProjectId) return null

  return (
    <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-red-400 text-2xl">🚨</div>
        <div>
          <h3 className="text-red-100 font-bold text-lg mb-3">Action Required: Get Real WalletConnect Project ID</h3>
          
          <div className="bg-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-200 font-semibold mb-2">Your wallet may not work properly without a valid Project ID!</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-red-200 font-semibold">📋 Quick Setup (2 minutes):</h4>
            <ol className="text-red-200/90 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-red-500/30 text-red-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  Visit <a href="https://cloud.walletconnect.com" target="_blank" rel="noopener noreferrer" className="text-red-300 underline font-semibold">cloud.walletconnect.com</a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-red-500/30 text-red-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <div>Sign up with your email (it's free!)</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-red-500/30 text-red-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <div>Create new project named "QuadraX"</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-red-500/30 text-red-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <div>Copy the Project ID (32-character string)</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-red-500/30 text-red-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
                <div>
                  Replace <code className="bg-black/30 px-2 py-1 rounded text-xs">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> in <code className="bg-black/30 px-2 py-1 rounded text-xs">.env.local</code>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-red-500/30 text-red-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">6</span>
                <div>Restart dev server: <code className="bg-black/30 px-2 py-1 rounded text-xs">npm run dev</code></div>
              </li>
            </ol>
          </div>

          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
            <p className="text-yellow-200 text-xs">
              💡 <strong>Why needed?</strong> WalletConnect Project ID enables mobile wallet support, 
              QR code scanning, and proper wallet compatibility across all devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}