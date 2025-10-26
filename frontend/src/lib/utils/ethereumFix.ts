/**
 * Fix for multiple wallet extensions trying to inject window.ethereum
 * This prevents the "Cannot redefine property: ethereum" error
 */

if (typeof window !== 'undefined') {
  // Store original ethereum provider if it exists
  const originalEthereum = (window as any).ethereum

  // Prevent multiple injections by making ethereum property configurable
  try {
    Object.defineProperty(window, 'ethereum', {
      get() {
        return originalEthereum
      },
      set(newProvider) {
        // Only allow setting if not already defined
        if (!originalEthereum) {
          Object.defineProperty(window, 'ethereum', {
            value: newProvider,
            writable: false,
            configurable: true,
          })
        }
      },
      configurable: true,
    })
  } catch (error) {
    // Property already defined, ignore
    console.warn('Ethereum provider already injected')
  }
}

export {}
