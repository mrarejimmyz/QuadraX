import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>QuadraX</h1>
        <p className="tagline">Agentic 4x4 Tic-Tac-Toe</p>
      </header>

      <main className="main">
        <div className="game-container">
          <div className="info-panel">
            <h2>Welcome to QuadraX</h2>
            <p>Blockchain-powered 4x4 Tic-Tac-Toe with AI agents and PYUSD staking</p>
            <div className="features">
              <div className="feature">
                <span className="icon">🎮</span>
                <span>Strategic 4x4 Gameplay</span>
              </div>
              <div className="feature">
                <span className="icon">🤖</span>
                <span>AI Agent Opponents</span>
              </div>
              <div className="feature">
                <span className="icon">💰</span>
                <span>PYUSD Staking</span>
              </div>
              <div className="feature">
                <span className="icon">⚡</span>
                <span>Hedera Fast Transactions</span>
              </div>
            </div>
            <div className="status">
              <p>Frontend initialization successful!</p>
              <p className="note">Connect your wallet to start playing</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>Built for ETHOnline 2024 | PYUSD × ASI × Hedera</p>
      </footer>
    </div>
  )
}

export default App
