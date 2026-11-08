# SECONDSHELF — COMPREHENSIVE DEVELOPER HANDOFF REPORT & ENGINEERING AUDIT

**Version:** 1.0.0 — Production-Ready Handoff  
**Target Market:** Lagos Wholesale Food Ecosystem (Mushin Wholesale Depot #04, Idumota Market Hub, Mile 12)  
**Date:** November 2026  
**Engineering Leads:** Senior Full-Stack Engineer, Product Architect & UX Lead  

---

## 1. Executive Summary & Product Architecture

**SecondShelf** is a B2B food inventory recovery and traceability network purpose-built for the wholesale FMCG ecosystem in Lagos, Nigeria. The platform resolves the structural problem of commercial food loss by intervening **42 days (6 weeks) before printed expiry**, enabling distributors to recover capital through verified commercial buyers or orderly routing through accredited food rescue charities.

### The Three Operational Pillars

| Pillar | Core Mission | Key Platform Capabilities |
| :--- | :--- | :--- |
| **01 · SCAN** | **Pre-Expiry Early Risk Detection** | 42-day Smart Expiry Radar, batch lot registration, original factory seal verification, manufacturer packaging compliance. |
| **02 · SELL** | **Commercial Wholesale Marketplace** | Private B2B counter-offer trading, transparent volume markdowns, cashflow preservation for FMCG distributors. |
| **03 · PROVE** | **Dual-Ledger Traceability & Handover** | Dual-signed depot loading bay gate passes, photo proof, separated **Ledger A** (commercial cash realized) & **Ledger B** (environmental/relief impact). |

---

## 2. Persona Architecture & RBAC Matrix

The system recognizes four operational personas. Public self-registration is strictly restricted to commercial and charity entities (Personas 01–03). Platform Admin accounts (Persona 04) are restricted to state regulatory and compliance officers and cannot be created via public signup.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               SecondShelf Platform Root                │
                    └───────────────────────────┬────────────────────────────┘
                                                │
         ┌───────────────────────┬──────────────┴───────────────┬────────────────────────┐
         ▼                       ▼                              ▼                        ▼
  01. DISTRIBUTOR          02. BUYER                  03. RECOVERY PARTNER        04. PLATFORM ADMIN
  Adeyemi Foods & Dist.   Mainland Caterers           Lagos Community Kitchen     State Food Safety Enf.
  (Tunde Adeyemi)         (Chef Chioma Okonkwo)       (Brother Paul)              (Dr. Amina Bello)
  ---------------------   -------------------------   -------------------------   ----------------------
  • Inventory Radar       • B2B Marketplace           • Opportunity Feed          • Business Verification
  • Batch Logging         • Custom Counter-Offers     • Weekly Storage Cap (50u)  • Rule 1 Trade Locks
  • Buyer Offer Desk      • Seal Inspection Checklist • Dual-Signed Handover      • Dual Ledger Audit
  • Handover Bay Sign-Off • Purchase Ledger           • Relief Outcome Proof      • System Session Logs
```

### Detailed RBAC & Permissions Matrix

| Feature / Capability | Distributor / Seller | Buyer / Retailer | Recovery Partner | Platform Admin / Auditor |
| :--- | :---: | :---: | :---: | :---: |
| **Public Self-Signup** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Restricted (Regulator only) |
| **Default Entry View** | Overview Dashboard | Marketplace Browse | Recovery Opportunities | Admin Console Overview |
| **Inventory Batch Scanning / Registration** | ✅ Create / Edit / Archive | ❌ Read Only (as listings) | ❌ Read Only (eligible lots) | ✅ Full Audit Access |
| **42-Day Expiry Radar Inspection** | ✅ Full Depot Radar | ❌ Hidden | ❌ Hidden | ✅ Network-wide View |
| **Publish Surplus Listing** | ✅ Create / Withdraw | ❌ None | ❌ None | ✅ Moderation / Trade Lock |
| **Submit Counter-Offers** | ❌ Counter-party | ✅ Submit Price/Qty | ❌ Claim Workflow Only | ✅ Audit Transaction Log |
| **Accept / Reject Buyer Offers** | ✅ Authorize / Decline | ❌ Receive Status | ❌ None | ✅ View Historical Terms |
| **Weekly Intake Capacity Cap Config** | ❌ None | ❌ None | ✅ Configure Storage Limit | ✅ View Partner Thresholds |
| **Reserve Recovery Opportunity** | ❌ None | ❌ None | ✅ Reserve within Cap | ✅ Monitor Intake Safety |
| **Dual-Signed Loading Bay Handover** | ✅ Sign Seller Gate Pass | ✅ Sign Buyer Gate Pass | ✅ Sign Charity Gate Pass | ✅ Inspect Dual Signatures |
| **Ledger A: Financial Performance** | ✅ Depot Turnover & Markdowns | ✅ Purchase Savings | ❌ Hidden | ✅ Macro Commercial Report |
| **Ledger B: Environmental & Relief Impact** | ✅ Secondary ESG Metrics | ❌ None | ✅ Meal & kg Rescued Proof | ✅ Full VM0046 Carbon Audit |

---

## 3. Core Business Rules & Operational Policies

### Rule 1: Zero Post-Expiry Sales Policy (Critical Health Standard)
- **Invariant:** Stock that has reached or passed its printed expiry date ($T \le 0$) is **strictly locked from commercial trade and charity donation**.
- **System Enforcement:**
  1. The platform executes an automatic trading lock on any batch reaching $T = 0$.
  2. The batch status immediately flips to `Locked` / `Trade Lock Enforced`.
  3. Action buttons (`Publish Listing`, `Accept Offer`, `Route Recovery`) are permanently disabled.
  4. Visual indicators display prominent red badges: `RULE 1 ENFORCED · ZERO POST-EXPIRY POLICY`.

### Rule 2: Smart Expiry Radar (42-Day Detection Window)
- **Invariant:** FMCG batches with $\le 42 \text{ days}$ ($6 \text{ weeks}$) shelf life are automatically categorized as **At-Risk**.
- **Thresholds:**
  - $\le 14 \text{ days}$: `Critical` (Red) — immediate counter-offer or emergency recovery recommended.
  - $15 \text{ to } 42 \text{ days}$: `High Priority` (Orange) — marketplace surplus listing recommended.
  - $> 42 \text{ days}$: `Healthy Stock` (Green) — normal wholesale storage.

### Rule 3: Recovery Partner Intake Capacity & Storage Safety
- **Invariant:** Recovery partners operate with finite cold and dry storage. The platform prevents depot "waste dumping" onto charities.
- **Enforcement:** Each partner defines an active intake capacity threshold (default: `50 units`). If an incoming lot exceeds available partner capacity, the system triggers a warning modal and disallows unilateral batch dumping.

### Rule 4: Dual-Signed Physical Handover Protocol
- **Invariant:** A transaction or recovery outcome is **not complete upon digital acceptance**. Physical transfer must be verified at the depot loading bay.
- **Workflow:**
  1. Agreement reached (commercial offer accepted or recovery reserved).
  2. Generation of sequential 4-step dispatch: `Agreed` $\rightarrow$ `Collection Scheduled` $\rightarrow$ `Bay Inspection` $\rightarrow$ `Completed Handover`.
  3. Dual sign-off: Distributor representative and Buyer/Charity driver verify physical seal and sign loading bay documentation.

### Rule 5: Two Separated Ledgers (Integrity Separation)
- **Invariant:** A discounted sale is **never conflated with charitable food waste diversion**.
- **Ledger A (Commercial Value Recovered):**
  - Metric: Naira ($\text{NGN}$) realized, markdowns applied vs. depot standard wholesale price, and recovered working capital.
- **Ledger B (Environmental & Relief Impact):**
  - Metric: Kilograms of food rescued, category breakdown, verified beneficiary meals served, and Verra VM0046 aligned carbon mitigation ($t\text{CO}_2\text{e}$).

---

## 4. Entity Relational Schema (Database Blueprint)

Below is the production-ready PostgreSQL / Cloud SQL schema design for the development team:

```sql
-- Core Enums
CREATE TYPE user_role AS ENUM ('distributor', 'buyer', 'recovery_partner', 'admin');
CREATE TYPE batch_status AS ENUM ('healthy', 'approaching_expiry', 'critical', 'listed', 'sold', 'recovered', 'expired_locked');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'cancelled');
CREATE TYPE transaction_status AS ENUM ('pending_collection', 'inspected_at_bay', 'handover_signed', 'completed', 'disputed');
CREATE TYPE recovery_status AS ENUM ('available', 'reserved', 'collected', 'verified_distributed');

-- 1. Businesses Table (Depots, Caterers, Charities)
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registered_role user_role NOT NULL,
    reference_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. SS-BIZ-0042
    location_market VARCHAR(100) NOT NULL,     -- Mushin Wholesale Depot #04, Idumota
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB,              -- CAC, NAFDAC license, LGA trade permit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(30),
    avatar_initials VARCHAR(4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inventory Batches Table (Distributor Stock Log)
CREATE TABLE inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE RESTRICT,
    batch_number VARCHAR(100) NOT NULL,        -- e.g. LT-24-0812
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,            -- Canned Goods, Grains & Cereals, Oils
    total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
    available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
    unit_of_measure VARCHAR(50) NOT NULL,      -- cartons, bags, crates
    printed_expiry_date DATE NOT NULL,
    storage_bay VARCHAR(100),                  -- Section B-12
    original_unit_cost NUMERIC(12, 2) NOT NULL, -- NGN
    status batch_status NOT NULL DEFAULT 'healthy',
    is_factory_seal_intact BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_batches_expiry ON inventory_batches(printed_expiry_date);
CREATE INDEX idx_batches_business ON inventory_batches(business_id);

-- 4. Surplus Listings Table (Marketplace Catalog)
CREATE TABLE surplus_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES inventory_batches(id) ON DELETE RESTRICT,
    seller_business_id UUID REFERENCES businesses(id) ON DELETE RESTRICT,
    listing_reference VARCHAR(50) UNIQUE NOT NULL, -- SS-LST-0081
    offered_quantity INTEGER NOT NULL CHECK (offered_quantity > 0),
    asking_price_per_unit NUMERIC(12, 2) NOT NULL,
    original_price_per_unit NUMERIC(12, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
        ROUND(((original_price_per_unit - asking_price_per_unit) / original_price_per_unit) * 100, 2)
    ) STORED,
    minimum_order_quantity INTEGER DEFAULT 1,
    pickup_depot_location VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Price Offers Table (Commercial Counter-Offers)
CREATE TABLE price_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES surplus_listings(id) ON DELETE RESTRICT,
    buyer_business_id UUID REFERENCES businesses(id) ON DELETE RESTRICT,
    buyer_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    offer_reference VARCHAR(50) UNIQUE NOT NULL, -- OF-0891
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    offered_price_per_unit NUMERIC(12, 2) NOT NULL,
    total_offer_value NUMERIC(12, 2) GENERATED ALWAYS AS (
        requested_quantity * offered_price_per_unit
    ) STORED,
    buyer_note TEXT,
    status offer_status NOT NULL DEFAULT 'pending',
    response_note TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Physical Transactions & Handover Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID REFERENCES price_offers(id) ON DELETE RESTRICT,
    transaction_reference VARCHAR(50) UNIQUE NOT NULL, -- TX-1092
    seller_business_id UUID REFERENCES businesses(id),
    buyer_business_id UUID REFERENCES businesses(id),
    agreed_quantity INTEGER NOT NULL,
    agreed_price_per_unit NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    collection_scheduled_date DATE,
    depot_gate_pass_number VARCHAR(100),
    seller_signoff_name VARCHAR(150),
    seller_signed_at TIMESTAMP WITH TIME ZONE,
    buyer_signoff_name VARCHAR(150),
    buyer_signed_at TIMESTAMP WITH TIME ZONE,
    photo_evidence_url TEXT,
    status transaction_status NOT NULL DEFAULT 'pending_collection',
    ledger_a_settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Recovery Reservations Table (Ledger B Traceability)
CREATE TABLE recovery_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES inventory_batches(id) ON DELETE RESTRICT,
    recovery_partner_id UUID REFERENCES businesses(id) ON DELETE RESTRICT,
    recovery_reference VARCHAR(50) UNIQUE NOT NULL, -- RC-0301
    reserved_quantity INTEGER NOT NULL,
    food_category VARCHAR(100) NOT NULL,
    collection_date DATE,
    driver_name VARCHAR(150),
    driver_vehicle_plate VARCHAR(30),
    loading_bay_inspector VARCHAR(150),
    photo_verification_url TEXT,
    meals_served_estimate INTEGER,
    co2_kg_avoided NUMERIC(10, 2),
    status recovery_status NOT NULL DEFAULT 'reserved',
    ledger_b_confirmed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Regulatory Audit Trail Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performed_by_user_id UUID REFERENCES users(id),
    target_entity_type VARCHAR(50) NOT NULL, -- batch, transaction, listing, user
    target_entity_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL,       -- TRADE_LOCK_ENFORCED, DUAL_SIGNATURE_SUBMITTED
    action_metadata JSONB,
    client_ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Screen Catalog & Navigation Flow

```
[ Public Landing Page ] (/)
   │
   ├─► [ View Demo Modal ] ──► One-Click Workspace Selection:
   │                             ├── 1. Distributor (Tunde Adeyemi)
   │                             ├── 2. Buyer (Chef Chioma Okonkwo)
   │                             ├── 3. Recovery Partner (Brother Paul)
   │                             └── 4. Platform Admin (Dr. Amina Bello)
   │
   ├─► [ Sign In / Auth ] (/auth)
   │     ├── Authorized Persona Credentials Auto-Fill
   │     ├── Email / Password Validation
   │     └── Resolve Role & Redirect to Customized Workspace
   │
   └─► [ Public Registration ] (/auth?mode=signup)
         ├── Business Role Selection (Distributor, Buyer, Recovery Partner ONLY)
         ├── Admin Restriction Security Notice
         └── Direct Onboarding to Respective Workspace
```

### Workspace Navigation by Persona

| Navigation Item | Distributor | Buyer | Recovery Partner | Platform Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard / Overview** | Full Depot KPIs & Radar Table | Market Activity Summary | Rescue Capacity & Stats | Network-Wide KPIs & Queue |
| **Inventory** | Batches & 42-Day Expiry Radar | *(N/A)* | *(N/A)* | *(N/A)* |
| **Marketplace** | Seller Surplus Listings | Wholesale Procurement Feed | *(N/A)* | Active Listings Audit |
| **Offers** | Buyer Price Negotiation Desk | My Submitted Counter-Offers | *(N/A)* | *(N/A)* |
| **Transactions** | Commercial Sales Ledger | Purchase History & Gate Passes| *(N/A)* | Network Commercial Ledger |
| **Recovery** | Outbound Donation Records | *(N/A)* | Intake & Handover History | Environmental VM0046 Audit |
| **Reports** | Depot Recovery & Loss Avoidance| Procurement Savings Report | Impact & Meal Distribution | State Food Safety Audit Log |
| **Business Profile / Users**| Depot License & Contact Data | Commercial Operator License | Non-Profit Verification | Regulatory Officer Profile |

---

## 6. Design System Tokens & Brand Standards

All interfaces strictly adhere to the SecondShelf design system:

- **Primary Colors:**
  - `Forest Green`: `#0B3E2E` (Sidebar, primary CTAs, main headlines, brand authority)
  - `Deep Forest Hover`: `#072A1F`
  - `Fresh Green`: `#22C55E` (Verified badges, healthy stock indicators, accent highlights)
  - `Impact Orange`: `#F97316` / `#B74C16` (Expiry warnings, at-risk badges, high-priority lots)
  - `Alert Red`: `#EF4444` / `#A72D2D` (Critical expiry $\le 14\text{ days}$, trade lock warnings)
  - `Clean Cream`: `#F8FAF7` (Application background, card containers)
  - `Card Tint Green`: `#EEF4E9` (Interactive active states, selected items)
  - `Border Subtle`: `#E7EAE4` and `#DCE1D9`
- **Typography:**
  - Headlines & Wordmark: `Plus Jakarta Sans`, font weights `[700, 750]`
  - Body & Form Controls: `Inter`, font weights `[450, 500, 600]`
  - Batch Numbers, Gate Passes & Technical Codes: `IBM Plex Mono`, font weight `[600]`
- **Responsive Layout Rules:**
  - Viewport-aware layout: Full desktop sidebar ($220\text{px}$ width), collapsible mobile drawer with overlay.
  - Zero-pill discipline: Clean, squared button edges with $4\text{px}$ to $6\text{px}$ border radius.
  - No text overflow: Strict `whitespace-nowrap` on action pills and table metadata.

---

## 7. QA Verification & Code Audit Status

| Audit Item | Specification | Status | Evidence |
| :--- | :--- | :---: | :--- |
| **Default Entry Route** | Unauthenticated `/` must load `FigmaPublicLanding` | **VERIFIED** | Default view set to `'public'`, route guarded in `App.tsx` |
| **Hero Headline** | "Give surplus food a second chance." + "Real business value." | **VERIFIED** | Clean brand copy with authentic depot photography |
| **Unified Auth** | All 4 personas recognized with auto-fill credentials | **VERIFIED** | Tested in `FigmaAuthPage.tsx` with role resolution |
| **Public Signup Restr.** | Strictly 3 business roles; Admin account restricted | **VERIFIED** | Admin disabled in public signup with security notice |
| **Dedicated Demo Modal** | 1-click evaluation experience for all 4 personas | **VERIFIED** | Verified via Playwright screenshot capture `r2-demo-modal.png` |
| **4 Workspace Contexts**| Distinct navigation, header titles, and view content | **VERIFIED** | Distributor, Buyer, Recovery, and Admin properly separated |
| **Rule 1 Zero Expiry** | Automatic trade lock on expired stock | **VERIFIED** | Enforced with badge warning and action disabled |
| **Two Ledgers Split** | Commercial (Ledger A) separated from Impact (Ledger B) | **VERIFIED** | Implemented on Landing, Reports, and Admin views |
| **Dual Handover Signing**| Loading bay gate pass dual-signature requirement | **VERIFIED** | Implemented in transaction workflow |
| **TypeScript Compilation**| 0 compiler errors | **VERIFIED** | `compile_applet` passed |
| **Linter Check** | 0 linter errors across all files | **VERIFIED** | `lint_applet` (`tsc --noEmit`) passed with 0 errors |

---

## 8. Backend Implementation & Integration Checklist

When handing off this frontend codebase to the backend development team, execute the following steps:

1. **Database Provisioning:**
   - Run the DDL script in Section 4 on PostgreSQL 16+ or Google Cloud SQL.
   - Seed the initial Lagos wholesale market depot reference table (`businesses` and initial demo users).
2. **Authentication Service Integration:**
   - Swap the client-side `AppContext.login()` mock with standard JWT authentication or Firebase Auth.
   - Enforce server-side role validation in API middleware (`requireRole(['distributor', 'admin'])`).
3. **Automated Expiry Cron Job:**
   - Schedule a nightly cron job (e.g., at 00:00 WAT) calculating:
     $$\text{DaysRemaining} = \text{printed\_expiry\_date} - \text{CURRENT\_DATE}$$
   - If $\text{DaysRemaining} \le 0$, automatically execute:
     `UPDATE inventory_batches SET status = 'expired_locked' WHERE printed_expiry_date <= CURRENT_DATE;`
     `UPDATE surplus_listings SET is_active = FALSE WHERE batch_id IN (...);`
4. **Photo Upload Pipeline:**
   - Integrate signed URLs (Google Cloud Storage or AWS S3) for loading bay physical handover photos and business CAC certificates.
5. **Notification Gateway:**
   - Integrate SMS / WhatsApp notifications (via Africa's Talking or Twilio) to notify Lagos depot managers when counter-offers are submitted or collections scheduled.
6. **Carbon Accounting Export:**
   - Build automated export endpoints compliant with the Verra VM0046 methodology for Ledger B recovery data.

---

*Second chances, properly accounted for.*  
**SecondShelf Engineering Team — Ready for Developer Handoff.**
