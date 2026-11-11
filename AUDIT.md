# SecondShelf front-end audit

Date: 9 Nov 2026 · Branch: `main` @ `6390d08` · Written before any edits.

## a) Stack

| Area | Finding |
| --- | --- |
| Framework | React 19.3.1, TypeScript 7.0.2 (`tsc --noEmit` is the only lint) |
| Build | Vite 8.3.7, `@vitejs/plugin-react` 6, dev server on port 3000 |
| Styling | Tailwind CSS 4.3.5 via `@tailwindcss/vite`. No theme tokens; every colour is a hard-coded hex in class names (`#0B3E2E`, `#22C55E`, `#F97316`…). Fonts loaded: Inter, Plus Jakarta Sans, IBM Plex Mono. Brand font Poppins not loaded. |
| Router | None. `currentView` (`public` / `auth` / `workspace`) and `currentTab` in React state; only `#auth` and `#workspace` hashes read on first load. Back button does nothing. |
| State | One 810-line React context (`src/context/AppContext.tsx`) holding two parallel data sets: `figma*` (used) and legacy `INITIAL_*` (exported but unused by screens). Persisted to `localStorage` under `secondshelf_figma_v2_*`. |
| Backend / API | **None in the repo.** No `fetch`, no websocket, no env reads in `src/`. `express` is a dependency but no server file exists. All data is seed data in `src/data/`. |
| Auth | Fake: `login(role)` sets a localStorage flag. No credentials checked. |
| Env vars | `.env.example` only lists `GEMINI_API_KEY` and `APP_URL` (hosting-tool boilerplate; neither is read). |
| Motion | `motion` 12.43 installed but **never imported**. Classes like `animate-in fade-in slide-in-from-*` come from a Tailwind plugin that is not installed, so they do nothing. |
| Icons | `lucide-react` 0.546, default 2px stroke. |
| Tests | `src/utils/expiryRules.test.ts` uses `node:test`; no script runs it. |
| Package manager | npm (`package-lock.json` untracked). Package name is `react-example`. |
| Unused deps | `@google/genai` (never imported), `dotenv`, `express` (no server). |

## b) Routes and screens

There are no URL routes. Screens are switched by state.

| Screen (file) | Purpose | Role | Demo flow? |
| --- | --- | --- | --- |
| Public landing (`views/FigmaPublicLanding.tsx`, 838 lines) | Marketing page, demo modal, role cards | Visitor | No |
| Auth (`views/FigmaAuthPage.tsx`) | Login / sign-up with 4 role cards and a green feature panel | All | Yes (entry) |
| Dashboard (`views/FigmaDashboard.tsx`, 1,246 lines) | Different dashboard per role, incl. admin | All | Yes (laptop) |
| Inventory (`views/FigmaInventory.tsx`) | Batch table, register batch | Distributor | Yes (scan) |
| Marketplace (`views/FigmaMarketplace.tsx`) | Listings grid, offer modal | Buyer | Yes (buy) |
| Offers (`views/FigmaOffers.tsx`) | Accept/reject offers | Distributor / buyer | Partly |
| Transactions (`views/FigmaTransactions.tsx`) | 5-step handover tracker | Distributor / buyer | Yes (handover) |
| Recovery (`views/FigmaRecovery.tsx`) | Food bank pickups, capacity | Food bank | No |
| Reports (`views/FigmaReports.tsx`) | Dual ledger, CSV export | Distributor | Yes (proof) |
| Profile (`views/FigmaProfile.tsx`) | Business details | All | No |

Missing for the demo: barcode scanning (the "scan" is a text field), discount slider, payment, receipt/QR, QR handover scan, Business Passport screen, cross-device updates.

## c) Components

- **In use:** `FigmaShell`, `FigmaSidebar`, `FigmaTopNav`, `ShelfmarkLogo`, 9 modals in `components/modals/`.
- **Dead (zero importers):** `Header.tsx`, `admin/AdminComplianceView.tsx`, `distributor/ExpiryRadar.tsx`, `marketplace/MarketplaceView.tsx`, `recovery/RecoveryView.tsx`, `reports/DualCounterReport.tsx`, `traceability/BusinessPassport.tsx`, `transactions/TransactionManager.tsx`, `types/index.ts` legacy types, `data/mockData.ts` (only fed unused legacy context fields).
- **Duplicates:** two `RegisterBatchModal`s (`distributor/` and `modals/`), two `OfferModal`s (`marketplace/` and `modals/`), `PublishListingModal` only reachable from dead code.
- **Duplicate data:** `src/assets/images/*` is a byte-identical copy of `public/images/*` (5 MB), referenced by string path `/src/assets/...` which breaks in a production build.
- No shared Button, Input, Card, Sheet, Badge or Toast component. Each screen restyles everything inline.

## d) Assets

| Path | Size | Subject |
| --- | --- | --- |
| `public/images/secondshelf_market_woman_1794091354727.jpg` | 1200×896, 1.06 MB | Smiling trader in red headwrap at a Lagos produce market, crowd behind. Centred subject. |
| `public/images/buyer_trade_procurement_1794003869465.jpg` | 1200×896, 1.0 MB | Man checking rice bags in a provisions store, cartons stacked, market street behind. |
| `public/images/distributor_inspection_1794003868699.jpg` | 1200×896, 0.9 MB | Woman with tablet in a warehouse, noodle and flour cartons left. |
| `public/images/hero_lagos_warehouse_1794003868225.jpg` | 1376×768, 1.1 MB | Wide warehouse floor, pallet jack, stacked cartons. |
| `public/images/recovery_handover_crates_1794003870459.jpg` | 1200×896, 1.0 MB | Team loading green crates into a food bank van. |
| `src/assets/images/*` | — | Duplicates of the five above. |
| `public/assets/aistudio/*` | ~10 MB | 48 research screenshots, brand board, 3 PDFs, a pasted text file. Shipped to production by Vite because they sit in `public/`. |
| `src/components/common/ShelfmarkLogo.tsx` | SVG | The logo mark in use (4 paths). Wordmark set in Plus Jakarta Sans. |

**Login photo choice: `secondshelf_market_woman`.** Real person, real goods, warm light. The subject sits in the centre, so it holds up both as a tall half-screen crop on desktop and as a short top band on mobile (face at ~33% height).

## e) AI tells

The grep from the brief, run over `src/`, `index.html` and config:

| File:line | Tell |
| --- | --- |
| `views/FigmaAuthPage.tsx:7,187` | `Sparkles` icon |
| `views/FigmaDashboard.tsx:21,1112` | `Sparkles` icon |
| `views/FigmaMarketplace.tsx:9,75,131` | `Sparkles` icon ×2 |
| `views/FigmaPublicLanding.tsx:13,198,694` | `Sparkles` icon ×2 |
| `views/FigmaReports.tsx:16` | `Sparkles` import |
| `layout/FigmaSidebar.tsx:17,402` | `Sparkles` icon |
| `distributor/ExpiryRadar.tsx:17,166`, `distributor/RegisterBatchModal.tsx:5,399` | `Sparkles` icon (dead code) |
| `transactions/TransactionManager.tsx:287` | "unlock" (dead code) |
| `vite.config.ts:15` | Comment naming the hosting tool ("AI Studio") |
| `metadata.json:5` | `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` |
| `.env.example:1-3` | `GEMINI_API_KEY`, "Gemini AI API calls", "AI Studio" |
| `package.json` | `@google/genai` dependency |
| `.aistudio/` (whole folder) | Tool workspace: "brain" folder, generated handoff reports, 30 screenshots |
| `public/assets/aistudio/` | Folder name, plus files like `uxpilot-export-*.pdf` |

Other tells found by reading:

- Emoji/dingbats in UI: `✓` in `FigmaSidebar.tsx:325,337,349,361`, "Accept offer ✓" `modals/OfferModal.tsx:135`, "Complete transaction ✓" `modals/TransactionModal.tsx:274`.
- Purple: `reports/DualCounterReport.tsx:163`.
- Gradients: `FigmaPublicLanding.tsx:165,213`.
- Floating toast pinned bottom-right on all sizes (`FigmaShell.tsx:80`), covers content on mobile.
- Identical icon cards in grids of 3: landing "Scan / Sell / Prove" and role cards; auth page role cards.
- Invented stats and claims: landing and auth panel ("trusted B2B network…", partner names), "Verified Trader" badges without verification.
- Engineering jargon presented to users: "RULE 1 ENFORCED · ZERO POST-EXPIRY POLICY", "Ledger A / Ledger B", "dual-signed gate pass", "STATUS: UNVERIFIED / METHODOLOGY TO INVESTIGATE".
- No chat widget or "Ask AI" button was found.

## f) Copy

Static JSX text only (seed-data strings add more):

| Screen | Words | Strings > 12 words |
| --- | --- | --- |
| Dashboard | 521 | 2 |
| Public landing | 462 | 1 |
| Reports | 343 | 1 |
| Auth | 237 | 5 |
| Marketplace | 224 | 3 |
| Inventory | 143 | 1 |
| Transactions modal | 112 | 1 |
| Publish listing modal | 100 | 1 |
| Register batch modal | 94 | 2 |
| Recovery | 89 | 1 |
| Transactions | 83 | 2 |
| Offers | 71 | 1 |
| Profile | 58 | 0 |
| **Total (reachable)** | **~2,700** | **25** |

Examples of paragraphs to cut:
- `FigmaAuthPage.tsx:196` "A trusted B2B network connecting distributors in Mushin & Idumota with commercial buyers…"
- `FigmaMarketplace.tsx:84` "Procure near-expiry wholesale ingredients direct from verified Lagos distributors. Inspect batches at depot loading bays with dual sign-off…"
- `FigmaTransactions.tsx:73,91` depot instructions and verification policy.
- `FigmaDashboard.tsx:129,1167` admin disclaimer and capacity explanation.
- `modals/PartnerCapacityModal.tsx:38`, `modals/RegisterBatchModal.tsx:185`, `modals/TransactionModal.tsx:268`.

Labels over 3 words are common (e.g. "Printed expiry date (YYYY-MM-DD)", "Fulfilment pending (Handover begun)"). Toasts are full sentences ("Batch SS-0854 is now live on the marketplace!").

## g) Motion

- No working animation: `motion` is unused and the `animate-in` utilities don't exist without their plugin. Modals pop in and out with no transition.
- `transition-colors`/`transition-all` with fixed durations on buttons; no press feedback on pointer-down.
- Mobile nav is a left drawer with no gesture, no exit animation.
- No loading states anywhere: actions complete instantly with a toast, so there is no visible process.
- No skeletons; lists re-render and jump when items change.
- `animate-pulse` in the dashboard ignores `prefers-reduced-motion`.

## h) Responsiveness (read from code and earlier captures)

| Width | Behaviour |
| --- | --- |
| 375 | Drawer nav behind a hamburger. Wide tables overflow sideways (inventory, reports). Toast covers the bottom of content. Modals are centred cards that can exceed viewport height. |
| 768 | Same drawer pattern; dashboards fall to 1 column with large empty margins. |
| 1280 | Fixed 238px sidebar, content up to 1570px wide. Dense, many cards per row. |
| 1440 | Same as 1280 with wider lines of text; no max reading width. |

## i) Risks

- There is no backend contract in this repo to break. The redesign keeps all data behind one interface (`src/lib/api`) so a real backend can be wired in without touching screens.
- Cross-device live updates (phone → phone → laptop) are impossible with `localStorage` alone. A small demo sync endpoint is needed.
- Camera access needs HTTPS. No deploy target is configured; local LAN demo needs an HTTPS tunnel.
- `localStorage` from the old build (`secondshelf_figma_v2_*`) would be ignored by the new data layer; no migration needed.
- `.aistudio/` and `public/assets/aistudio/` hold research files the team may want. They stay in git history; research files move to `docs/research/` so they no longer ship to users.

## Change plan (priority order)

1. **Remove AI signs and dead weight.** Drop `@google/genai`, `dotenv`, `metadata.json`, `.aistudio/`, tool comments; move research assets out of `public/`; delete dead and duplicate components and the duplicate image folder.
2. **Design system.** Tokens in CSS variables mapped into Tailwind `@theme`; Poppins; motion presets; haptics; core components (Button, Input, DateField, QuantityStepper, SegmentedControl, Card, ListRow, Badge, BottomSheet, Toast, Skeleton, ProgressSteps, EmptyState, CountUp, TopBar, TabBar, Sidebar).
3. **Data layer.** `src/lib/api` interface + `src/lib/mock` adapter behind `VITE_DEMO_MODE`; pure reducer shared with a tiny sync endpoint (Vite plugin in dev/preview, Express `server.ts` in production) so three devices stay in step; seeded Lagos data; pure carbon function with tests.
4. **Hash router** with shared-axis page transitions and working back button.
5. **Login** split photo layout.
6. **Flows A–E** rebuilt on the system: scan, list, buy and pay, handover, dashboard and passport.
7. **Responsive, accessibility and PWA pass**; optimised WebP images; screenshots at 375 and 1440.
8. **Docs:** `CHANGES.md` (with demo script) and `DEMO.md` (barcodes).

Note: `.claude/skills/apple-design/SKILL.md` is not in this repository. The motion and interaction rules listed in the brief are followed directly.
