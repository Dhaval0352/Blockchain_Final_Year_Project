import { Platform } from 'react-native';

// Where the chain-backend (server/index.js) is running.
//
//  - Web (npm run web):              http://localhost:4000 works as-is.
//  - Android emulator:                10.0.2.2 maps to your computer's
//                                      localhost — change BACKEND_HOST below.
//  - Physical phone (Expo Go):        use your computer's LAN IP, e.g.
//                                      "192.168.1.42", and make sure the
//                                      phone is on the same Wi-Fi network.
//
// Easiest fix for a demo: set EXPO_PUBLIC_CHAIN_API_URL in a .env file,
// e.g.  EXPO_PUBLIC_CHAIN_API_URL=http://192.168.1.42:4000
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const CHAIN_API_URL =
  process.env.EXPO_PUBLIC_CHAIN_API_URL || `http://${DEFAULT_HOST}:4000`;

export interface ChainAddProductInput {
  id: string;
  productName: string;
  batchNumber?: string;
  manufacturerName?: string;
  category?: string;
  mfgDate?: string;
  expDate?: string;
}

export interface ChainAddProductResult {
  ok: boolean;
  txHash?: string;
  blockNumber?: number;
  error?: string;
}

export interface ChainProductRecord {
  ok: boolean;
  exists: boolean;
  productName?: string;
  batchNumber?: string;
  manufacturerName?: string;
  category?: string;
  mfgDate?: string;
  expDate?: string;
  onChainTimestamp?: string;
  error?: string;
}

async function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('chain-backend request timed out')), ms)
    ),
  ]);
}

/** Writes a newly-approved product on-chain. Called once, at approval time. */
export async function addProductOnChain(
  input: ChainAddProductInput
): Promise<ChainAddProductResult> {
  try {
    const res = await withTimeout(
      fetch(`${CHAIN_API_URL}/api/chain/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    );
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Could not reach chain-backend' };
  }
}

/** Free read — used to verify a scanned product against the chain. */
export async function verifyProductOnChain(id: string): Promise<ChainProductRecord> {
  try {
    const res = await withTimeout(fetch(`${CHAIN_API_URL}/api/chain/products/${encodeURIComponent(id)}`));
    return await res.json();
  } catch (err: any) {
    return { ok: false, exists: false, error: err?.message || 'Could not reach chain-backend' };
  }
}

/** Records a scan on-chain (best-effort — a failure here shouldn't block the UI). */
export async function recordScanOnChain(id: string): Promise<{ ok: boolean; scanCount?: string }> {
  try {
    const res = await withTimeout(
      fetch(`${CHAIN_API_URL}/api/chain/products/${encodeURIComponent(id)}/scan`, { method: 'POST' })
    );
    return await res.json();
  } catch {
    return { ok: false };
  }
}

export async function checkChainHealth(): Promise<boolean> {
  try {
    const res = await withTimeout(fetch(`${CHAIN_API_URL}/api/chain/health`), 3000);
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}
