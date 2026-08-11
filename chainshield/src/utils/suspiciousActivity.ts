import type { ScanResult } from '../store/appStore';

export type SuspicionReason = 'RAPID_RESCAN' | 'HIGH_SCAN_COUNT';

export interface SuspicionCheckResult {
  suspicious: boolean;
  reasons: SuspicionReason[];
  message: string | null;
}

// A single physical product being scanned again within this window
// (on this phone) almost never happens for a genuine, one-time purchase —
// scanning twice in quick succession usually means someone is testing
// whether a *duplicated* QR code still "works" from a second copy.
const RAPID_RESCAN_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

// A product scanned this many times globally (on-chain, across all
// devices/users) is unusual for a single retail unit — real customers
// scan a product once or twice, not dozens of times.
const HIGH_SCAN_COUNT_THRESHOLD = 5;

export function checkSuspiciousActivity(
  productId: string,
  onChainScanCount: number,
  localScanHistory: ScanResult[]
): SuspicionCheckResult {
  const reasons: SuspicionReason[] = [];

  // --- Check 1: rapid re-scan of the same product on this device ---
  const priorScansOfThisProduct = localScanHistory
    .filter((s) => s.productId === productId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (priorScansOfThisProduct.length > 0) {
    const lastScanTime = new Date(priorScansOfThisProduct[0].timestamp).getTime();
    const gap = Date.now() - lastScanTime;
    if (gap < RAPID_RESCAN_WINDOW_MS) {
      reasons.push('RAPID_RESCAN');
    }
  }

  // --- Check 2: unusually high total scan count on-chain ---
  if (onChainScanCount > HIGH_SCAN_COUNT_THRESHOLD) {
    reasons.push('HIGH_SCAN_COUNT');
  }

  const suspicious = reasons.length > 0;

  let message: string | null = null;
  if (reasons.includes('RAPID_RESCAN') && reasons.includes('HIGH_SCAN_COUNT')) {
    message =
      'This product has been scanned unusually often, including twice in quick succession. This can indicate the QR code has been copied.';
  } else if (reasons.includes('RAPID_RESCAN')) {
    message =
      "This QR was scanned again within 2 minutes. If you didn't scan it twice yourself, this could indicate a duplicated QR code.";
  } else if (reasons.includes('HIGH_SCAN_COUNT')) {
    message = `This product has been scanned ${onChainScanCount} times in total, which is unusually high for a single unit.`;
  }

  return { suspicious, reasons, message };
}