'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoGamePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to game page with demo mode parameter
    router.push('/game?demo=true')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center">
        <div className="text-6xl mb-4 emoji animate-pulse">🎮</div>
        <h2 className="text-title2 text-primary">Starting Demo Game...</h2>
        <p className="text-body text-secondary mt-2">Launching free practice mode</p>
      </div>
    </div>
  )
}