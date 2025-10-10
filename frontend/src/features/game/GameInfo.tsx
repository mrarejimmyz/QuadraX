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
    <div className="space-y-4">
      {/* Status */}
      <div className={`${getStatusColor()} border rounded-xl p-4 text-center`}>
        <p className="text-lg font-semibold">{getStatusText()}</p>
      </div>

      {/* Players */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 text-white/80">Players</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-blue-400 font-semibold">Player X:</span>
            <span className="text-sm text-white/90">{shortenAddress(player1Address)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-pink-400 font-semibold">Player O:</span>
            <span className="text-sm text-white/90">{shortenAddress(player2Address)}</span>
          </div>
        </div>
      </div>

      {/* Pot */}
      {pot && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-white/80">Prize Pot</h3>
          <div className="text-2xl font-bold text-green-400">
            {pot} PYUSD
          </div>
        </div>
      )}

      {/* Game Instructions */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-2 text-white/80">How to Win</h3>
        <p className="text-xs text-white/70">
          Get 4 in a row (horizontal, vertical, or diagonal) to win the pot!
        </p>
      </div>
    </div>
  )
}
