'use client'

import { useEffect } from 'react'

export function HydrationFix({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress hydration warnings in development
    const originalError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Hydration') ||
         args[0].includes('hydrating') ||
         args[0].includes('did not match'))
      ) {
        return
      }
      originalError.call(console, ...args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return <>{children}</>
}
