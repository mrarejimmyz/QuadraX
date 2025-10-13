# 🤖 ASI Alliance Integration Plan

This document outlines how QuadraX will integrate with the Artificial Superintelligence Alliance (Fetch.ai + SingularityNET) to qualify for ETHOnline prize tracks while preserving a smooth developer and user experience.

## Goals
- Replace/augment local Ollama + CUDA inference with ASI:One (managed LLM + Chat Protocol)
- Register and orchestrate agents on Agentverse for discovery, hosting, and messaging
- Leverage MeTTa knowledge graphs for structured board-state reasoning
- Maintain a secure, human-in-the-loop transaction model for on-chain actions

## Architecture Overview

```
Frontend (Next.js)
  └─ Chat UI (ASI:One or Ollama)
Backend Adapter (Next API route)
  ├─ ASI:One Chat Protocol client
  ├─ Agentverse (uAgents) client
  ├─ Hedera JSON-RPC + Mirror queries
  └─ Action Router (approve, stake, claim)
Contracts (Hedera EVM)
  ├─ TicTacToe.sol
  └─ PYUSDStaking.sol
```

## Provider Toggle

Use an environment flag to switch AI providers at runtime:

```
# frontend/.env.local
AI_PROVIDER=asi # or "ollama"
ASI_ONE_API_URL=https://api.asi1.ai
AGENTVERSE_API_URL=https://api.agentverse.ai
```

- asi: Use ASI:One LLM + Chat Protocol and Agentverse agents
- ollama: Use local Ollama service (fallback/offline)

## Agent Intents and Guardrails
- approvePYUSD(amount)
- stake(amount, gameId)
- joinGame(gameId)
- makeMove(gameId, x, y)
- claimWinnings(gameId)

Guardrails:
- Max stake, min confirmations, network allow-list
- Dry-run read via mirror queries before write
- Human approval step in UI for sensitive actions

## MeTTa Knowledge Graphs (Planned)
- Encode board state and game rules as a small, queryable knowledge base
- Use MeTTa for legal move generation and strategic hints
- Provenance and privacy for agent-side reasoning artifacts

## Migration Path
1) Introduce AI provider abstraction in `conversationHandler.ts` and `ollamaService.ts`
2) Add `asiProvider.ts` with basic `sendMessage`, `stream`, `tools` calls
3) Implement backend API route to proxy ASI calls and enforce guardrails
4) Register QuadraX Assistant on Agentverse and list capabilities
5) Add minimal MeTTa store for board state experiments

## Deliverables for Judging
- Public repo (this)
- Testnet deployment on Hedera
- 2–4 minute demo video showing ASI chat + on-chain actions
- Documentation: this file + README prize section

## Security Notes
- Never share or store user private keys in agents
- All on-chain effects run server-side with strict policy
- Include rate limiting and input validation on chat/tool calls

## Links
- Fetch.ai Docs: https://innovationlab.fetch.ai/resources/docs/intro
- Agentverse: https://innovationlab.fetch.ai/resources/docs/agentverse/
- ASI:One: https://asi1.ai/
- MeTTa: https://metta-lang.dev/
