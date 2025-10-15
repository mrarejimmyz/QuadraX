'use client'

import { useState } from 'react'

interface BoardProps {
  board: number[]
  onCellClick: (index: number) => void
  currentPlayer: number
  disabled?: boolean
  gamePhase?: 'placement' | 'movement'
  piecesPlaced?: {player1: number, player2: number}
  selectedCell?: number | null
}

export default function Board({ 
  board, 
  onCellClick, 
  currentPlayer, 
  disabled = false, 
  gamePhase = 'placement',
  piecesPlaced = {player1: 0, player2: 0},
  selectedCell = null 
}: BoardProps) {
  const getCellContent = (value: number) => {
    if (value === 1) return 'X'
    if (value === 2) return 'O'
    return ''
  }

  const getCellColor = (value: number) => {
    if (value === 1) return 'text-cyan-400 drop-shadow-lg'
    if (value === 2) return 'text-pink-400 drop-shadow-lg'
    return 'text-white/30'
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🎯 4x4 Strategic Tic-Tac-Toe
          </h3>
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="text-sm font-semibold text-cyan-400">
              X: {piecesPlaced.player1}/4
            </div>
            <div className="text-xs text-white/60 bg-slate-700/50 px-2 py-1 rounded">
              {gamePhase === 'placement' ? '🔹 Placement Phase' : '🔄 Movement Phase'}
            </div>
            <div className="text-sm font-semibold text-pink-400">
              O: {piecesPlaced.player2}/4
            </div>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>
        
        {/* Enhanced Game Board */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 shadow-inner">
          
          {/* Premium 4x4 Grid */}
          <div 
            className="grid gap-3 mx-auto"
            style={{ 
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              width: '320px',
              height: '320px'
            }}
          >
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => !disabled && onCellClick(index)}
                disabled={disabled}
                className={`
                  relative group
                  flex items-center justify-center
                  text-3xl font-black
                  ${selectedCell === index 
                    ? 'bg-gradient-to-br from-yellow-400/30 to-orange-400/30 border-2 border-yellow-400/70' 
                    : 'bg-gradient-to-br from-slate-700/80 to-slate-800/90 border-2 border-slate-600/50'
                  }
                  rounded-xl shadow-lg
                  ${getCellColor(cell)}
                  ${!disabled && (
                    (gamePhase === 'placement' && cell === 0 && piecesPlaced.player1 < 4 && currentPlayer === 1) ||
                    (gamePhase === 'movement' && currentPlayer === 1 && (cell === 1 || (selectedCell !== null && cell === 0)))
                  )
                    ? 'cursor-pointer hover:shadow-xl hover:scale-105 hover:border-white/40' 
                    : !disabled && cell !== 0
                    ? 'cursor-default' 
                    : 'cursor-not-allowed opacity-60'
                  }
                  transition-all duration-200 ease-out
                  backdrop-blur-sm
                `}
              >
                {/* Cell highlight effects */}
                {!disabled && (
                  <>
                    {/* Empty cell hover */}
                    {cell === 0 && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-200"></div>
                    )}
                    
                    {/* Player piece selection hint in movement phase */}
                    {gamePhase === 'movement' && currentPlayer === 1 && cell === 1 && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/10 to-blue-400/10 group-hover:from-cyan-400/30 group-hover:to-blue-400/30 transition-all duration-200"></div>
                    )}
                  </>
                )}
                
                {/* Cell content */}
                <span className="relative z-10 drop-shadow-lg">
                  {getCellContent(cell)}
                </span>
                
                {/* Cell number indicator (subtle) */}
                {!disabled && cell === 0 && (
                  <span className="absolute top-1 left-1 text-xs text-white/20 font-mono">
                    {index + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Enhanced Turn Indicator */}
        <div className="text-center mt-6">
          {disabled ? (
            <div className="bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600/30">
              <p className="text-sm text-white/60 font-medium">Game not active</p>
            </div>
          ) : currentPlayer === 1 ? (
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl px-6 py-3 border border-cyan-400/30">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-cyan-400 font-bold text-lg">Your Turn</p>
                  <p className="text-cyan-300/80 text-sm">
                    {gamePhase === 'placement' 
                      ? `Place X (${4 - piecesPlaced.player1} left)`
                      : selectedCell !== null 
                      ? 'Click empty cell to move selected X'
                      : 'Click any of your X pieces to select & move'
                    }
                  </p>
                  {gamePhase === 'movement' && selectedCell === null && (
                    <p className="text-cyan-200/60 text-xs mt-1">
                      💡 Your X pieces have a blue glow - click them!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl px-6 py-3 border border-pink-400/30">
              <div className="flex items-center justify-center gap-2 animate-pulse">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-pink-400 font-bold text-lg">AI Turn</p>
                  <p className="text-pink-300/80 text-sm">
                    {gamePhase === 'placement'
                      ? `Placing O (${4 - piecesPlaced.player2} left)`
                      : 'Moving strategically...'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
