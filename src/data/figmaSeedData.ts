export interface FigmaBatch {
  id: string; // e.g. SS-0849
  productName: string;
  category: string;
  quantity: number;
  initialQuantity: number;
  reservedQuantity: number;
  commerciallyFulfilledQuantity: number;
  recoveryHandedOverQuantity: number;
  unit: string;
  printedExpiryDate: string;
  askingPrice: number;
  stockLocation: string;
  packagingChecked: boolean;
  listingStatus: 'Listed' | 'Not listed' | 'Recovery' | 'Expired · blocked';
  activeListingId?: string;
  imageUrl: string;
  daysRemaining: number;
  lifecycleHistory: Array<{
    id: string;
    title: string;
    detail: string;
    timestamp: string;
  }>;
}

export interface FigmaListing {
  id: string;
  batchId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  askingPrice: number;
  printedExpiryDate: string;
  stockLocation: string;
  sellerName: string;
  imageUrl: string;
  daysRemaining: number;
  isHealthyStock: boolean;
}

export interface FigmaOffer {
  id: string; // e.g. OF-2042
  listingId: string;
  batchId: string;
  productName: string;
  category: string;
  buyerName: string;
  requestedQuantity: number;
  unit: string;
  offerPricePerUnit: number;
  totalAgreedValue: number;
  printedExpiryDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  imageUrl: string;
}

export interface FigmaTransaction {
  id: string; // e.g. TX-02285
  batchId: string;
  productName: string;
  category: string;
  buyerName: string;
  agreedQuantity: number;
  unit: string;
  agreedValue: number;
  printedExpiryDate: string;
  status: 'Offer accepted' | 'Fulfilment arranged' | 'Fulfilment pending' | 'Fulfilment confirmed' | 'Completed' | 'Cancelled';
  currentStep: number; // 1 to 5
  collectionDate: string;
  stockLocation: string;
  evidenceReference?: string;
  distributorConfirmed: boolean;
  buyerConfirmed: boolean;
  completedAt?: string;
  imageUrl: string;
}

export interface FigmaRecovery {
  id: string; // e.g. RC-0301
  batchId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  printedExpiryDate: string;
  daysRemaining: number;
  collectionLocation: string;
  status: 'Available' | 'Accepted' | 'Completed';
  collectionDate?: string;
  imageUrl: string;
}

export const INITIAL_FIGMA_BATCHES: FigmaBatch[] = [
  {
    id: 'SS-0849',
    productName: 'Premium parboiled rice',
    category: 'Grains & cereals',
    quantity: 120,
    initialQuantity: 120,
    reservedQuantity: 0,
    commerciallyFulfilledQuantity: 0,
    recoveryHandedOverQuantity: 0,
    unit: 'bags',
    printedExpiryDate: '2026-11-24',
    askingPrice: 42500,
    stockLocation: 'Mushin, Lagos',
    packagingChecked: true,
    listingStatus: 'Listed',
    activeListingId: 'LST-0849',
    imageUrl: '/src/assets/images/distributor_inspection_1794003868699.jpg',
    daysRemaining: 18,
    lifecycleHistory: [
      {
        id: 'step-1',
        title: 'Batch registered · Original packaging recorded',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-10-20',
      },
      {
        id: 'step-2',
        title: 'Published to marketplace · 120 bags',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-10-22',
      },
    ],
  },
  {
    id: 'SS-0850',
    productName: 'Canned tomato paste',
    category: 'Canned goods',
    quantity: 85,
    initialQuantity: 85,
    reservedQuantity: 0,
    commerciallyFulfilledQuantity: 0,
    recoveryHandedOverQuantity: 0,
    unit: 'cartons',
    printedExpiryDate: '2026-11-15',
    askingPrice: 18500,
    stockLocation: 'Mushin, Lagos',
    packagingChecked: true,
    listingStatus: 'Not listed',
    imageUrl: '/src/assets/images/hero_lagos_warehouse_1794003868225.jpg',
    daysRemaining: 9,
    lifecycleHistory: [
      {
        id: 'step-1',
        title: 'Batch registered · Original packaging recorded',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-10-18',
      },
    ],
  },
  {
    id: 'SS-0851',
    productName: 'Golden wheat flour',
    category: 'Grains & cereals',
    quantity: 52, // 64 minus 12 fulfilled in TX-02285
    initialQuantity: 64,
    reservedQuantity: 0,
    commerciallyFulfilledQuantity: 12,
    recoveryHandedOverQuantity: 0,
    unit: 'bags',
    printedExpiryDate: '2026-12-11',
    askingPrice: 28000,
    stockLocation: 'Mushin, Lagos',
    packagingChecked: true,
    listingStatus: 'Listed',
    activeListingId: 'LST-0851',
    imageUrl: '/src/assets/images/buyer_trade_procurement_1794003869465.jpg',
    daysRemaining: 35,
    lifecycleHistory: [
      {
        id: 'step-1',
        title: 'Batch registered · Original packaging recorded',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-10-15',
      },
      {
        id: 'step-2',
        title: 'Published to marketplace',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-10-18',
      },
      {
        id: 'step-3',
        title: '12 bags reserved · TX-02285',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-11-02',
      },
      {
        id: 'step-4',
        title: '12 bags commercially fulfilled · TX-02285 · Evidence: uuuu',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-11-04',
      },
    ],
  },
  {
    id: 'SS-0852',
    productName: 'Vegetable cooking oil',
    category: 'Oils & condiments',
    quantity: 40,
    initialQuantity: 40,
    reservedQuantity: 8,
    commerciallyFulfilledQuantity: 0,
    recoveryHandedOverQuantity: 0,
    unit: 'cartons',
    printedExpiryDate: '2027-02-09',
    askingPrice: 32000,
    stockLocation: 'Mushin, Lagos',
    packagingChecked: true,
    listingStatus: 'Listed',
    activeListingId: 'LST-0852',
    imageUrl: '/src/assets/images/distributor_inspection_1794003868699.jpg',
    daysRemaining: 95,
    lifecycleHistory: [
      {
        id: 'step-1',
        title: 'Batch registered · Original packaging recorded',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-10-10',
      },
      {
        id: 'step-2',
        title: '8 cartons reserved · TX-1036',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-11-01',
      },
    ],
  },
  {
    id: 'SS-0853',
    productName: 'Breakfast cereal',
    category: 'Packaged foods',
    quantity: 36,
    initialQuantity: 36,
    reservedQuantity: 0,
    commerciallyFulfilledQuantity: 0,
    recoveryHandedOverQuantity: 0,
    unit: 'cartons',
    printedExpiryDate: '2026-11-12',
    askingPrice: 12500,
    stockLocation: 'Idumota, Lagos',
    packagingChecked: true,
    listingStatus: 'Recovery',
    imageUrl: '/src/assets/images/hero_lagos_warehouse_1794003868225.jpg',
    daysRemaining: 6,
    lifecycleHistory: [
      {
        id: 'step-1',
        title: 'Batch registered · Original packaging recorded',
        detail: 'Recorded in sample batch history',
        timestamp: '2026-10-05',
      },
      {
        id: 'step-2',
        title: 'Routed to recovery partner · RC-0301',
        detail: 'Approaching 6 days remaining',
        timestamp: '2026-11-03',
      },
    ],
  },
  {
    id: 'SS-0840',
    productName: 'Sample Expired Dairy Tins',
    category: 'Dairy',
    quantity: 10,
    initialQuantity: 10,
    reservedQuantity: 0,
    commerciallyFulfilledQuantity: 0,
    recoveryHandedOverQuantity: 0,
    unit: 'cartons',
    printedExpiryDate: '2026-11-01',
    askingPrice: 15000,
    stockLocation: 'Mushin, Lagos',
    packagingChecked: true,
    listingStatus: 'Expired · blocked',
    imageUrl: '/src/assets/images/hero_lagos_warehouse_1794003868225.jpg',
    daysRemaining: -5,
    lifecycleHistory: [
      {
        id: 'step-1',
        title: 'Batch expired · Blocked from sale or recovery',
        detail: 'Strict food safety protocol enforced',
        timestamp: '2026-11-01',
      },
    ],
  },
];

export const INITIAL_FIGMA_OFFERS: FigmaOffer[] = [
  {
    id: 'OF-2041',
    listingId: 'LST-0849',
    batchId: 'SS-0849',
    productName: 'Premium parboiled rice',
    category: 'Grains & cereals · SS-0849',
    buyerName: 'Adeola Retail Stores',
    requestedQuantity: 20,
    unit: 'bags',
    offerPricePerUnit: 40000,
    totalAgreedValue: 800000,
    printedExpiryDate: '24 Nov 2026',
    status: 'Pending',
    createdAt: '2026-11-05',
    imageUrl: '/src/assets/images/distributor_inspection_1794003868699.jpg',
  },
  {
    id: 'OF-2042',
    listingId: 'LST-0851',
    batchId: 'SS-0851',
    productName: 'Golden wheat flour',
    category: 'Grains & cereals · SS-0851',
    buyerName: 'Mainland Caterers',
    requestedQuantity: 12,
    unit: 'bags',
    offerPricePerUnit: 27000,
    totalAgreedValue: 324000,
    printedExpiryDate: '11 Dec 2026',
    status: 'Accepted',
    createdAt: '2026-11-04',
    imageUrl: '/src/assets/images/buyer_trade_procurement_1794003869465.jpg',
  },
  {
    id: 'OF-2043',
    listingId: 'LST-0852',
    batchId: 'SS-0852',
    productName: 'Vegetable cooking oil',
    category: 'Oils & condiments · SS-0852',
    buyerName: 'Corner Shop Collective',
    requestedQuantity: 10,
    unit: 'cartons',
    offerPricePerUnit: 30000,
    totalAgreedValue: 300000,
    printedExpiryDate: '9 Feb 2027',
    status: 'Pending',
    createdAt: '2026-11-03',
    imageUrl: '/src/assets/images/distributor_inspection_1794003868699.jpg',
  },
];

export const INITIAL_FIGMA_TRANSACTIONS: FigmaTransaction[] = [
  {
    id: 'TX-02285',
    batchId: 'SS-0851',
    productName: 'Golden wheat flour',
    category: 'Grains & cereals · SS-0851',
    buyerName: 'Mainland Caterers',
    agreedQuantity: 12,
    unit: 'bags',
    agreedValue: 324000,
    printedExpiryDate: '11 Dec 2026',
    status: 'Completed',
    currentStep: 5,
    collectionDate: '21 Nov 2026',
    stockLocation: 'Mushin, Lagos',
    evidenceReference: 'SAMPLE-PHOTO-001 · sealed cartons checked',
    distributorConfirmed: true,
    buyerConfirmed: true,
    completedAt: '2026-11-04T14:20:00Z',
    imageUrl: '/src/assets/images/buyer_trade_procurement_1794003869465.jpg',
  },
  {
    id: 'TX-1036',
    batchId: 'SS-0852',
    productName: 'Vegetable cooking oil',
    category: 'Oils & condiments · SS-0852',
    buyerName: 'Lagos Pantry · Sample buyer',
    agreedQuantity: 8,
    unit: 'cartons',
    agreedValue: 244000,
    printedExpiryDate: '9 Feb 2027',
    status: 'Fulfilment arranged',
    currentStep: 2,
    collectionDate: '18 Nov 2026',
    stockLocation: 'Mushin, Lagos',
    distributorConfirmed: false,
    buyerConfirmed: false,
    imageUrl: '/src/assets/images/distributor_inspection_1794003868699.jpg',
  },
];

export const INITIAL_FIGMA_RECOVERIES: FigmaRecovery[] = [
  {
    id: 'RC-0301',
    batchId: 'SS-0853',
    productName: 'Breakfast cereal',
    category: 'Packaged foods · SS-0853',
    quantity: 12,
    unit: 'cartons',
    printedExpiryDate: '12 Nov 2026',
    daysRemaining: 6,
    collectionLocation: 'Idumota, Lagos',
    status: 'Available',
    imageUrl: '/src/assets/images/hero_lagos_warehouse_1794003868225.jpg',
  },
  {
    id: 'RC-06846',
    batchId: 'SS-0849',
    productName: 'Premium parboiled rice',
    category: 'Grains & cereals · SS-0849',
    quantity: 120,
    unit: 'bags',
    printedExpiryDate: '24 Nov 2026',
    daysRemaining: 18,
    collectionLocation: 'Mushin, Lagos',
    status: 'Available',
    imageUrl: '/src/assets/images/distributor_inspection_1794003868699.jpg',
  },
];
