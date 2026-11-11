# SecondShelf redesign: changes and demo script

## Frontend v2 (branch `frontend-v2`, 11 Nov)

The whole interface was rebuilt around the **batch** (one product, one expiry date, one quantity) and its journey: Scanned → Listed → Sold → Paid → Handed over → Paid out → Carbon. The previous interface is tagged **`v1-backup`** (`838ab4f`) for rollback.

**Unchanged:** server, `/api` routes, data shapes, database, bank client, webhooks, payments, payouts, consent, loan and carbon logic. The v2 screens use the same API client (`src/lib/api`, `src/lib/mock/adapter.ts`). No new endpoints were needed.

**New**
- `src/ui/`: v2 app (`App.tsx`, `shell.tsx`), the kit (`kit/`: buttons, pills, cards, the draggable sheet, toasts, fields, 6-box OTP, journey timeline, Bank card, Bank process, scanner, QR) and `data.tsx`. Every number a screen shows is computed there from the one shared state, so no figure can disagree with itself.
- Screens:
  - Public: landing page and sign-in.
  - Distributor: Home dashboard, Stock (five sections), Scan, Batch journey (one big button for the next step), List sheet, Sales, Handover, Money ledger, Passport (consent and stock loan), Carbon, Certificate, Live board.
  - Buyer: Home, Offers, Product, Checkout, Paid, Orders.
  - Food bank: Pickups.
  - Credits page.
- Each action returns to the batch with the next stage lit. For example, a handover lands on the batch with the payout sheet open.
- **Photos:** one real photo per product, from Pexels, stored as WebP in `public/images/` (credits in `CREDITS.md` and at `/#/credits`). Fonts are bundled too (`public/fonts/`), so the demo needs no outside network.
- **Visual system:** Forest, Leaf, Lime (money), Teal (carbon), Amber (expiry), Coral (errors only); Poppins and Inter; a 40/32/24/20/16/14/12 type scale. Buttons with white text use a slightly deeper leaf (`#18834A`) so they pass WCAG AA; Leaf `#1F9D55` itself is used for checks and progress.
- **Toasts:** cross-device notices and toasts share one slot, bottom-centre above the tab bar on phones and bottom-right on desktop, and never cover the header or the navigation.

**Data (demo content only, shapes unchanged)**
- Five generic products added: granulated sugar, long-grain rice, spaghetti, vegetable oil and wheat flour. `FoodType` and `DRY_SHARE` in `src/lib/carbon.ts` gained their dry shares.
- Reset now gives Ade Foods five live batches, each at a different stage. Seeded history orders carry their recorded payout, so the app never offers to pay out old history again.
- Activity text "Passport shared with Access Bank" now reads "Passport shared with the bank", matching the Xtradot sandbox.

**Removed:** the old `src/App.tsx`, `src/screens/`, `src/components/`, two unused hooks, the AI-generated photos in `public/images/` and `public/images/opt/`, and the empty `public/assets/`. The service-worker cache is bumped to `v2`.

**Found while testing**
- **Duplicate name enquiry.** Two simultaneous name enquiries for the same order make `POST /api/payouts/:id/enquire` fail with `UNIQUE constraint failed: payouts.order_id` (a 500). The v2 sheet now sends only one, but two devices enquiring at the same instant could still hit it. A server fix (insert-or-ignore, then re-read) is small, but the brief froze the server, so it is not changed.

**Checks run (local demo mode, before the sandbox run)**
- Playwright, three devices (buyer phone, distributor phone, Live board at 1920): scan → list → pay → handover → payout → consent → loan → carbon → certificate. No console errors. The board showed every event within 2 s (largest gap 1.9 s), and no other trader's name appears on any screen.
- Screens checked at 360, 390, 768, 1280, 1440 and 1920, with the a11y scan for unnamed controls, alt text, labels, tap targets and headings.

## What changed

**Removed**
- Hosting-tool artefacts: the `.aistudio/` workspace, `metadata.json`, the unused `@google/genai` and `dotenv` packages, tool comments in `vite.config.ts`, Gemini keys in `.env.example`.
- Every `Sparkles` icon, the `✓` dingbats, purple, decorative gradients, invented partner/stat copy, and jargon such as "RULE 1 ENFORCED" or "Ledger A/B".
- The public landing page. The app now opens on sign-in, which is what the demo needs. The old page is in git history (`6390d08`).
- 30+ old components (two duplicate modals, eight dead files), the 810-line context, two parallel seed datasets and the duplicate image folder.
- Research files moved from `public/assets/aistudio/` to `docs/research/` so they no longer ship to users. (One pasted notes file there still mentions AI; it isn't served or shown.)

**Added**
- **Design system:** colour, type, spacing, radius, shadow and material tokens in `src/index.css`, mapped into Tailwind. Poppins 400–700. Spring presets in `src/lib/motion.ts`. Components in `src/components/ui/`.
- **Data layer:** one contract, `SecondShelfApi` (`src/lib/api/types.ts`). Screens import only `api`.
- **Hash router** with shared-axis page transitions and a working back button (`src/lib/router.ts`).
- **Screens** rebuilt for every flow (see the demo script below), plus food bank pickups.
- **PWA:** manifest, app-shell service worker, icons rendered from the logo, resized WebP copies of every photo.
- **Live view** (`/live`, "Present live" on Overview): projector screen for the demo.
- **Live banners** (`src/lib/useLiveAlerts.ts`, `src/components/ui/Banners.tsx`) and an **At risk** card on Stock.
- **Docs:** `AUDIT.md`, `DEMO.md` (printable barcodes), this file.

**Words:** about 2,700 words of interface copy before, under 650 now (−76%). No paragraphs; the longest line is an empty-state hint.

## Why, briefly

- **Calm and fast:** one primary action per screen, numbers before words, sheets for short tasks.
- **Fluid:** every touchable thing responds on pointer-down and uses springs that start from the current value. The bottom sheet tracks the finger, rubber-bands past the top, projects the flick, and hands release velocity to the spring. The same sheet becomes a right-side panel on desktop.
- **Visible process:** listing, payment, handover and bank sharing show their steps. Waits are 0.5–1.2 s per stage, never a silent spinner.
- **Still numbers:** figures never count up or animate. They show the real value; when one changes live it switches instantly and shows a small chip ("+₦130k") for four seconds.
- **Live, not static:** every device reacts to the others: banners for new listings, orders, pickups and handovers, an expiry alert on sign-in and after a scan, and a projector view that fills in Scan → Sell → Prove as it happens.
- **Honest numbers:** money and carbon sit in separate cards. Carbon counts only batches with past destruction records, handed over or collected. It shows "Verified", or "Estimate" while a payment is waiting for handover.

## What is mocked

Everything runs in **demo mode** (`VITE_DEMO_MODE`, default `true`). There was no backend in this repo, so no API endpoints, payloads or schema were changed.

| Piece | Where | Notes |
| --- | --- | --- |
| Data and rules | `src/lib/mock/adapter.ts`, `reducer.ts` | Same function signatures as `SecondShelfApi`. The pure reducer enforces the hard rules (no listing, sale or donation on or after expiry). |
| Cross-device sync | `src/lib/mock/syncServer.ts` | One in-memory database at `/demo-api/*`, served by Vite (dev/preview) and by `server.ts` (production). Each device polls every 2 s and applies its own actions optimistically, rolling back with a toast on failure. If the endpoint isn't reachable, the app falls back to this browser only (tabs still sync). |
| Sign-in | adapter `signIn` | Accepts any phone/email and a password of 6+ characters. The form is prefilled per role so nobody types on stage. |
| Barcode lookup | `src/lib/mock/catalogue.ts` | Five products, `200…` barcodes. Unknown codes open "New product". |
| Access Bank payment | adapter `placeOrder` | Sandbox simulation: "Connecting" (≈0.75 s) → "Authorising" (≈0.8 s) → "Confirmed". Cancel is allowed until authorising starts. Receipt says "Sandbox payment". |
| Undo a listing | adapter `unlistBatch` | Offered from the "Listed" toast for 5 s. |
| Passport sharing | adapter `sharePassport` | Records consent and time; nothing leaves the app. |
| Seed data | `src/lib/mock/seed.ts` | Built relative to today, so badges are always right. Ade Foods (Mushin), Mama Tolu Canteen (Yaba), Lagos Food Bank Initiative (partner example), 90 days of history. |

To connect a real backend, write an adapter implementing `SecondShelfApi` and return it from `src/lib/api/index.ts` when `VITE_DEMO_MODE=false`. No screen changes needed.

## Bank integration (Xtradot sandbox via Forge)

One container: an Express server (`src/server/`) serves the built app, `/api/*` and `GET /healthz` on `0.0.0.0:8080`. All bank calls run on the server with `x-api-key` from `GATEWAY_KEY`; the browser never talks to the bank. Our SQLite file on `/data` is the source of truth (the sandbox resets). `DEMO_MODE=true` (or no key, e.g. on a laptop) swaps in `src/server/bank/mock.ts`, which has the same functions.

| # | Flow | Status |
| --- | --- | --- |
| 1 | **Buyer payment**: `POST /payments/checkout` → hosted page → return to `/pay/return` → `GET /payments/{ref}/verify` before marking paid. Loader steps on both legs; amount checked against our record. | Built, tested in mock mode. Field names follow the guide; confirm on first sandbox run. |
| 2 | **Webhooks** at `/api/hooks/forge`: HMAC `sha256({ts}.{body})` verified with a timing-safe compare, >5 min rejected, `event_id` de-duplicated in SQLite, payment/transfer events applied, devices updated by server-sent events. Registered once on startup (secret stored in SQLite, never logged). | Built; signature logic unit-tested. |
| 3 | **Distributor payout** after handover: intra name enquiry → show "BABATUNDE OLUMIDE ADEYEMI · 0123456790" → transfer. One payout per order, stored `Idempotency-Key`, on 504 requery `GET /transfers/{ref}` and never resend. Fees, VAT and stamp duty read from the response. | Built, tested in mock mode. |
| 4 | **Share Passport**: open-banking consent → OTP (sandbox `123456`) → statement read → "Bank-verified" card on the Passport. | Built, tested in mock mode. |
| 5a | **Carbon registry (real sandbox)**: VM0046 tCO₂e → MRV as `energy_generated_kwh` with a public evidence page → auto-verify (`carbon.mrv.verified`) → credits and serial range → buyer pays `mer_900` on the hosted checkout → retire with that `payment_reference` → certificate → registry pays the pool less 2% (`transfer.successful`) → 60% to Ade Foods by name enquiry → transfer. Dashboard: Submitted · Verified · Retired · To Ade Foods, plus "₦X paid to Ade Foods". | Built and run end to end on the sandbox. |
| 5b | **Stock loan** from the Passport: `POST /loans/applications` → offer (rate, fee, amount received, credit score) → accept → disburse → `loan.disbursed` webhook. Shown on the dashboard and Passport. | **Works on the real sandbox.** |

Rules enforced in code: `Idempotency-Key` on every money-moving or record-creating POST; never resend after 504; always verify payments; fees read from responses; a client-side limiter keeps us under 50 bank calls a minute; synthetic data only. Browsers can only send stock and handover actions; payments, payouts and bank data are server-only.

**Live sandbox results (10 Nov):** checkout (merchant `mer_204`), hosted test-card payment, signed `payment.*` webhooks, verify, intra name enquiry, transfer and signed `transfer.successful` all pass end to end through the real UI. Fixes found on the live run: `merchant_id` required on checkout; account resolve needs `bank_code`; the return screen raced the server connection (fixed).

**Carbon registry, real flow (10 Nov, approach approved by the organisers):**
- Our app calculates tCO₂e with the VM0046 food-waste method. The app always shows the project as **"Food waste reduction (VM0046)"**, with the line "Sandbox registry · food-waste tonnes carried as solar-equivalent units". The "Simulated" label is gone.
- ONE registry project, registered once at the organisers' instruction: `type: solar_replacing_diesel`, methodology "VM0046 food loss and waste (carried via sandbox solar type)", owner payout `0123987005` at Zenith `000015` (name enquiry: AREWA SOLAR CO-OPERATIVE SOCIETY). It is shown as **"SecondShelf carbon pool (sandbox)"**: `prj_118`, pinned with `CARBON_PROJECT_ID` so a fresh pod never registers another.
- MRV: `metric: energy_generated_kwh`, `value = ceil(tCO₂e ÷ 0.00053)` (2.233 t → 4,214 kWh). `evidence_url = https://team19.xtradot.co/evidence/<id>`, a server-rendered page listing the batches, net weights, dry shares, transport, formula and result. The submission-to-batches mapping is stored in SQLite (`carbon_evidence`).
- Verification: auto-verify after 60 s. We see it via the `carbon.mrv.verified` webhook, plus a status poll; credits are whole and rounded down by the registry. Credits issued, the serial range and the batch id are shown.
- Sale: the buyer (Eko Green Offsets Ltd, synthetic) pays ₦25,000 per credit (`CARBON_PRICE_NGN`) via checkout to `mer_900`. We verify the payment, then call `POST /carbon/credits/retire` with that `payment_reference` (Idempotency-Key stored per sale). A `payment.successful` webhook does the same if the buyer never returns.
- Certificate: from `GET /carbon/certificates/{id}`.
- Registry payout to the pool (total − 2% fee) is confirmed by `transfer.successful`; a status check is the fallback.
- Only after that, Ade Foods' 60% of the pool payout goes from `0123456789` to `0123456790`: name enquiry → transfer, one per certificate, never resent on a timeout.
- Sandbox run: `mrv_553` → 2 credits `NG-AFF-2026-000003 to 000004` → sale `CC-MWB9GHV1F3C` ₦50,000 → `ret_209`, fee ₦1,000 → pool ₦49,000 (`TRF-20261110-208/209`) → ₦29,400 paid to BABATUNDE OLUMIDE ADEYEMI.

**Stock loan:** applicant `0123456790` with BVN `22200000002` and the Passport's `consent_id` (the spec documents only individual applicants; a corporate attempt returned `bvn is required`). Decision, credit score, rate, fee, amount received and repayment schedule are shown; the amount is capped at ₦950k (the bank refers anything above ₦1m); accept → disburse → `loan.disbursed`.

**Idempotency for record-creating calls** (carbon, loans): the key is stored before the call. After a timeout it's kept (a retry replays), after a definite 4xx rejection it's dropped so a corrected request isn't a 409.

**One demo trader (11 Nov):** Babatunde Olumide Adeyemi trading as **Ade Foods**, account `0123456790` (Xtradot, tier 3, phone `+2348051234502`). Order payouts and the carbon share land here, the Passport consent and statement read this account, and the loan applicant is this account (BVN `22200000002`). Payouts are funded from `0123456789`. No app screen mentions any other trader (checked by the end-to-end test).

**Passport consent (real, spec v2):** consent for `0123456790` with the holder phone from the spec's test data, scopes `accounts:read, balance:read, transactions:read`, October 2026 → OTP `123456` → statement with `consent_id` → `consent.authorised` webhook. Badge: "Bank-verified". "Stop sharing" revokes (`DELETE /open-banking/consents/{id}`).

**Checkout merchant:** buyers should pay Ade Foods' own merchant, but `POST /merchants/onboard` returns `404 "not available in the sandbox build yet"` (`req_6ad253ac`). Checkout therefore uses the sandbox's pre-provisioned merchant `mer_204`, whose name appears **on the bank's hosted checkout page only**. Options to remove it there: wait for onboarding, ask the organisers for an Ade Foods merchant, or take card details in-app via the spec's direct `POST /payments/{ref}/card` + `/otp` (new feature, not built).

The server logs every bank call as `[bank] METHOD /path -> status CODE field=… (request_id)`: never keys or request bodies.



## Apple-design skill: how each rule is applied

The skill file arrived after the first pass. It's saved locally at `.claude/skills/apple-design/SKILL.md` and deliberately not committed, because it contains words the no-AI-terms rule bans. The code was then checked against it section by section:

| Skill section | Where it lives |
| --- | --- |
| §1 Respond on pointer-down | Every button and row scales on press (`whileTap`), no 300 ms delay. |
| §2 1:1 tracking | Sheet drag keeps the grab offset; pointer capture; velocity read from the live value. |
| §3 Interruptible | Springs start from the on-screen value. A sheet that is closing can be grabbed and pulled back. Outgoing pages, sheets and the payment screen stop taking input the moment they start leaving, so the next tap always lands. |
| §4 Springs | Critically damped (`bounce 0`) by default. The bouncier sheet spring is used only after a drag or flick. The success check and scanner brackets no longer bounce. |
| §5 Velocity handoff | Release velocity goes straight into the sheet and pull-to-refresh springs. |
| §6 Momentum projection | Apple's `project()` (deceleration 0.998) decides whether a flick dismisses the sheet. |
| §7 Same path in and out | Sheets up/down, desktop panel right, pages forward/back mirrored, payment screen in and out the same side. |
| §9 Rubber-banding | Skill formula, at the top of the sheet and in pull to refresh. |
| §10 Tap and drag details | Tabs, sidebar and the segmented control highlight on press and commit on release, so you can drag away to cancel. Pull to refresh needs ~10 px of clearly vertical travel first. |
| §11 Compositor only | Row highlights fade an overlay instead of animating `background-color`. Height animations removed (the expired-date message is now the field's one-line error; the "waiting" line reserves its space). The sheet carries `will-change: transform`. |
| §12 Materials | Translucent top bar and tab bar. Hairlines appear only where content actually runs under them (scroll edge), not as permanent dividers. Desktop panel fades as it travels. |
| §13 Haptics | One tick, on the same frame as the visual, for scan, payment and handover only. |
| §14 Reduced motion, transparency, contrast | Sheets cross-fade with no travel, page slides become fades, looping hints stop. Solid bars under reduced transparency; stronger borders under more contrast. |
| §15 Typography | Size-specific tracking and leading. The type scale is now in `rem`, so it follows the phone's text-size setting. |
| §16 Agency | "Listed" toast has **Undo** (`unlistBatch`). Confirmation only for reset and donate. |

The skill also recommends the system font; the brief requires Poppins, so Poppins stays. The brief's sheet spring (bounce 0.15, 0.4 s) is kept rather than the skill's 0.8/0.3, since the brief set it explicitly.

## Decisions where the brief was open

- **Distributor home:** phones open on Stock; laptops open on Overview. Mobile has no Overview tab (the brief fixes four tabs), so the Passport tab also shows the Money and Carbon cards on phones.
- **Images:** the repo has no product photos. Product cards use crops of the existing warehouse and provisions photos (object-position plus a CSS scale; no filters, no recolouring). Login uses `secondshelf_market_woman` (person, real goods, centred subject).
- **Logo:** the shelfmark SVG is unchanged, including its original colours. The wordmark is now set in Poppins.
- **Delivery fee:** a flat ₦1,500 for the demo.
- **Fire-sale baseline:** 30% of normal price, the figure the old code used.
- **Transport in the carbon formula:** 0.25 kg CO₂e per km, light van, one way. `src/lib/carbon.ts`, tested in `carbon.test.ts`.
- **Food bank:** "Donate" appears in the last two weeks before expiry. The food bank confirms pickup from its own Pickups tab.
- **Commits** have no co-author trailer, per the "no mention of AI in commit messages" rule.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000, sync endpoint included
npm test             # carbon and expiry unit tests (node:test)
npm run lint         # tsc --noEmit
npm run build && npm start   # production: built app + sync endpoint on PORT (default 3000)
```

**Phones need HTTPS for the camera.** No deploy target is configured in this repo. Two options:
1. Deploy `npm run build && npm start` to any Node host that serves HTTPS (Render, Railway, Fly, Cloud Run).
2. Run it on the laptop and open a tunnel: `cloudflared tunnel --url http://localhost:3000`. Use the `https://…trycloudflare.com` link on all three devices.

All three devices must use **the same URL** so they share one demo database. Check Profile → Sync shows "Live across devices".

## Demo script

**The idea:** one carton, one continuous story, and every number on the projector moves because of something the judges just watched someone do. The laptop runs **Live** (projector view). Nothing on it is pre-recorded; it only shows what happened since the last reset.

| Device | Who | Signed in as | Screen |
| --- | --- | --- | --- |
| Laptop (projector) | Presenter | Distributor | **Live** |
| Phone 1 | Ade, the distributor | Distributor | **Stock** |
| Phone 2 | Mama Tolu, the buyer | Buyer | **Shop** |

**Before going on stage (2 minutes)**
1. Start the server and open the same HTTPS link on all three devices (see "Running it").
2. Any device → Profile → **Reset** (resets all three).
3. Laptop: sign in as Distributor → Overview → **Present live**. All three stages read "Waiting…".
4. Phone 2: sign in as Buyer → Shop.
5. Phone 1: sign in as Distributor. Open **Scan** once and tap **Allow camera**, then close it. *(Optional beat: on sign-in it shows an alert, "Instant noodles · 12 days left · ₦418,800 at risk". You can open with that: "the app tells Ade what to sell today.")*
6. Have the printed **Milk powder** barcode (`2006001000030`) stuck on a carton.

**1. Scan (Phone 1), about 30 s**
- Say: "Ade's warehouse in Mushin. A carton of milk powder comes in."
- Tap **Scan** and point at the carton. Brackets lock on, the phone ticks, and the sheet fills in "Milk powder, 12 × 380 g".
- Pick an expiry **4 weeks** out and tap **Save**.
- Phone 1: a banner drops in, "**Milk powder · 4 weeks left · ₦444,000 at risk · tap to list**". This is the six-week alert.
- Projector: **Scan** ticks and takes the amber "Now" highlight. **At risk** jumps with a "+₦444k" chip.

**2. Sell (Phone 1 → Phone 2), about 60 s**
- Phone 1: tap the banner. It opens straight into **List for sale** at the suggested 30%: ₦18,500 → **₦12,950**, "You recover ₦177,600 more than a fire sale". Tap **List now**: Saving → Notifying buyers nearby → Listed.
- Projector: **Sell** lights up; **At risk** drops with a "−₦444k" chip.
- Phone 2: a banner, "**New near you · Milk powder · ₦12,950 (was ₦18,500)**". Say: "Mama Tolu's canteen in Yaba, 6 km away, gets it right away."
- Phone 2: tap the banner → **Buy** (10 cartons, ₦129,500) → **Pay with Access Bank**: Connecting → Authorising → Confirmed. Receipt with QR code; the phone ticks.
- Phone 1: banner, "**Mama Tolu Canteen paid** · ₦129,500".
- Projector: Sell now shows the payment; Carbon reads **Estimate until handover**.

**3. Prove (both phones), about 30 s**
- Phone 1: tap the banner (or **Sales**) → **Confirm** → scan the QR code on Phone 2. "Handed over"; the phone ticks.
- Phone 2: the open order flips to **Handed over** by itself and ticks.
- Projector: **Prove** ticks. **Recovered** and **Passport · 90 days** show "+₦130k", **CO₂e avoided** shows "+0.09 t" and returns to **Verified**. The record lists all four steps.
- Close: "Every sale before expiry becomes verified trading history, a Business Passport Ade can take to Access Bank." Optional: Laptop → exit Live → **Passport** → **Share with bank** → Share.

**If something goes wrong**
- A banner was missed: banners stay 6 s and can be flicked up. Everything is also on **Stock** (the amber "At risk" card → **List**), **Shop**, and **Sales**.
- Camera won't focus: tap **Enter code** and type `2006001000030` (or the `SS-…` order code for the handover).
- Listed the wrong thing: tap **Undo** on the "Listed" toast.
- A device isn't updating: check Profile → Sync says "Live across devices". Reload; the session stays signed in.
- Start over: Profile → **Reset** on any device. The projector goes back to "Waiting…".

## Checks run

- `npm run lint`: clean. `npm test`: 13/13 pass. `npm run build`: clean.
- Playwright drove every flow at 375 px and 1440 px (plus 768 and 1280), including the two-device handover. Zero console errors, no horizontal scroll. Screenshots are in `/screenshots`.
- The AI-terms grep from the brief returns nothing outside `AUDIT.md`, which lists the old findings.
- All five printed barcodes decode correctly with ZXing (the app's fallback decoder).
- **Lighthouse (mobile, local production build):** Accessibility **100**, Best Practices **100**, Performance **56–68** over four runs. **This misses the 85 target.**
  - LCP 2.8–3.6 s, CLS 0.001.
  - Most of the blocking time is first-launch style/layout in a fresh headless Chrome on this Windows machine. It measured 2–3 s in Lighthouse but 20–40 ms on repeat cold launches, so it's the machine warming up, not the page. Script evaluation is a steady ~470 ms.
  - Already done: non-blocking fonts, preloaded sign-in photo, WebP at 640/960/1280, screens split per role, QR and barcode libraries loaded on demand.
  - Next steps if the score must be higher: re-measure on the deployed HTTPS build with PageSpeed Insights, serve with gzip/brotli (most hosts and Cloudflare tunnels do this; `server.ts` doesn't), and move to `LazyMotion` to cut ~100 KB of animation code from first load.
