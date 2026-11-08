export type UserRole = 'distributor' | 'buyer' | 'recovery_partner' | 'admin';

export type BusinessType = 'distributor' | 'commercial_buyer' | 'food_bank_charity' | 'platform_operator';

export type MarketLocation = 
  | 'Mushin Wholesale Depot #04'
  | 'Idumota Central Market'
  | 'Mile 12 Commercial Hub'
  | 'Alaba Rago Grains Hub'
  | 'Oyingbo Food Market';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
  phone: string;
  whatsappNumber: string;
  avatarUrl?: string;
  status: 'active' | 'pending_verification' | 'suspended';
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  rcNumber?: string; // Nigerian CAC Registration Number
  location: MarketLocation;
  detailedAddress: string;
  phone: string;
  whatsappContact: string;
  verified: boolean;
  verificationBadge: 'Verified Trader' | 'Verified Buyer' | 'Verified NGO' | 'Pending Verification';
  verificationDate?: string;
  contactPerson: string;
  ownerId: string;
  rating: number;
  totalTransactions: number;
  totalRescuedKg: number;
  capitalSavedNaira: number;
  createdAt: string;
}

export type StorageCondition = 'ambient' | 'cool_dry' | 'refrigerated';

export type ProductCategory = 
  | 'Grains & Flour'
  | 'Packaged Foods & Biscuits'
  | 'Canned Goods & Pastes'
  | 'Cooking Oils & Seasoning'
  | 'Dairy & Beverages'
  | 'Pasta & Noodles';

export type ExpiryUrgency = 'healthy' | 'radar_warning' | 'critical' | 'expired';

export interface InventoryBatch {
  id: string; // e.g. BATCH-2026-NGA-8849
  businessId: string;
  businessName: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  barcode: string;
  quantity: number; // Current available quantity
  initialQuantity: number;
  unit: 'cartons' | 'crates' | 'bags (25kg)' | 'bags (50kg)' | 'cases' | 'packs';
  unitWeightKg: number;
  costPricePerUnit: number;
  standardRetailPrice: number;
  expiryDate: string; // YYYY-MM-DD
  storageCondition: StorageCondition;
  warehouseLocation: string;
  originalPackagingIntact: boolean;
  nafdacNumber?: string;
  daysRemaining: number;
  urgency: ExpiryUrgency;
  suggestedMarkdownPercent: number;
  isListed: boolean;
  activeListingId?: string;
  isEligibleForRecovery: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ListingStatus = 'active' | 'in_negotiation' | 'matched' | 'completed' | 'cancelled';

export interface Listing {
  id: string; // LST-XXXX
  batchId: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  sellerLocation: MarketLocation;
  productName: string;
  brand: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
  unitWeightKg: number;
  originalPricePerUnit: number;
  listingPricePerUnit: number;
  discountPercent: number;
  minOrderQuantity: number;
  expiryDate: string;
  daysRemaining: number;
  urgency: ExpiryUrgency;
  originalPackagingVerified: boolean;
  status: ListingStatus;
  notes?: string;
  createdAt: string;
}

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'expired';

export interface Offer {
  id: string; // OFF-XXXX
  listingId: string;
  batchId: string;
  buyerBusinessId: string;
  buyerBusinessName: string;
  buyerContactName: string;
  buyerWhatsapp: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  productName: string;
  requestedQuantity: number;
  unit: string;
  proposedPricePerUnit: number;
  counterPricePerUnit?: number;
  totalOfferedValue: number;
  fulfilmentPreference: 'seller_warehouse_pickup' | 'market_consolidation_depot' | 'third_party_dispatch';
  status: OfferStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = 
  | 'terms_agreed'
  | 'handover_scheduled'
  | 'inspection_pending'
  | 'handover_confirmed'
  | 'cancelled';

export interface Transaction {
  id: string; // TXN-XXXX
  offerId: string;
  listingId: string;
  batchId: string;
  buyerBusinessId: string;
  buyerBusinessName: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  productName: string;
  agreedQuantity: number;
  unit: string;
  agreedPricePerUnit: number;
  totalTransactionValue: number;
  capitalSavedNaira: number; // vs fire-sale loss
  status: TransactionStatus;
  pickupLocation: string;
  scheduledHandoverDate: string;
  handoverEvidence?: {
    photoUrl: string;
    agentBadgeId: string;
    gpsCoordinates: string;
    confirmedBySellerTimestamp: string;
    confirmedByBuyerTimestamp: string;
    notes?: string;
  };
  createdAt: string;
  completedAt?: string;
}

export type RecoveryStatus = 
  | 'available'
  | 'accepted'
  | 'collection_scheduled'
  | 'handover_confirmed'
  | 'declined'
  | 'cancelled';

export interface RecoveryOpportunity {
  id: string; // REC-XXXX
  batchId: string;
  distributorBusinessId: string;
  distributorBusinessName: string;
  recoveryPartnerBusinessId?: string;
  recoveryPartnerBusinessName?: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
  totalWeightKg: number;
  expiryDate: string;
  daysRemaining: number;
  storageCondition: StorageCondition;
  pickupLocation: string;
  status: RecoveryStatus;
  collectionSlot?: string;
  potentialCo2eAvoidedTonnes: number; // VM0046 calculation
  climateMethodologyLabel: string; // "UNVERIFIED / METHODOLOGY TO INVESTIGATE"
  handoverEvidence?: {
    photoUrl: string;
    driverBadgeId: string;
    cratesCount: number;
    sealedConditionConfirmed: boolean;
    timestamp: string;
  };
  createdAt: string;
  completedAt?: string;
}

export type OutcomeType = 'commercial_sale' | 'food_bank_recovery' | 'internal_clearance' | 'discard_spoilage';

export interface BatchOutcome {
  id: string; // OUT-XXXX
  batchId: string;
  businessId: string;
  productName: string;
  outcomeType: OutcomeType;
  quantity: number;
  unit: string;
  totalWeightKg: number;
  capitalRecoveredNaira: number;
  potentialCo2eTonnes: number;
  relatedTransactionId?: string;
  relatedRecoveryId?: string;
  evidenceRef?: string;
  recordedAt: string;
  recordedBy: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'batch' | 'listing' | 'offer' | 'transaction' | 'recovery' | 'business_verification';
  entityId: string;
  timestamp: string;
  details: string;
}

export type {
  FigmaBatch,
  FigmaListing,
  FigmaOffer,
  FigmaTransaction,
  FigmaRecovery,
} from '../data/figmaSeedData';
