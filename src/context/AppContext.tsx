import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_FIGMA_BATCHES,
  INITIAL_FIGMA_OFFERS,
  INITIAL_FIGMA_RECOVERIES,
  INITIAL_FIGMA_TRANSACTIONS,
  FigmaBatch,
  FigmaListing,
  FigmaOffer,
  FigmaRecovery,
  FigmaTransaction,
} from '../data/figmaSeedData';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BATCH_OUTCOMES,
  INITIAL_BATCHES,
  INITIAL_BUSINESSES,
  INITIAL_LISTINGS,
  INITIAL_OFFERS,
  INITIAL_RECOVERY_OPPORTUNITIES,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  SYSTEM_TODAY,
} from '../data/mockData';
import {
  AuditLog,
  BatchOutcome,
  Business,
  InventoryBatch,
  Listing,
  Offer,
  RecoveryOpportunity,
  Transaction,
  User,
  UserRole,
} from '../types';

export type WorkspaceTab =
  | 'dashboard'
  | 'inventory'
  | 'marketplace'
  | 'offers'
  | 'transactions'
  | 'recovery'
  | 'reports'
  | 'profile';

export type AppView = 'workspace' | 'public' | 'auth';

export type ModalType =
  | 'register_batch'
  | 'batch_traceability'
  | 'batch_details'
  | 'edit_batch'
  | 'how_buying_works'
  | 'submit_offer'
  | 'offer_details'
  | 'transaction_details'
  | 'partner_capacity'
  | 'recovery_details'
  | 'edit_business'
  | 'export_report'
  | null;

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Navigation & View
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  currentTab: WorkspaceTab;
  setCurrentTab: (tab: WorkspaceTab) => void;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  authInitialMode: 'login' | 'signup';
  openAuth: (mode?: 'login' | 'signup') => void;
  demoModalOpen: boolean;
  setDemoModalOpen: (open: boolean) => void;
  login: (role?: UserRole) => void;
  logout: () => void;

  // Active User & Business
  currentUser: User;
  currentBusiness: Business;
  users: User[];
  businesses: Business[];

  // Figma Exact Datasets
  figmaBatches: FigmaBatch[];
  figmaListings: FigmaListing[];
  figmaOffers: FigmaOffer[];
  figmaTransactions: FigmaTransaction[];
  figmaRecoveries: FigmaRecovery[];
  partnerCapacity: number;

  // Figma Operations
  addFigmaBatch: (newBatch: Partial<FigmaBatch>) => void;
  updateFigmaBatch: (id: string, updates: Partial<FigmaBatch>) => void;
  publishFigmaBatch: (batchId: string, askingPrice?: number) => void;
  submitFigmaOffer: (
    listingId: string,
    requestedQuantity: number,
    offerPricePerUnit: number,
    buyerName?: string
  ) => void;
  acceptFigmaOffer: (offerId: string) => void;
  rejectFigmaOffer: (offerId: string) => void;
  advanceFigmaTransaction: (
    transactionId: string,
    targetStep: number,
    payload?: {
      collectionDate?: string;
      evidenceReference?: string;
      distributorConfirmed?: boolean;
      buyerConfirmed?: boolean;
    }
  ) => void;
  acceptFigmaRecovery: (recoveryId: string, collectionDate?: string) => void;
  completeFigmaRecovery: (recoveryId: string) => void;
  updatePartnerCapacity: (capacity: number) => void;

  // Modals
  activeModal: ModalType;
  modalData: any;
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;

  // Toasts
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Exports & Utils
  exportInventoryCsv: () => void;
  exportReportsCsv: () => void;
  resetAllData: () => void;
  referenceDate: string;

  // Legacy / Full-stack compatibility
  batches: InventoryBatch[];
  listings: Listing[];
  offers: Offer[];
  transactions: Transaction[];
  recoveries: RecoveryOpportunity[];
  batchOutcomes: BatchOutcome[];
  auditLogs: AuditLog[];
  switchUser: (userId: string) => void;
  verifyBusiness: (businessId: string) => void;
  routeToRecovery: (batchId: string, quantity: number) => { success: boolean; error?: string };
  publishListing: (batchId: string, listingPricePerUnit: number, minOrderQuantity: number, notes?: string) => { success: boolean; error?: string; listing?: any };
  registerBatch: (newBatch: any) => { success: boolean; error?: string; batch?: any };
  submitOffer: (listingId: string, requestedQuantity: number, proposedPricePerUnit: number, message?: string, fulfilmentPreference?: any) => { success: boolean; error?: string; offer?: any };
  acceptRecoveryOpportunity: (recoveryId: string, collectionSlot: string) => { success: boolean; error?: string };
  confirmRecoveryHandover: (recoveryId: string, evidence: any) => { success: boolean; error?: string };
  respondToOffer: (offerId: string, action: 'accept' | 'decline' | 'counter', counterPrice?: number) => { success: boolean; error?: string };
  confirmHandover: (transactionId: string, evidence: any) => { success: boolean; error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'secondshelf_figma_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}_authenticated`) === 'true';
  });
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);

  // Navigation State — MANDATORY PRIORITY 01: Public landing page is default entry point
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#auth' || hash === '#login') return 'auth';
      if (hash === '#workspace' && localStorage.getItem(`${STORAGE_PREFIX}_authenticated`) === 'true') {
        return 'workspace';
      }
    }
    return 'public';
  });
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('distributor');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthInitialMode(mode);
    setCurrentView('auth');
  };

  const login = (role?: UserRole) => {
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_PREFIX}_authenticated`, 'true');
    if (role) {
      switchRole(role);
    }
    setCurrentView('workspace');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(`${STORAGE_PREFIX}_authenticated`);
    setCurrentView('public');
    showToast('Logged out of SecondShelf session.', 'info');
  };

  // Modals State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Partner Capacity
  const [partnerCapacity, setPartnerCapacity] = useState<number>(50);

  // Figma Datasets with LocalStorage persistence
  const [figmaBatches, setFigmaBatches] = useState<FigmaBatch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_batches`);
    return saved ? JSON.parse(saved) : INITIAL_FIGMA_BATCHES;
  });

  const [figmaOffers, setFigmaOffers] = useState<FigmaOffer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_offers`);
    return saved ? JSON.parse(saved) : INITIAL_FIGMA_OFFERS;
  });

  const [figmaTransactions, setFigmaTransactions] = useState<FigmaTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_FIGMA_TRANSACTIONS;
  });

  const [figmaRecoveries, setFigmaRecoveries] = useState<FigmaRecovery[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_recoveries`);
    return saved ? JSON.parse(saved) : INITIAL_FIGMA_RECOVERIES;
  });

  // Derived Figma Listings from batches that are marked as 'Listed'
  const figmaListings: FigmaListing[] = figmaBatches
    .filter((b) => b.listingStatus === 'Listed' && b.quantity > 0)
    .map((b) => ({
      id: b.activeListingId || `LST-${b.id.replace('SS-', '')}`,
      batchId: b.id,
      productName: b.productName,
      category: b.category,
      quantity: b.quantity,
      unit: b.unit,
      askingPrice: b.askingPrice,
      printedExpiryDate: b.printedExpiryDate,
      stockLocation: b.stockLocation,
      sellerName: 'Adeyemi Foods & Distribution',
      imageUrl: b.imageUrl,
      daysRemaining: b.daysRemaining,
      isHealthyStock: b.daysRemaining > 42,
    }));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_batches`, JSON.stringify(figmaBatches));
  }, [figmaBatches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_offers`, JSON.stringify(figmaOffers));
  }, [figmaOffers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_transactions`, JSON.stringify(figmaTransactions));
  }, [figmaTransactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_recoveries`, JSON.stringify(figmaRecoveries));
  }, [figmaRecoveries]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  const openModal = (modal: ModalType, data?: any) => {
    setModalData(data || null);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Mock Users & Businesses
  const [users] = useState<User[]>(INITIAL_USERS);
  const [businesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-dist-01');

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentBusiness = businesses.find((b) => b.id === currentUser.businessId) || businesses[0];

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUserId(target.id);
    }
    // Canonical persona default workspace tab
    if (role === 'buyer') {
      setCurrentTab('marketplace');
    } else if (role === 'recovery_partner') {
      setCurrentTab('recovery');
    } else {
      setCurrentTab('dashboard');
    }
    const roleLabels: Record<UserRole, string> = {
      distributor: 'Distributor / Seller',
      buyer: 'Buyer / Retailer',
      recovery_partner: 'Recovery Partner',
      admin: 'Platform Admin',
    };
    showToast(`Switched workspace role to: ${roleLabels[role]}`, 'info');
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      setActiveRole(target.role);
    }
  };

  // Batch actions
  const addFigmaBatch = (newBatch: Partial<FigmaBatch>) => {
    const nextNum = 854 + figmaBatches.length;
    const batchId = `SS-0${nextNum}`;
    const today = new Date('2026-11-06');
    const expiry = new Date(newBatch.printedExpiryDate || '2026-12-30');
    const diffTime = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const batch: FigmaBatch = {
      id: batchId,
      productName: newBatch.productName || 'New Food Inventory',
      category: newBatch.category || 'Packaged foods',
      quantity: Number(newBatch.quantity) || 50,
      initialQuantity: Number(newBatch.quantity) || 50,
      reservedQuantity: 0,
      commerciallyFulfilledQuantity: 0,
      recoveryHandedOverQuantity: 0,
      unit: newBatch.unit || 'cartons',
      printedExpiryDate: newBatch.printedExpiryDate || '2026-12-30',
      askingPrice: Number(newBatch.askingPrice) || 25000,
      stockLocation: newBatch.stockLocation || 'Mushin, Lagos',
      packagingChecked: newBatch.packagingChecked ?? true,
      listingStatus: 'Not listed',
      imageUrl: newBatch.imageUrl || '/src/assets/images/distributor_inspection_1794003868699.jpg',
      daysRemaining,
      lifecycleHistory: [
        {
          id: 'step-1',
          title: 'Batch registered · Original packaging recorded',
          detail: 'Recorded in sample batch history',
          timestamp: '2026-11-06',
        },
      ],
    };

    setFigmaBatches((prev) => [batch, ...prev]);
    showToast(`Registered batch ${batch.id} (${batch.productName}) successfully.`, 'success');
  };

  const updateFigmaBatch = (id: string, updates: Partial<FigmaBatch>) => {
    setFigmaBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    showToast(`Batch ${id} details updated.`, 'success');
  };

  const publishFigmaBatch = (batchId: string, askingPrice?: number) => {
    const batch = figmaBatches.find((b) => b.id === batchId);
    if (!batch) return;

    if (batch.daysRemaining <= 0) {
      showToast('Cannot list expired batch. Zero post-expiry policy enforced.', 'error');
      return;
    }

    const listingId = `LST-${batch.id.replace('SS-', '')}`;
    const price = askingPrice || batch.askingPrice;

    setFigmaBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              askingPrice: price,
              listingStatus: 'Listed',
              activeListingId: listingId,
              lifecycleHistory: [
                ...b.lifecycleHistory,
                {
                  id: `pub-${Date.now()}`,
                  title: `Published to marketplace · ${b.quantity} ${b.unit}`,
                  detail: 'Recorded in sample batch history',
                  timestamp: '2026-11-06',
                },
              ],
            }
          : b
      )
    );
    showToast(`Batch ${batchId} is now live on the marketplace!`, 'success');
  };

  // Offer Actions
  const submitFigmaOffer = (
    listingId: string,
    requestedQuantity: number,
    offerPricePerUnit: number,
    buyerName = 'Mainland Caterers'
  ) => {
    const listing = figmaListings.find((l) => l.id === listingId);
    if (!listing) return;

    const offerId = `OF-${Math.floor(2044 + figmaOffers.length)}`;
    const newOffer: FigmaOffer = {
      id: offerId,
      listingId,
      batchId: listing.batchId,
      productName: listing.productName,
      category: `${listing.category} · ${listing.batchId}`,
      buyerName,
      requestedQuantity,
      unit: listing.unit,
      offerPricePerUnit,
      totalAgreedValue: requestedQuantity * offerPricePerUnit,
      printedExpiryDate: listing.printedExpiryDate,
      status: 'Pending',
      createdAt: '2026-11-06',
      imageUrl: listing.imageUrl,
    };

    setFigmaOffers((prev) => [newOffer, ...prev]);
    showToast(`Offer ${offerId} submitted to distributor for review.`, 'success');
  };

  const acceptFigmaOffer = (offerId: string) => {
    const offer = figmaOffers.find((o) => o.id === offerId);
    if (!offer) return;

    // 1. Mark offer as accepted
    setFigmaOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'Accepted' } : o))
    );

    // 2. Reserve quantity on batch
    setFigmaBatches((prev) =>
      prev.map((b) => {
        if (b.id === offer.batchId) {
          const newReserved = b.reservedQuantity + offer.requestedQuantity;
          return {
            ...b,
            reservedQuantity: newReserved,
            lifecycleHistory: [
              ...b.lifecycleHistory,
              {
                id: `res-${Date.now()}`,
                title: `${offer.requestedQuantity} ${offer.unit} reserved · Offer ${offer.id}`,
                detail: 'Recorded in sample batch history',
                timestamp: '2026-11-06',
              },
            ],
          };
        }
        return b;
      })
    );

    // 3. Create a transaction starting at Step 1
    const txId = `TX-${Math.floor(3000 + figmaTransactions.length * 10)}`;
    const newTx: FigmaTransaction = {
      id: txId,
      batchId: offer.batchId,
      productName: offer.productName,
      category: offer.category,
      buyerName: offer.buyerName,
      agreedQuantity: offer.requestedQuantity,
      unit: offer.unit,
      agreedValue: offer.totalAgreedValue,
      printedExpiryDate: offer.printedExpiryDate,
      status: 'Offer accepted',
      currentStep: 1,
      collectionDate: 'To be arranged',
      stockLocation: 'Mushin, Lagos',
      distributorConfirmed: false,
      buyerConfirmed: false,
      imageUrl: offer.imageUrl,
    };

    setFigmaTransactions((prev) => [newTx, ...prev]);
    showToast(`Offer ${offerId} accepted! Transaction ${txId} created.`, 'success');
  };

  const rejectFigmaOffer = (offerId: string) => {
    setFigmaOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'Rejected' } : o))
    );
    showToast(`Offer ${offerId} was rejected.`, 'info');
  };

  // 5-Step Transaction Lifecycle Advance
  const advanceFigmaTransaction = (
    transactionId: string,
    targetStep: number,
    payload?: {
      collectionDate?: string;
      evidenceReference?: string;
      distributorConfirmed?: boolean;
      buyerConfirmed?: boolean;
    }
  ) => {
    setFigmaTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          const step = Math.min(5, Math.max(1, targetStep));
          let status: FigmaTransaction['status'] = tx.status;
          if (step === 1) status = 'Offer accepted';
          if (step === 2) status = 'Fulfilment arranged';
          if (step === 3) status = 'Fulfilment pending';
          if (step === 4) status = 'Fulfilment confirmed';
          if (step === 5) status = 'Completed';

          const updated: FigmaTransaction = {
            ...tx,
            currentStep: step,
            status,
            collectionDate: payload?.collectionDate ?? tx.collectionDate,
            evidenceReference: payload?.evidenceReference ?? tx.evidenceReference,
            distributorConfirmed: payload?.distributorConfirmed ?? tx.distributorConfirmed,
            buyerConfirmed: payload?.buyerConfirmed ?? tx.buyerConfirmed,
            completedAt: step === 5 ? new Date().toISOString() : tx.completedAt,
          };

          // If step 5 completed: reconcile batch inventory and add lifecycle history
          if (step === 5 && tx.currentStep < 5) {
            setFigmaBatches((bPrev) =>
              bPrev.map((b) => {
                if (b.id === tx.batchId) {
                  const newQty = Math.max(0, b.quantity - tx.agreedQuantity);
                  const newFulfilled = b.commerciallyFulfilledQuantity + tx.agreedQuantity;
                  const newReserved = Math.max(0, b.reservedQuantity - tx.agreedQuantity);
                  return {
                    ...b,
                    quantity: newQty,
                    reservedQuantity: newReserved,
                    commerciallyFulfilledQuantity: newFulfilled,
                    lifecycleHistory: [
                      ...b.lifecycleHistory,
                      {
                        id: `ful-${Date.now()}`,
                        title: `${tx.agreedQuantity} ${tx.unit} commercially fulfilled · ${tx.id} · Evidence: ${
                          payload?.evidenceReference || tx.evidenceReference || 'Verified'
                        }`,
                        detail: 'Recorded in sample batch history',
                        timestamp: '2026-11-06',
                      },
                    ],
                  };
                }
                return b;
              })
            );
          }

          return updated;
        }
        return tx;
      })
    );

    const stepLabels: Record<number, string> = {
      1: 'Offer accepted',
      2: 'Fulfilment arranged (Collection date scheduled)',
      3: 'Fulfilment pending (Handover begun)',
      4: 'Fulfilment confirmed (Evidence submitted)',
      5: 'Transaction Completed (Inventory reconciled & commercial outcome recorded)',
    };

    showToast(`Transaction ${transactionId} advanced: ${stepLabels[targetStep] || `Step ${targetStep}`}`, 'success');
  };

  // Recovery Actions
  const acceptFigmaRecovery = (recoveryId: string, collectionDate = '10 Nov 2026') => {
    setFigmaRecoveries((prev) =>
      prev.map((r) =>
        r.id === recoveryId
          ? { ...r, status: 'Accepted', collectionDate }
          : r
      )
    );
    showToast(`Recovery ${recoveryId} accepted. Collection slot reserved: ${collectionDate}.`, 'success');
  };

  const completeFigmaRecovery = (recoveryId: string) => {
    const rec = figmaRecoveries.find((r) => r.id === recoveryId);
    if (!rec) return;

    setFigmaRecoveries((prev) =>
      prev.map((r) => (r.id === recoveryId ? { ...r, status: 'Completed' } : r))
    );

    setFigmaBatches((prev) =>
      prev.map((b) => {
        if (b.id === rec.batchId) {
          const newQty = Math.max(0, b.quantity - rec.quantity);
          const newHandedOver = b.recoveryHandedOverQuantity + rec.quantity;
          return {
            ...b,
            quantity: newQty,
            recoveryHandedOverQuantity: newHandedOver,
            lifecycleHistory: [
              ...b.lifecycleHistory,
              {
                id: `rec-comp-${Date.now()}`,
                title: `${rec.quantity} ${rec.unit} handed over to recovery partner · ${rec.id}`,
                detail: 'Quantity recorded. Not environmental credit.',
                timestamp: '2026-11-06',
              },
            ],
          };
        }
        return b;
      })
    );

    showToast(`Recovery ${recoveryId} completed. Quantity recorded.`, 'success');
  };

  const updatePartnerCapacity = (capacity: number) => {
    setPartnerCapacity(capacity);
    showToast(`Recovery partner capacity updated to ${capacity} units.`, 'info');
  };

  // CSV Exporters
  const exportInventoryCsv = () => {
    const headers = 'Batch ID,Product Name,Category,Quantity,Unit,Printed Expiry,Asking Price (NGN),Stock Location,Status\n';
    const rows = figmaBatches
      .map(
        (b) =>
          `"${b.id}","${b.productName}","${b.category}",${b.quantity},"${b.unit}","${b.printedExpiryDate}",${b.askingPrice},"${b.stockLocation}","${b.listingStatus}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SecondShelf_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory CSV exported successfully.', 'success');
  };

  const exportReportsCsv = () => {
    const headers = 'Transaction ID,Batch ID,Product Name,Buyer Name,Agreed Quantity,Unit,Agreed Value (NGN),Status,Collection Date\n';
    const rows = figmaTransactions
      .map(
        (t) =>
          `"${t.id}","${t.batchId}","${t.productName}","${t.buyerName}",${t.agreedQuantity},"${t.unit}",${t.agreedValue},"${t.status}","${t.collectionDate}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SecondShelf_Commercial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Commercial performance report exported successfully.', 'success');
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_PREFIX}_batches`);
    localStorage.removeItem(`${STORAGE_PREFIX}_offers`);
    localStorage.removeItem(`${STORAGE_PREFIX}_transactions`);
    localStorage.removeItem(`${STORAGE_PREFIX}_recoveries`);
    setFigmaBatches(INITIAL_FIGMA_BATCHES);
    setFigmaOffers(INITIAL_FIGMA_OFFERS);
    setFigmaTransactions(INITIAL_FIGMA_TRANSACTIONS);
    setFigmaRecoveries(INITIAL_FIGMA_RECOVERIES);
    setPartnerCapacity(50);
    showToast('Demo data reset to initial sample records.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentTab,
        setCurrentTab,
        activeRole,
        switchRole,
        mobileDrawerOpen,
        setMobileDrawerOpen,
        isAuthenticated,
        authInitialMode,
        openAuth,
        demoModalOpen,
        setDemoModalOpen,
        login,
        logout,
        currentUser,
        currentBusiness,
        users,
        businesses,
        figmaBatches,
        figmaListings,
        figmaOffers,
        figmaTransactions,
        figmaRecoveries,
        partnerCapacity,
        addFigmaBatch,
        updateFigmaBatch,
        publishFigmaBatch,
        submitFigmaOffer,
        acceptFigmaOffer,
        rejectFigmaOffer,
        advanceFigmaTransaction,
        acceptFigmaRecovery,
        completeFigmaRecovery,
        updatePartnerCapacity,
        activeModal,
        modalData,
        openModal,
        closeModal,
        toast,
        showToast,
        exportInventoryCsv,
        exportReportsCsv,
        resetAllData,
        referenceDate: SYSTEM_TODAY,
        batches: INITIAL_BATCHES,
        listings: INITIAL_LISTINGS,
        offers: INITIAL_OFFERS,
        transactions: INITIAL_TRANSACTIONS,
        recoveries: INITIAL_RECOVERY_OPPORTUNITIES,
        batchOutcomes: INITIAL_BATCH_OUTCOMES,
        auditLogs: INITIAL_AUDIT_LOGS,
        switchUser,
        verifyBusiness: (bId: string) => {
          showToast(`Business verified: ${bId}`, 'success');
        },
        routeToRecovery: (bId: string, qty: number) => {
          showToast(`Routed ${qty} units of batch ${bId} to recovery.`, 'info');
          return { success: true };
        },
        publishListing: (bId: string, price: number) => {
          publishFigmaBatch(bId, price);
          return { success: true };
        },
        registerBatch: (batch: any) => {
          addFigmaBatch(batch);
          return { success: true, batch };
        },
        submitOffer: (lId: string, qty: number, price: number) => {
          submitFigmaOffer(lId, qty, price);
          return { success: true };
        },
        acceptRecoveryOpportunity: (rId: string, slot: string) => {
          acceptFigmaRecovery(rId, slot);
          return { success: true };
        },
        confirmRecoveryHandover: (rId: string) => {
          completeFigmaRecovery(rId);
          return { success: true };
        },
        respondToOffer: (oId: string, action: string) => {
          if (action === 'accept') acceptFigmaOffer(oId);
          else rejectFigmaOffer(oId);
          return { success: true };
        },
        confirmHandover: (tId: string) => {
          advanceFigmaTransaction(tId, 5);
          return { success: true };
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
