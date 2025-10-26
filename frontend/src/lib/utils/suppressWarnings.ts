/**
 * Suppress known warnings in development
 */

if (typeof window !== 'undefined') {
  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || ''
    
    // Suppress hydration errors (common with wallet connections)
    if (
      message.includes('Hydration') ||
      message.includes('hydrating') ||
      message.includes('did not match') ||
      message.includes('Cannot redefine property: ethereum')
    ) {
      return
    }
    
    originalError.apply(console, args)
  }

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || ''
    
    // Suppress wallet extension warnings
    if (
      message.includes('Port disconnected') ||
      message.includes('Multiple wallet extensions')
    ) {
      return
    }
    
    originalWarn.apply(console, args)
  }
}

export {}
