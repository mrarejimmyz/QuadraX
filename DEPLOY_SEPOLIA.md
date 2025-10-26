# Deploy PYUSDStaking to Sepolia

## Quick Deploy

```powershell
# From the root directory (not frontend)
cd ..
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

## After Deployment

1. Copy the contract address from the output
2. Update `frontend/src/contracts/addresses.ts`:
   ```typescript
   sepolia: {
     PYUSD: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
     PYUSDStaking: 'YOUR_DEPLOYED_ADDRESS_HERE', // ← Paste here
     TicTacToe: '',
   }
   ```

## Verify Contract (Optional)

```powershell
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9" "YOUR_WALLET_ADDRESS"
```

## Prerequisites

- Sepolia ETH in your wallet (get from https://sepoliafaucet.com/)
- `.env` file with:
  - `PRIVATE_KEY` - Your wallet private key
  - `SEPOLIA_RPC_URL` or `INFURA_PROJECT_ID`
  - `ETHERSCAN_API_KEY` (for verification)
