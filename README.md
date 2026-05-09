# CipherFlow — Private DeFi on Ethereum Sepolia

A fully functional DeFi application (Swap · Liquidity · Vaults) where every transaction
is encrypted end-to-end using **Zama Fully Homomorphic Encryption (FHE)**.

---

## How the FHE layer works (plain English)

1. You type an amount in the UI (e.g. "10 cUSDC")
2. The Zama Relayer SDK encrypts that number in your browser
3. The encrypted ciphertext goes to the smart contract on Sepolia
4. The contract does maths on the encrypted number WITHOUT ever decrypting it
5. Only you can decrypt your own balance — using a key generated in your browser

Nobody — not the relayer, not the node, not a block explorer — can see your amounts.

---

## Project structure

```
cipherflow/
├── contracts/          ← Solidity smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── ConfidentialToken.sol   ← Confidential ERC20 (cUSDC, cUSDT, WBTC, BNB, ZAMA)
│   │   ├── CipherFlowSwap.sol      ← Encrypted swap router
│   │   ├── CipherFlowPool.sol      ← Encrypted liquidity pool
│   │   ├── CipherFlowFactory.sol   ← Pool factory
│   │   └── CipherFlowVault.sol     ← Encrypted yield vault
│   └── scripts/deploy.js           ← Full deployment script
│
└── src/                ← React + Vite frontend
    ├── abis/           ← Contract ABIs
    ├── config/
    │   └── contracts.js  ← ← ← PASTE DEPLOYED ADDRESSES HERE
    ├── hooks/
    │   ├── useWallet.jsx         ← Wallet connection + state
    │   ├── useFhevm.jsx          ← Zama FHE instance
    │   ├── useTokenBalances.jsx  ← Live encrypted balances
    │   ├── usePools.jsx          ← Live pool data from chain
    │   ├── useVaults.jsx         ← Live vault data from chain
    │   └── useSwap.jsx           ← FHE swap execution
    ├── services/
    │   ├── fhevm.js        ← Zama SDK wrapper
    │   ├── web3.js         ← ethers provider helpers
    │   └── priceService.js ← CoinGecko live prices
    └── components/     ← Pages + modals + layout
```

---

## Step-by-step setup

### Step 1 — Install frontend deps

```bash
# In the cipherflow/ root folder
npm install
```

### Step 2 — Deploy smart contracts to Sepolia

```bash
cd contracts
npm install

# Copy the example env file and fill it in
cp .env.example .env
```

Edit `contracts/.env`:
```
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

Get free Sepolia ETH for gas: https://sepoliafaucet.com

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

The script will print something like:
```
✅ DEPLOYMENT COMPLETE — copy this into src/config/contracts.js

export const DEPLOYED = {
  TOKENS: {
    cUSDC: "0xAbCd...",
    ...
  },
  SWAP: "0x1234...",
  ...
}
```

### Step 3 — Paste addresses into frontend config

Open `src/config/contracts.js` and replace the zero addresses with
the real ones printed by the deploy script.

### Step 4 — Run the frontend

```bash
# Back in cipherflow/ root
npm run dev
```

App opens at → http://localhost:5173

---

## Using the app

### Swap
1. Connect MetaMask (must be on Sepolia)
2. Click the balance label next to "You pay" to fill max amount
3. Preview Swap → confirm → wallet asks you to sign 2 transactions:
   - Approve token spend
   - Submit encrypted swap

### Liquidity
1. Click "Add Liquidity"
2. Select fee tier + price range
3. Enter amounts → wallet signs 3 transactions:
   - Approve token 0
   - Approve token 1
   - Submit encrypted addLiquidity

### Vaults
1. Click "Deposit" on any vault
2. Enter amount → wallet signs 2 transactions:
   - Approve asset
   - Submit encrypted deposit
3. To withdraw: click "Withdraw" → signs 1 transaction (full balance + yield returned)

---

## Get test tokens

After deploying, each token has a `faucet()` function.
Call it from Hardhat console or Etherscan:

```bash
cd contracts
npx hardhat console --network sepolia

const tok = await ethers.getContractAt('CipherFlowToken', 'YOUR_CUSDC_ADDRESS')
await tok.faucet('YOUR_WALLET_ADDRESS', 1000_000_000n)  // 1000 cUSDC (6 decimals)
```

---

## FHE integration points (for your hackathon presentation)

| File | What it does |
|------|-------------|
| `src/services/fhevm.js` | Initialises Zama Relayer SDK, `encryptAmount()`, `decryptBalance()` |
| `src/hooks/useSwap.jsx` | Encrypts swap amount → calls `CipherFlowSwap.swap()` |
| `src/components/modals/AddLiquidityModal.jsx` | Encrypts both token amounts → calls `CipherFlowPool.addLiquidity()` |
| `src/components/modals/VaultModal.jsx` | Encrypts deposit → calls `CipherFlowVault.deposit()` |
| `contracts/contracts/CipherFlowSwap.sol` | FHE arithmetic: fee deduction, amount-out calculation |
| `contracts/contracts/CipherFlowPool.sol` | FHE LP shares: add/remove liquidity |
| `contracts/contracts/CipherFlowVault.sol` | FHE balance tracking + yield simulation |
