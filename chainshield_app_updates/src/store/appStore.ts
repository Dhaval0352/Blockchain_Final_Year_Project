import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addProductOnChain, recordScanOnChain } from '../services/chainApi';

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  txId?: string; // Set when approved
  onChain?: boolean; // true = txId is a real tx hash from ChainShield.sol on Ganache
}

interface AppState {
  // Auth state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;

  // Consumer state
  scanHistory: ScanResult[];
  addScanResult: (result: ScanResult) => void;
  scanCounts: Record<string, number>;
  registerScan: (productId: string) => number;

  // Manufacturer state
  myProducts: ProductRegistration[];
  requestProductRegistration: (product: Omit<ProductRegistration, 'id' | 'status' | 'txId'>) => void;

  // Admin state
  pendingManufacturers: UserProfile[];
  pendingProducts: ProductRegistration[];
  registeredProducts: ProductRegistration[];

  approveManufacturer: (id: string) => void;
  rejectManufacturer: (id: string) => void;
  approveProduct: (id: string) => Promise<void>;
  rejectProduct: (id: string) => void;
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
    status: 'APPROVED',
    txId: '0xabc123...',
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
      logout: () => set({ user: null }),

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
      requestProductRegistration: (product) => {
        // Use a single id for both lists so approve/reject can update the
        // manufacturer's own copy of the product (previously these were
        // two different random ids and the two lists could never sync).
        const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const newProduct: ProductRegistration = { ...product, id, status: 'PENDING' };
        set((state) => ({
          myProducts: [...state.myProducts, newProduct],
          pendingProducts: [...state.pendingProducts, newProduct],
        }));
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

        // This is the real write: the backend calls ChainShield.addProduct()
        // on Ganache and gives us back the actual transaction hash.
        const chainResult = await addProductOnChain({
          id: product.id,
          productName: product.productName,
          batchNumber: product.batchNumber,
          manufacturerName: product.manufacturerId,
          category: product.category,
          mfgDate: product.mfgDate,
          expDate: product.expDate,
        });

        const approvedProduct: ProductRegistration = chainResult.ok
          ? { ...product, status: 'APPROVED', txId: chainResult.txHash, onChain: true }
          : {
              // Backend/Ganache unreachable — approve locally so the demo
              // doesn't die, but mark it clearly as NOT actually on-chain.
              ...product,
              status: 'APPROVED',
              txId: `OFFLINE-${Math.random().toString(16).slice(2, 10)}`,
              onChain: false,
            };

        set((state) => ({
          pendingProducts: state.pendingProducts.filter(p => p.id !== id),
          registeredProducts: [approvedProduct, ...state.registeredProducts],
          myProducts: state.myProducts.map(p => p.id === id ? approvedProduct : p)
        }));
      },

      rejectProduct: (id) => set((state) => {
        const product = state.pendingProducts.find(p => p.id === id);
        if (!product) return state;

        const rejectedProduct: ProductRegistration = { ...product, status: 'REJECTED' };

        return {
          pendingProducts: state.pendingProducts.filter(p => p.id !== id),
          myProducts: state.myProducts.map(p => p.id === id ? rejectedProduct : p)
        };
      }),
    }),
    {
      name: 'chainshield-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
