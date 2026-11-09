# SecondShelf redesign: changes and demo script

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
- **Docs:** `AUDIT.md`, `DEMO.md` (printable barcodes), this file.

**Words:** about 2,700 words of interface copy before, under 650 now (−76%). No paragraphs; the longest line is an empty-state hint.

## Why, briefly

- **Calm and fast:** one primary action per screen, numbers before words, sheets for short tasks.
- **Fluid:** every touchable thing responds on pointer-down and uses springs that start from the current value. The bottom sheet tracks the finger, rubber-bands past the top, projects the flick, and hands release velocity to the spring. The same sheet becomes a right-side panel on desktop.
- **Visible process:** listing, payment, handover and bank sharing show their steps. Waits are 0.5–1.2 s per stage, never a silent spinner.
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
| Passport sharing | adapter `sharePassport` | Records consent and time; nothing leaves the app. |
| Seed data | `src/lib/mock/seed.ts` | Built relative to today, so badges are always right. Ade Foods (Mushin), Mama Tolu Canteen (Yaba), Lagos Food Bank Initiative (partner example), 90 days of history. |

To connect a real backend, write an adapter implementing `SecondShelfApi` and return it from `src/lib/api/index.ts` when `VITE_DEMO_MODE=false`. No screen changes needed.

## Decisions where the brief was open

- **The apple-design skill file** (`.claude/skills/apple-design/SKILL.md`) isn't in the repo. I followed the rules written in the brief.
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

**Before going on stage**
1. Start the server (above) and open the HTTPS link on all three devices.
2. Phone 2 → Profile → **Reset** (resets all devices).
3. **Laptop** (projector): sign in as **Distributor** → **Overview**. Check the badge top-right says **Live**.
4. **Phone 1:** sign in as **Distributor** → **Stock**. Open **Scan** once and tap **Allow camera** so the prompt doesn't appear on stage. Close it.
5. **Phone 2:** sign in as **Buyer** → **Shop**.
6. Have the printed **Milk powder** barcode (`2006001000030`) on a carton.

**1. Scan (Phone 1)**
1. Tap **Scan** (centre tab). Point at the Milk powder carton. The brackets snap to the code, the phone ticks, the frame freezes.
2. The sheet shows "Finding product…", then fills in. Pick an expiry about **4 weeks** out, type a batch number, hold **+** to show the stepper accelerating.
3. *Optional:* pick yesterday's date to show "Expired items can't be added." Then fix it.
4. Tap **Save**. The sheet drops away and the new batch slides into **Expiring soon**, flashing mint.
   *Laptop:* "Added Milk powder" appears in Recent activity.

**2. List (Phone 1)**
1. Tap **Cream crackers** (5 weeks left) → **List for sale**.
2. Drag the slider to **25%**: "₦2,600 → ₦1,950", and the line underneath shows how much more than a fire sale.
3. Tap **List now**: Saving → Notifying buyers nearby → Listed. The row moves into **Listed**.
   *Phone 2:* Cream crackers appears in Shop within 2 seconds (or pull down to refresh).
4. *Phone 1:* open the **Sales** tab and leave it there.

**3. Buy and pay (Phone 2)**
1. Tap **Cream crackers**. The photo grows into the header.
2. Set **10** cartons; the total springs to ₦19,500. Tap **Buy** → **Pickup** → **Pay with Access Bank**.
3. Connecting to Access Bank → Authorising payment → Confirmed. The check draws on, the phone ticks, and the QR shows with ref `SS-2xxxx`.
   *Phone 1 (on Sales):* "New order · ₦19,500" and the order slides into **Waiting for handover**.
   *Laptop:* Money shows "+₦19,500 waiting"; Carbon switches to **Estimate**; activity shows "Mama Tolu Canteen paid".
4. Tap **Done** to show the order with its QR.

**4. Handover (both phones)**
1. *Phone 1:* **Sales** → **Confirm** → scan the QR on Phone 2. "Handed over" with the amount; Phone 1 ticks.
2. *Phone 2:* the open order flips to **Handed over** by itself and ticks.
3. *Laptop:* **Recovered** and **CO₂e avoided** count up; Carbon returns to **Verified**.

**5. Proof (Laptop)**
1. **Passport**: verified sales (90 days), sell-through, orders, repeat buyers, food rescued, and the full record.
2. **Share with bank** → "Share with Access Bank?" → **Share** → Shared.

**If something goes wrong**
- Camera won't focus: tap **Enter code** and type `2006001000030` (or the order code `SS-…` for the handover).
- A phone isn't updating: check Profile → Sync. Reload the page; the session stays signed in.
- Start over: Profile → **Reset**, on any device.

## Checks run

- `npm run lint`: clean. `npm test`: 13/13 pass. `npm run build`: clean.
- Playwright drove every flow at 375 px and 1440 px (plus 768 and 1280), including the two-device handover. Zero console errors, no horizontal scroll. Screenshots are in `/screenshots`.
- The AI-terms grep from the brief returns nothing outside `AUDIT.md`, which lists the old findings.
