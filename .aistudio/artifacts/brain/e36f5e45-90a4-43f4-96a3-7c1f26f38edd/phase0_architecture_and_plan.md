# SECONDSHELF — PHASE 0 ARCHITECTURE & MASTER ENGINEERING SPECIFICATION

## 1. Product Requirements Summary
SecondShelf is a B2B food inventory recovery and traceability network initially focused on wholesale distributors, commercial buyers, and recovery organizations in Lagos, Nigeria (pilot depots: Mushin Wholesale Depot and Idumota Central Market).

### Core Proposition
"SecondShelf helps food businesses identify at-risk inventory, connect it with suitable buyers or recovery partners, and record what happens to every batch."

### The Three Operational Pillars
- **SCAN**: Inventory registration, printed expiry date recording, 6-week expiry radar tracking.
- **SELL**: B2B bulk surplus marketplace, commercial negotiation, structured 20–35% markdowns.
- **PROVE**: Two-sided physical handover, quantity reconciliation, and immutable batch outcome audit records.

---

## 2. MVP Feature Matrix
| Module | Features |
| :--- | :--- |
| **Public Website** | Hero with value proposition, 3-pillar breakdown, audience routing (Distributor, Buyer, Recovery), Trust guardrails, FAQ accordions. |
| **Authentication & Onboarding** | Split-screen brand auth, prototype workspace access, role-based onboarding (Distributor, Buyer, Recovery Partner, Administrator). |
| **Distributor Dashboard** | At-a-glance KPI cards, 6-month inventory trend bar chart, At-risk inventory radar, recent transactions, quick action triggers. |
| **Inventory Management** | Batch listing with printed expiry countdown, status badges (`• Listed`, `• Not listed`, `• Recovery`), Add Batch modal, Batch Details modal, Edit Batch modal. |
| **Marketplace & Listings** | B2B catalogue with category/location/MOQ filters, Listing Detail modal, Submit Offer modal, WhatsApp fast-order generation. |
| **Offers & Negotiations** | Received & submitted offers tabs, accept/reject/counter-offer workflow with binding commitment calculation. |
| **Transactions & Handover** | 5-step lifecycle stepper (`Offer accepted` → `Fulfilment arranged` → `Fulfilment pending` → `Fulfilment confirmed` → `Completed`), two-sided evidence simulation, quantity reconciliation. |
| **Recovery & Food Rescue** | Recovery opportunities, claim donation lots, coordinate collection window, partner capacity configuration. |
| **Business Reports** | Strict separation of Commercial Sales Performance from Recovery Quantity Records (with explicit disclaimer: *No carbon-credit eligibility or verified environmental impact is asserted*). |
| **Business Profile & KYC** | Organization credentials, contact lead, simulated accreditation badge, notification preferences. |

---

## 3. User Roles & Permissions
1. **DISTRIBUTOR (`distributor`)**:
   - Register batches, edit batch details, publish marketplace listings, review/accept/counter offers, schedule collection, confirm handover, view commercial reports.
2. **BUYER (`buyer`)**:
   - Browse marketplace, filter listings, submit binding price/quantity offers, arrange collection, confirm receipt.
3. **RECOVERY PARTNER (`recovery_partner`)**:
   - Browse eligible lots nearing expiry (<= 14 days), accept donation opportunities, set collection slots, confirm charity handovers.
4. **ADMINISTRATOR (`admin`)**:
   - Platform-wide oversight, verify merchant KYC, audit tamper-evident logs, monitor transactions.

---

## 4. Route & Navigation Map
- `/` or `view = 'public'`: Public Landing Page
- `view = 'auth'`: Login, Sign-up, Password Reset, Role Onboarding
- `view = 'workspace'`: The Authenticated Business Shell
  - Tab `dashboard`: Distributor / Business Dashboard
  - Tab `inventory`: Inventory Management & Expiry Radar
  - Tab `marketplace`: B2B Surplus Marketplace
  - Tab `offers`: Incoming & Outgoing Offers
  - Tab `transactions`: Active Transactions & Fulfilment Lifecycle
  - Tab `recovery`: Food Recovery & Donation Pipeline
  - Tab `reports`: Business Reports (Commercial vs Recovery)
  - Tab `profile`: Business Profile & Verification Credentials

---

## 5. Component Architecture
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               # Figma Left Sidebar (nav, promo card, user footer)
│   │   ├── Topbar.tsx                # Workspace Header (status, depot tag, notifications, user avatar)
│   │   └── PublicNav.tsx             # Public Landing Navigation
│   ├── public/
│   │   ├── LandingPage.tsx           # Full Figma Landing Page
│   │   └── AuthPage.tsx              # Split-screen Login/Register/Role Switcher
│   ├── dashboard/
│   │   ├── DashboardView.tsx         # Figma Distributor Dashboard
│   │   └── InventoryChart.tsx        # 6-Month Healthy vs At-Risk bar visualization
│   ├── inventory/
│   │   ├── InventoryView.tsx         # Inventory list with status badges & filters
│   │   ├── RegisterBatchModal.tsx    # Add inventory batch modal
│   │   ├── BatchDetailsModal.tsx     # Full batch lifecycle & quantity reconciliation modal
│   │   └── EditBatchModal.tsx        # Edit existing batch modal
│   ├── marketplace/
│   │   ├── MarketplaceView.tsx       # Listing cards, search, category & location filters
│   │   ├── ListingDetailsModal.tsx   # Listing detail modal
│   │   ├── SubmitOfferModal.tsx      # Buyer offer submission modal
│   │   └── HowBuyingWorksModal.tsx   # Buying guide modal
│   ├── offers/
│   │   ├── OffersView.tsx            # Received/Submitted offers tabs
│   │   └── OfferModal.tsx            # Offer acceptance & details
│   ├── transactions/
│   │   ├── TransactionsView.tsx      # Transactions overview
│   │   └── TransactionLifecycleModal.tsx # 5-step stepper & 2-sided confirmation
│   ├── recovery/
│   │   ├── RecoveryView.tsx          # Recovery opportunities & history
│   │   ├── RecoveryDetailsModal.tsx  # Accept recovery opportunity
│   │   └── PartnerCapacityModal.tsx  # Set max collection units
│   ├── reports/
│   │   └── ReportsView.tsx           # Commercial records & recovery quantity separation
│   ├── profile/
│   │   └── BusinessProfileView.tsx   # Profile details, notification toggles, support
│   └── common/
│       ├── ShelfmarkLogo.tsx         # SecondShelf Brand Logo
│       └── StatusBadge.tsx           # Reusable status chips
├── context/
│   └── AppContext.tsx                # Reactive state, business rules, local persistence
├── data/
│   └── figmaSeedData.ts              # Seed data matching Figma screenshots (Adeyemi Foods, Mainland Caterers, SS-0849, etc.)
├── utils/
│   └── expiryRules.ts                # Pure business logic and unit-tested validation
└── types/
    └── index.ts                      # Strict TypeScript domain interfaces
```

---

## 6. Database Schema (Firestore & Local Reactive Store)
- `users`: User identity, email, role, businessId.
- `businesses`: Business name, type, location, contact, verification status.
- `inventory_batches`: Batch ID (e.g. `SS-0849`), product name, category, quantity, unit, printed expiry date, asking price, stock location, packaging intact flag.
- `listings`: Listing ID, batchId, quantity, askingPrice, expiryDate, status.
- `offers`: Offer ID (e.g. `OF-2041`), listingId, buyerBusiness, requestedQty, offerPrice, status (`pending`, `accepted`, `rejected`).
- `transactions`: Transaction ID (e.g. `TX-02285`), agreed quantity, agreed value, state (`offer_accepted`, `fulfilment_arranged`, `fulfilment_pending`, `fulfilment_confirmed`, `completed`), evidence reference, timestamps.
- `recoveries`: Recovery ID (e.g. `RC-0301`), batchId, quantity, status (`available`, `accepted`, `handover_confirmed`), collection date.
- `batch_outcomes`: Traceability record, commercial value or kilograms donated, evidence reference.
- `audit_logs`: Timestamped actions for governance.

---

## 7. Critical Business Rules (Non-Negotiable)
1. **RULE 1 — EXPIRY ELIGIBILITY**: Expired food can NEVER be sold or donated.
2. **RULE 2 — INVENTORY ACCURACY**: Printed expiry date and original packaging are mandatory.
3. **RULE 3 — TRANSACTION STATE**: An offer is not an order; acceptance is not fulfilment; fulfilment must be verified before completion.
4. **RULE 4 — RECOVERY STATE**: Acceptance reserves a collection; it does not confirm handover.
5. **RULE 5 — QUANTITY RECONCILIATION**: Fulfilment automatically reconciles available stock to prevent overselling.
6. **RULE 6 — STRUCTURAL SEPARATION**: Commercial sales performance and environmental recovery must remain completely separate; no false carbon credit claims.
