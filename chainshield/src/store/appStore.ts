import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recordScanOnChain } from '../services/chainApi';
import {
  submitProduct,
  fetchPendingProducts as fetchPendingProductsApi,
  fetchApprovedProducts as fetchApprovedProductsApi,
  approveProductOnBackend,
  rejectProductOnBackend,
} from '../services/productsApi';

export type UserRole = 'USER' | 'MANUFACTURER' | 'ADMIN' | null;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  companyName?: string; // For manufacturer
  isApproved?: boolean; // For manufacturer approval by admin
}

export interface ScanResult {
  id: string;
  productId: string;
  productName: string;
  timestamp: string;
  status: 'AUTHENTIC' | 'FAKE';
  batchNumber?: string;
  mfgDate?: string;
  expDate?: string;
  manufacturerName?: string;
  txId?: string;
  scanCount: number;
  suspicious?: boolean;
  suspicionMessage?: string | null;
}

export interface ProductItem {
  itemId: string;
  txHash: string;
  blockNumber?: number;
}

export interface ProductRegistration {
  id: string;
  manufacturerId: string;
  productName: string;
  category: string;
  batchNumber: string;
  mfgDate: string;
  expDate: string;
  mrp?: string;
  description: string;
  imageUrl?: string;
  quantity: number; // how many physical units this batch registers
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  items?: ProductItem[]; // set once approved — one entry per physical unit, each independently verifiable
  txId?: string; // kept for backward compatibility with older screens; prefer items[]
  onChain?: boolean; // true = items[] contains real tx hashes from ChainShield.sol on Ganache
}

interface AppState {
  // Auth state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  token: string | null;
  setAuth: (user: UserProfile, token: string) => void;

  // Consumer state
  scanHistory: ScanResult[];
  addScanResult: (result: ScanResult) => void;
  scanCounts: Record<string, number>;
  registerScan: (productId: string) => number;

  // Manufacturer state
  myProducts: ProductRegistration[];
  requestProductRegistration: (product: Omit<ProductRegistration, 'id' | 'status' | 'items'>) => Promise<void>;

  // Admin state
  pendingManufacturers: UserProfile[];
  pendingProducts: ProductRegistration[];
  registeredProducts: ProductRegistration[];

  approveManufacturer: (id: string) => void;
  rejectManufacturer: (id: string) => void;
  approveProduct: (id: string) => Promise<void>;
  rejectProduct: (id: string) => Promise<void>;

  // Syncs pendingProducts / registeredProducts with the shared backend —
  // call on screen focus so every device sees the same lists instead of
  // only what was created locally.
  fetchPendingProducts: () => Promise<void>;
  fetchApprovedProducts: () => Promise<void>;
}

// Initial mock data
const mockPendingProducts: ProductRegistration[] = [
  {
    id: 'p1',
    manufacturerId: 'm1',
    productName: 'Glow Serum 50ml',
    category: 'Serum',
    batchNumber: 'B123',
    mfgDate: '2023-10-01',
    expDate: '2025-10-01',
    description: 'Vitamin C Face Serum',
    quantity: 1,
    status: 'PENDING',
  }
];

const mockRegisteredProducts: ProductRegistration[] = [
  {
    id: 'p2',
    manufacturerId: 'm1',
    productName: 'Matte Lipstick (Ruby)',
    category: 'Lipstick',
    batchNumber: 'L999',
    mfgDate: '2023-05-01',
    expDate: '2026-05-01',
    description: 'Long lasting red lipstick',
    quantity: 1,
    status: 'APPROVED',
    items: [{ itemId: 'p2-0001', txHash: '0xabc123...' }],
  }
];

const mockPendingManufacturers: UserProfile[] = [
  {
    id: 'm2',
    name: 'Jane Doe',
    email: 'jane@beautyco.com',
    mobile: '9876543210',
    role: 'MANUFACTURER',
    companyName: 'Beauty Co.',
    isApproved: false,
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
      token: null,
      setAuth: (user, token) => set({ user, token }),

      scanHistory: [],
      addScanResult: (result) => set((state) => ({ scanHistory: [result, ...state.scanHistory] })),

      scanCounts: {},
      registerScan: (productId) => {
        const nextCount = (get().scanCounts[productId] || 0) + 1;
        set((state) => ({
          scanCounts: { ...state.scanCounts, [productId]: nextCount },
        }));
        return nextCount;
      },

      myProducts: [...mockRegisteredProducts], // Will be filtered by user in UI
      requestProductRegistration: async (product) => {
        // Real write: submit to the shared backend so every admin device
        // sees this pending product, not just this one.
        const result = await submitProduct(product);

        if (result.ok && result.product) {
          set((state) => ({
            myProducts: [...state.myProducts, result.product as ProductRegistration],
            pendingProducts: [...state.pendingProducts, result.product as ProductRegistration],
          }));
        } else {
          // Backend unreachable — keep working locally so the demo doesn't
          // die, but this copy is only visible on this device until the
          // backend comes back and a real submission is made.
          const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const newProduct: ProductRegistration = { ...product, id, status: 'PENDING' };
          set((state) => ({
            myProducts: [...state.myProducts, newProduct],
            pendingProducts: [...state.pendingProducts, newProduct],
          }));
        }
      },

      pendingManufacturers: [...mockPendingManufacturers],
      pendingProducts: [...mockPendingProducts],
      registeredProducts: [...mockRegisteredProducts],

      approveManufacturer: (id) => set((state) => ({
        pendingManufacturers: state.pendingManufacturers.filter(m => m.id !== id),
        // In a real app, update the user db.
      })),
      rejectManufacturer: (id) => set((state) => ({
        pendingManufacturers: state.pendingManufacturers.filter(m => m.id !== id),
      })),

      approveProduct: async (id) => {
        const product = get().pendingProducts.find(p => p.id === id);
        if (!product) return;

        // Real write: backend calls ChainShield.addProduct() once PER
        // physical unit (product.quantity), each with its own unique id,
        // and returns the full record with one QR-worth of data per unit.
        const result = await approveProductOnBackend(id);

        const approvedProduct: ProductRegistration = result.ok && result.product
          ? { ...(result.product as ProductRegistration), onChain: true }
          : {
              // Backend/Ganache unreachable — approve locally so the demo
              // doesn't die, but mark it clearly as NOT actually on-chain.
              ...product,
              status: 'APPROVED',
              onChain: false,
              items: Array.from({ length: product.quantity || 1 }, (_, i) => ({
                itemId: `${product.id}-${String(i + 1).padStart(4, '0')}`,
                txHash: `OFFLINE-${Math.random().toString(16).slice(2, 10)}`,
              })),
            };

        set((state) => ({
          pendingProducts: state.pendingProducts.filter(p => p.id !== id),
          registeredProducts: [approvedProduct, ...state.registeredProducts],
          myProducts: state.myProducts.map(p => p.id === id ? approvedProduct : p)
        }));
      },

      rejectProduct: async (id) => {
        const result = await rejectProductOnBackend(id);

        set((state) => {
          const product = state.pendingProducts.find(p => p.id === id);
          if (!product) return state;

          const rejectedProduct: ProductRegistration = result.ok && result.product
            ? (result.product as ProductRegistration)
            : { ...product, status: 'REJECTED' };

          return {
            pendingProducts: state.pendingProducts.filter(p => p.id !== id),
            myProducts: state.myProducts.map(p => p.id === id ? rejectedProduct : p)
          };
        });
      },

      fetchPendingProducts: async () => {
        const result = await fetchPendingProductsApi();
        if (result.ok && result.products) {
          set({ pendingProducts: result.products });
        }
        // Backend unreachable — silently keep whatever is already in
        // state (mock/local data) rather than wiping the screen.
      },

      fetchApprovedProducts: async () => {
        const result = await fetchApprovedProductsApi();
        if (result.ok && result.products) {
          set({ registeredProducts: result.products });
        }
      },
    }),
    {
      name: 'chainshield-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);