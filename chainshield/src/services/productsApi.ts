import { CHAIN_API_URL } from './chainApi';
import type { ProductRegistration } from '../store/appStore';

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('products-backend request timed out')), ms)
    ),
  ]);
}

export interface ProductsApiResult {
  ok: boolean;
  product?: ProductRegistration;
  error?: string;
}

export interface ProductsListResult {
  ok: boolean;
  products?: ProductRegistration[];
  error?: string;
}

/** Manufacturer submits a new product — stored on the shared backend, not just locally. */
export async function submitProduct(
  product: Omit<ProductRegistration, 'id' | 'status' | 'items'>
): Promise<ProductsApiResult> {
  try {
    const res = await withTimeout(
      fetch(`${CHAIN_API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }),
      8000
    );
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Could not reach products backend' };
  }
}

/** Shared pending-approvals list — same on every admin device. */
export async function fetchPendingProducts(): Promise<ProductsListResult> {
  try {
    const res = await withTimeout(fetch(`${CHAIN_API_URL}/api/products/pending`), 8000);
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Could not reach products backend' };
  }
}

/** Shared "registered products" list, with full metadata the chain alone doesn't carry. */
export async function fetchApprovedProducts(): Promise<ProductsListResult> {
  try {
    const res = await withTimeout(fetch(`${CHAIN_API_URL}/api/products/approved`), 8000);
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Could not reach products backend' };
  }
}

// Approval writes ONE on-chain transaction PER UNIT (quantity), so this can
// take a while for larger batches — give it a generous timeout. Keep demo
// quantities small (3-5) so this stays fast in front of the guide.
export async function approveProductOnBackend(id: string): Promise<ProductsApiResult> {
  try {
    const res = await withTimeout(
      fetch(`${CHAIN_API_URL}/api/products/${encodeURIComponent(id)}/approve`, { method: 'POST' }),
      45000
    );
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Could not reach products backend' };
  }
}

export async function rejectProductOnBackend(id: string): Promise<ProductsApiResult> {
  try {
    const res = await withTimeout(
      fetch(`${CHAIN_API_URL}/api/products/${encodeURIComponent(id)}/reject`, { method: 'POST' }),
      8000
    );
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Could not reach products backend' };
  }
}