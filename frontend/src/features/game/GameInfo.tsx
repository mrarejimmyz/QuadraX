'use client'

interface GameInfoProps {
  currentPlayer: number
  player1Address?: string
  player2Address?: string
  pot?: string
  gameStatus?: string
}

export default function GameInfo({
  currentPlayer,
  player1Address,
  player2Address,
  pot,
  gameStatus = 'waiting'
}: GameInfoProps) {
  const shortenAddress = (address?: string) => {
    if (!address) return 'Not set'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusColor = () => {
    switch (gameStatus) {
      case 'playing':
        return 'bg-green-500/20 border-green-500/40'
      case 'waiting':
        return 'bg-yellow-500/20 border-yellow-500/40'
      case 'finished':
        return 'bg-blue-500/20 border-blue-500/40'
      default:
        return 'bg-white/20 border-white/40'
    }
  }

  const getStatusText = () => {
    switch (gameStatus) {
      case 'playing':
        return `Player ${currentPlayer === 1 ? 'X' : 'O'}'s Turn`
      case 'waiting':
        return 'Waiting for players...'
      case 'finished':
        return 'Game Finished!'
      default:
        return 'Ready to start'
    }
  }

  return (
    <div className="space-y-6">
      {/* Apple-style Status Card */}
      <div className={`glass-thick border-2 rounded-2xl p-6 text-center relative overflow-hidden ${getStatusColor()}`}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-3 h-3 rounded-full bg-current animate-pulse"></div>
          <p className="text-lg font-semibold">{getStatusText()}</p>
        </div>
      </div>

      {/* Enhanced Players Card */}
      <div className="glass-thick rounded-2xl p-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <h3 className="text-sm font-semibold mb-4 text-white/80 flex items-center gap-2">
          <span>👥</span> Players
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 glass-ultra-thin rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 
                              flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">X</span>
              </div>
              <span className="text-cyan-400 font-semibold">Player</span>
            </div>
            <span className="text-sm text-white/90 font-mono bg-white/5 px-2 py-1 rounded-lg">
              {shortenAddress(player1Address)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 glass-ultra-thin rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 
                              flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">O</span>
              </div>
              <span className="text-pink-400 font-semibold">QuadraX AI</span>
            </div>
            <span className="text-sm text-white/90 font-mono bg-white/5 px-2 py-1 rounded-lg">
              {shortenAddress(player2Address)}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Prize Pot */}
      {pot && (
        <div className="glass-thick rounded-2xl p-6 border border-green-400/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/5"></div>
          <div className="relative">
            <h3 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
              <span>💰</span> Prize Pool
            </h3>
            <div className="text-center">
              <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 
                              bg-clip-text text-transparent">
                {pot} PYUSD
              </div>
              <p className="text-xs text-green-400/80 mt-1">Winner takes all</p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Rules Card */}
      <div className="glass-thick rounded-2xl p-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <h3 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
          <span>🎯</span> Win Conditions
        </h3>
        <div className="space-y-2 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span>4 in a row (horizontal/vertical/diagonal)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
            <span>2×2 square block anywhere</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
            <span>First to achieve pattern wins!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
