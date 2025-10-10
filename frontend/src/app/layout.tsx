import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuadraX - Agentic 4x4 Tic-Tac-Toe',
  description: 'Blockchain-powered 4x4 Tic-Tac-Toe with AI agents and PYUSD staking',
  keywords: ['blockchain', 'tictactoe', 'AI', 'PYUSD', 'Hedera', 'Web3', 'ETHOnline'],
  authors: [{ name: 'QuadraX Team' }],
  openGraph: {
    title: 'QuadraX - Agentic 4x4 Tic-Tac-Toe',
    description: 'Blockchain-powered 4x4 Tic-Tac-Toe with AI agents and PYUSD staking',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
