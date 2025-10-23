// Temporary fix for the API - just reverting to simple threat detection
export function fixThreats() {
  console.log('Enhanced threat detection temporarily disabled - using basic blocking')
  return {
    blockAll: true,
    reason: 'Multiple threat detection enhancement in progress'
  }
}