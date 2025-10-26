/**
 * Console filter to suppress noisy browser extension messages
 * This only runs in development and doesn't affect functionality
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Store original console methods
  const originalLog = console.log
  const originalWarn = console.warn
  const originalError = console.error

  // Messages to suppress
  const suppressPatterns = [
    'Port disconnected',
    'Port connected',
    'reconnecting',
    'WalletConnect Core is already initialized',
  ]

  const shouldSuppress = (args: any[]): boolean => {
    const message = args[0]?.toString() || ''
    return suppressPatterns.some(pattern => message.includes(pattern))
  }

  // Override console.log
  console.log = (...args: any[]) => {
    if (!shouldSuppress(args)) {
      originalLog.apply(console, args)
    }
  }

  // Override console.warn
  console.warn = (...args: any[]) => {
    if (!shouldSuppress(args)) {
      originalWarn.apply(console, args)
    }
  }

  // Override console.error (be careful with this one)
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || ''
    
    // Only suppress specific known safe messages
    if (message.includes('Port disconnected') || message.includes('Port connected')) {
      return
    }
    
    originalError.apply(console, args)
  }
}

export {}
