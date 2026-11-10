# Demo barcodes

Print these and stick them on real cartons. They use the `200` in-store prefix, so they never clash with real products, and they always resolve in demo mode.

| Product | Pack | Barcode | Print file |
| --- | --- | --- | --- |
| **Cream crackers** | 12 × 300 g, ₦2,600 | `2006001000016` | [docs/barcodes/cream-crackers.svg](docs/barcodes/cream-crackers.svg) |
| **Instant noodles** | 40 × 70 g, ₦9,800 | `2006001000023` | [docs/barcodes/instant-noodles.svg](docs/barcodes/instant-noodles.svg) |
| **Milk powder** | 12 × 380 g, ₦18,500 | `2006001000030` | [docs/barcodes/milk-powder.svg](docs/barcodes/milk-powder.svg) |
| Digestive biscuits | 24 × 200 g, ₦7,200 | `2006001000047` | [docs/barcodes/digestive-biscuits.svg](docs/barcodes/digestive-biscuits.svg) |
| Fruit drink | 12 × 1 L, ₦8,400 | `2006001000054` | [docs/barcodes/fruit-drink.svg](docs/barcodes/fruit-drink.svg) |

**Milk powder (`2006001000030`) is the one to scan on stage.** Give it an expiry about 4 weeks out: that puts it inside the six-week window, so the alert fires straight away and the whole story (scan → list → buy → handover) runs on that one carton. The other codes are spares.

Printing tips:
- Print at 100% scale, at least 4 cm wide. Matte paper scans better than glossy.
- Any other EAN-13 opens the "New product" form, which also works on stage.
- If the camera struggles (glare, low light), tap **Enter code** and type the 13 digits. Same result.

Regenerate the SVGs with `node scripts/barcodes.mjs`.

# Phone test script (sandbox build)

Open the same link on both phones and the laptop. Before the demo: Profile → **Reset** on any device.

**Phone 1 (Distributor) · Phone 2 (Buyer) · Laptop (Distributor → Overview → Present live)**

1. **Scan** (Phone 1): Scan → Enter code `2006001000030` → expiry 4 weeks out → **Save**. The "Milk powder · 4 weeks left" alert drops in.
2. **List** (Phone 1): tap the alert → **List now**. *Phone 2* gets "New near you · Milk powder".
3. **Pay** (Phone 2): tap the banner → **Buy** → **Pay with bank** → on the bank page tap **Pay with test card**. You land back on "Paid!" with a QR code. *(If the URL still shows a Cloudflare login first, sign in and you'll return to the verify screen.)*
4. **Handover** (Phone 1): Sales → **Confirm** → scan Phone 2's QR (or Enter code `SS-…`) → "Handed over" → **Pay out**. *Phone 2* flips to Handed over.
5. **Carbon** (Phone 1): Passport → **Open carbon** (laptop: sidebar → Carbon)
   - **Submit MRV** → "Under review"
   - **Approve as verifier** (sandbox) → Verified
   - **Retire** → certificate opens → **Done**
   - **Pay out** the 60% share → "Carbon share paid"
   - The dashboard's Carbon registry card shows Submitted · Verified · Retired · Paid out.
6. **Stock loan** (Phone 1): Passport → **Get stock loan** → **Apply** → offer (rate, fee, what you receive, credit score) → **Accept** → "Funds sent".
7. **Passport** (Phone 1): **Share with bank** → **Share** → code `123456` → **Authorise** (simulated until we have the holder phone).

Real sandbox: payment, payout, carbon share transfer, loan. Simulated and labelled: carbon registry records, Passport consent.
