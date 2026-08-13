# ChainShield — chain-backend

Real blockchain layer for the ChainShield app: a Solidity smart contract
deployed on a local Ganache blockchain, plus a small Express server the
app talks to over REST (no MetaMask needed on mobile).

```
contracts/ChainShield.sol   — the smart contract
scripts/deploy.js           — compiles + deploys it to Ganache
server/index.js             — REST API the app calls (add / verify / scan)
hardhat.config.js           — points Hardhat at your local Ganache
```

## One-time setup

```bash
cd chain-backend
npm install
```

## Every time you want to demo (4 terminals, in this order)

**Terminal 1 — start the local blockchain and leave it running:**
```bash
npm run chain
```
This is Ganache with `--deterministic`, so you get the same 10 test
accounts (with 100 ETH each) and, importantly, the **same contract
address** every time you redeploy — nothing to reconfigure between runs.

**Terminal 2 — compile + deploy the contract (run once per `npm run chain` session):**
```bash
npm run deploy
```
This writes `deployments.json` (contract address + ABI). The backend
server reads this file, so always run this *before* starting the server.

**Terminal 3 — start the backend API:**
```bash
npm run server
```
You should see:
```
ChainShield chain-backend listening on http://localhost:4000
Contract: 0x...  (network: ganache)
```
Quick check it's alive: open `http://localhost:4000/api/chain/health`
in a browser — should return JSON with `"ok": true`.

**Terminal 4 — start the app itself, from the `chainshield/` folder:**
```bash
cd ../chainshield
npm run web       # or: npm run android / npm run ios
```

## How the app talks to this backend

See `chainshield/src/services/chainApi.ts` — by default it assumes
`http://localhost:4000` (or `http://10.0.2.2:4000` on an Android
emulator). For a physical phone over Expo Go, both your phone and
laptop need to be on the same Wi-Fi, and you should set your laptop's
LAN IP explicitly:

```bash
# in chainshield/.env
EXPO_PUBLIC_CHAIN_API_URL=http://192.168.1.42:4000
```//replace with your actual LAN IP (ipconfig / ifconfig)

## What actually happens on-chain vs. what doesn't

- **On-chain (real):** a product is written to the contract the moment
  an admin approves it (`addProduct`); every scan by a customer is also
  a real transaction (`recordScan`), so scan counts are tamper-evident
  too. Verifying a product (`getProduct`) is a free read call.
- **Off-chain (by design):** manufacturer/admin accounts, the pending
  →approved workflow state, and UI-level history are kept in the app's
  local store (AsyncStorage) — only the parts that need to be
  tamper-proof are written to the chain. This matches how the paper
  describes the system and keeps gas costs down.
- **Honest fallback:** if the backend/Ganache isn't running when an
  admin approves a product, the app still lets the approval go through
  locally so a demo doesn't hard-crash, but it tags that product
  `onChain: false` and shows an "Offline" badge instead of "On-chain" —
  it never pretends a local-only approval is a real transaction.

## If `npm run deploy` fails to download the Solidity compiler

Some college/hostel networks block `binaries.soliditylang.org`. If you
hit `HH502: Couldn't download compiler`, try a different network
(mobile hotspot works), or ask on the Hardhat Discord for the
`--force-download-cache` workaround. This is unrelated to the app code
itself — it's purely Hardhat fetching the Solidity compiler the first
time.

## Troubleshooting

- **"deployments.json not found"** when starting the server → you skipped
  `npm run deploy`, or you ran it against a different `npm run chain`
  session. Re-run deploy.
- **App shows "Offline" badges everywhere** → the backend isn't running,
  or `EXPO_PUBLIC_CHAIN_API_URL` is pointing at the wrong host. Check
  `/api/chain/health` in a browser first.
- **Ganache prints a µWS warning on startup** → harmless, it just falls
  back to a slower pure-JS server implementation. Ignore it.
