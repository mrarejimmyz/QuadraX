'use client'

import { Suspense } from 'react'
import GamePageContent from './GamePageContent'

export default function GameClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎮</div>
          <h2 className="text-2xl text-white font-bold">Loading QuadraX...</h2>
        </div>
      </div>
    }>
      <GamePageContent />
    </Suspense>
  )
}
