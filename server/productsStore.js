const fs = require("fs");
const path = require("path");

// Same pattern as users.json — a small, gitignored JSON file next to this
// module. Not a "real" production database, but it IS a single shared
// source of truth on the server, so every device talking to this backend
// sees the same pending/approved product lists (unlike the old design,
// where pending products only ever lived in one device's local storage).
const STORE_PATH = path.join(__dirname, "products.json");

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    return { pending: [], approved: [] };
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      pending: Array.isArray(parsed.pending) ? parsed.pending : [],
      approved: Array.isArray(parsed.approved) ? parsed.approved : [],
    };
  } catch {
    // Corrupt or empty file — fail safe rather than crashing the server.
    return { pending: [], approved: [] };
  }
}

function saveStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

module.exports = { loadStore, saveStore };