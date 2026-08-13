const fs = require("fs");
const path = require("path");
const express = require("express");
const authRouter = require('./auth');
const cors = require("cors");
const { ethers } = require("ethers");
const { loadStore, saveStore } = require("./productsStore");

const PORT = process.env.PORT || 4000;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const DEPLOYMENT_PATH = path.join(__dirname, "..", "deployments.json");

function loadDeployment() {
  if (!fs.existsSync(DEPLOYMENT_PATH)) {
    throw new Error(
      `deployments.json not found at ${DEPLOYMENT_PATH}. Run "npm run deploy" first.`
    );
  }
  return JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, "utf8"));
}

// Ganache (unlike Hardhat's own network) doesn't populate ethers' usual
// err.reason on a revert — the human-readable message shows up nested in
// err.info.error.message instead, prefixed with "revert ". This pulls it
// out so the app gets "ChainShield: product already registered" instead
// of a huge dump of raw call data.
function extractRevertReason(err) {
  const nested = err?.info?.error?.message;
  if (typeof nested === "string") {
    const marker = "revert ";
    const idx = nested.indexOf(marker);
    if (idx !== -1) return nested.slice(idx + marker.length);
    return nested;
  }
  return err.reason || err.shortMessage || String(err);
}

// Turns any human-readable product id (e.g. "p_1737..._ab12cd") into a
// stable bytes32 value the contract can use as a mapping key. Doing this
// with keccak256 means both the app and this server always derive the
// exact same on-chain id from the same string id, without having to store
// a separate mapping anywhere.
function toBytes32Id(idString) {
  return ethers.keccak256(ethers.toUtf8Bytes(idString));
}

async function main() {
  const deployment = loadDeployment();

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  // account #0 from Ganache's deterministic mnemonic — the contract owner,
  // acts on behalf of "the system" whenever the admin approves a product.
  const ownerSigner = await provider.getSigner(0);

  const contractRead = new ethers.Contract(deployment.address, deployment.abi, provider);
  const contractWrite = new ethers.Contract(deployment.address, deployment.abi, ownerSigner);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRouter);

  app.get("/api/chain/health", async (req, res) => {
    try {
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      res.json({
        ok: true,
        contractAddress: deployment.address,
        chainId: network.chainId.toString(),
        blockNumber,
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  // Called right after the admin approves a manufacturer's product —
  // this is the moment the record actually gets written on-chain.
  app.post("/api/chain/products", async (req, res) => {
    try {
      const {
        id, // app-level string id, e.g. "p_1737512345_ab12cd"
        productName,
        batchNumber,
        manufacturerName,
        category,
        mfgDate, // ISO date string
        expDate, // ISO date string
      } = req.body;

      if (!id || !productName) {
        return res.status(400).json({ ok: false, error: "id and productName are required" });
      }

      const productIdBytes32 = toBytes32Id(id);
      const mfgTs = mfgDate ? Math.floor(new Date(mfgDate).getTime() / 1000) : 0;
      const expTs = expDate ? Math.floor(new Date(expDate).getTime() / 1000) : 0;

      const tx = await contractWrite.addProduct(
        productIdBytes32,
        productName,
        batchNumber || "",
        manufacturerName || "",
        category || "",
        mfgTs,
        expTs
      );
      const receipt = await tx.wait();

      res.json({
        ok: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        productIdBytes32,
      });
    } catch (err) {
      // e.g. "ChainShield: product already registered"
      res.status(400).json({ ok: false, error: extractRevertReason(err) });
    }
  });

  // Free read — used by the customer app to verify a scanned product.
  app.get("/api/chain/products/:id", async (req, res) => {
    try {
      const productIdBytes32 = toBytes32Id(req.params.id);
      const result = await contractRead.getProduct(productIdBytes32);

      if (!result[0]) {
        return res.json({ ok: true, exists: false });
      }

      res.json({
        ok: true,
        exists: true,
        productName: result[1],
        batchNumber: result[2],
        manufacturerName: result[3],
        category: result[4],
        mfgDate: result[5].toString(),
        expDate: result[6].toString(),
        onChainTimestamp: result[7].toString(),
        productIdBytes32,
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  // Called every time a customer scans a product's QR code.
  app.post("/api/chain/products/:id/scan", async (req, res) => {
    try {
      const productIdBytes32 = toBytes32Id(req.params.id);
      const tx = await contractWrite.recordScan(productIdBytes32);
      const receipt = await tx.wait();
      const count = await contractRead.scanCount(productIdBytes32);

      res.json({ ok: true, scanCount: count.toString(), txHash: receipt.hash });
    } catch (err) {
      res.status(400).json({ ok: false, error: extractRevertReason(err) });
    }
  });

  // ============================================================
  // Shared product registry — pending submissions and approved
  // records live in server/products.json, so any device talking to
  // this backend sees the same lists (fixes the old "pending
  // products only exist on the submitting device" gap).
  // ============================================================

  // Manufacturer submits a new product for review. Not written to the
  // chain yet — only becomes an on-chain record once an admin approves it.
  app.post("/api/products", (req, res) => {
    try {
      const {
        manufacturerId,
        productName,
        category,
        batchNumber,
        mfgDate,
        expDate,
        mrp,
        description,
        imageUrl,
        quantity,
      } = req.body;

      if (!productName || !batchNumber) {
        return res.status(400).json({ ok: false, error: "productName and batchNumber are required" });
      }

      // Cap quantity so a mistyped huge number can't trigger hundreds of
      // sequential on-chain transactions at approval time.
      const qty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));
      const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const store = loadStore();
      const pendingProduct = {
        id,
        manufacturerId: manufacturerId || "",
        productName,
        category: category || "",
        batchNumber,
        mfgDate: mfgDate || "",
        expDate: expDate || "",
        mrp: mrp || "",
        description: description || "",
        imageUrl: imageUrl || "",
        quantity: qty,
        status: "PENDING",
        submittedAt: new Date().toISOString(),
      };
      store.pending.push(pendingProduct);
      saveStore(store);

      res.json({ ok: true, product: pendingProduct });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
  });

  // Shared pending-approvals list — any admin device sees every
  // manufacturer's submissions, not just ones made from the same phone.
  app.get("/api/products/pending", (req, res) => {
    const store = loadStore();
    res.json({ ok: true, products: store.pending });
  });

  // Shared "registered products" list, with full metadata (MRP,
  // description, image) that the on-chain record alone doesn't carry.
  app.get("/api/products/approved", (req, res) => {
    const store = loadStore();
    res.json({ ok: true, products: store.approved });
  });

  // Approve a pending product: writes ONE on-chain record PER PHYSICAL
  // UNIT (quantity), each with its own unique id — e.g.
  // "p_172..._ab12-0001", "...-0002", etc. Every printed QR code is then
  // independently verifiable, so two genuine customers scanning two
  // different physical units never collide with each other, and the
  // suspicious-activity check (Section IV-B) reflects a single unit's
  // real scan history instead of an entire batch's.
  app.post("/api/products/:id/approve", async (req, res) => {
    try {
      const store = loadStore();
      const idx = store.pending.findIndex((p) => p.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ ok: false, error: "Pending product not found" });
      }
      const product = store.pending[idx];
      const qty = product.quantity || 1;

      const mfgTs = product.mfgDate ? Math.floor(new Date(product.mfgDate).getTime() / 1000) : 0;
      const expTs = product.expDate ? Math.floor(new Date(product.expDate).getTime() / 1000) : 0;

      const items = [];
      for (let i = 1; i <= qty; i++) {
        const itemId = `${product.id}-${String(i).padStart(4, "0")}`;
        const itemIdBytes32 = toBytes32Id(itemId);
        // Idempotency: a previous approve attempt may have partially
        // succeeded (some units written, then a later unit failed and
        // aborted the request). Retrying would try to re-write an
        // already-registered id, which reverts and gets the product
        // stuck in "pending" forever. Skip units that already exist.
        const existing = await contractRead.getProduct(itemIdBytes32);
        if (existing[0]) {
          items.push({ itemId, txHash: "already-registered", blockNumber: undefined });
          continue;
        }

        const tx = await contractWrite.addProduct(
          itemIdBytes32,
          product.productName,
          product.batchNumber || "",
          product.manufacturerId || "",
          product.category || "",
          mfgTs,
          expTs
        );
        const receipt = await tx.wait();

        items.push({ itemId, txHash: receipt.hash, blockNumber: receipt.blockNumber });
      }

      const approvedProduct = {
        ...product,
        status: "APPROVED",
        approvedAt: new Date().toISOString(),
        items, // one QR-worth of data per physical unit
      };

      store.pending.splice(idx, 1);
      store.approved.push(approvedProduct);
      saveStore(store);

      res.json({ ok: true, product: approvedProduct });
    } catch (err) {
      res.status(400).json({ ok: false, error: extractRevertReason(err) });
    }
  });

  app.post("/api/products/:id/reject", (req, res) => {
    const store = loadStore();
    const idx = store.pending.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: "Pending product not found" });
    }
    const [rejected] = store.pending.splice(idx, 1);
    rejected.status = "REJECTED";
    saveStore(store);
    res.json({ ok: true, product: rejected });
  });
  app.listen(PORT, () => {
    console.log(`ChainShield chain-backend listening on http://localhost:${PORT}`);
    console.log(`Contract: ${deployment.address}  (network: ${deployment.network})`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
