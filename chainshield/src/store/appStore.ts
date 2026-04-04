import { create } from 'zustand';

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
}

interface AppState {
  // Auth state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;

  // Consumer state
  scanHistory: ScanResult[];
  addScanResult: (result: ScanResult) => void;

  // Manufacturer state
  myProducts: ProductRegistration[];
  requestProductRegistration: (product: Omit<ProductRegistration, 'id' | 'status' | 'txId'>) => void;

  // Admin state
  pendingManufacturers: UserProfile[];
  pendingProducts: ProductRegistration[];
  registeredProducts: ProductRegistration[];

  approveManufacturer: (id: string) => void;
  rejectManufacturer: (id: string) => void;
  approveProduct: (id: string) => void;
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

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),

  scanHistory: [],
  addScanResult: (result) => set((state) => ({ scanHistory: [result, ...state.scanHistory] })),

  myProducts: [...mockRegisteredProducts], // Will be filtered by user in UI
  requestProductRegistration: (product) => set((state) => ({
    myProducts: [
      ...state.myProducts,
      { ...product, id: Math.random().toString(), status: 'PENDING' }
    ],
    pendingProducts: [
      ...state.pendingProducts,
      { ...product, id: Math.random().toString(), status: 'PENDING' }
    ]
  })),

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

  approveProduct: (id) => set((state) => {
    const product = state.pendingProducts.find(p => p.id === id);
    if (!product) return state;

    const approvedProduct: ProductRegistration = {
      ...product,
      status: 'APPROVED',
      txId: `0x${Math.random().toString(16).substring(2, 10)}...` // Mock txid
    };

    return {
      pendingProducts: state.pendingProducts.filter(p => p.id !== id),
      registeredProducts: [approvedProduct, ...state.registeredProducts],
      myProducts: state.myProducts.map(p => p.id === id ? approvedProduct : p)
    };
  }),

  rejectProduct: (id) => set((state) => {
    const product = state.pendingProducts.find(p => p.id === id);
    if (!product) return state;

    const rejectedProduct: ProductRegistration = { ...product, status: 'REJECTED' };

    return {
      pendingProducts: state.pendingProducts.filter(p => p.id !== id),
      myProducts: state.myProducts.map(p => p.id === id ? rejectedProduct : p)
    };
  }),
}));
