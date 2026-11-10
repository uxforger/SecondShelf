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

One trader throughout: **Babatunde Olumide Adeyemi trading as Ade Foods**, Xtradot account `0123456790`.

Open the same link on both phones and the laptop. Before the demo: Profile → **Reset** on any device.

**Phone 1 (Distributor) · Phone 2 (Buyer) · Laptop (Distributor → Overview → Present live)**

1. **Scan** (Phone 1): Scan → Enter code `2006001000030` → expiry 4 weeks out → **Save**. The "Milk powder · 4 weeks left" alert drops in.
2. **List** (Phone 1): tap the alert → **List now**. *Phone 2* gets "New near you · Milk powder".
3. **Pay** (Phone 2): tap the banner → **Buy** → **Pay with bank** → on the bank page **Pay with test card**. Back on "Paid!" with a QR code.
4. **Handover** (Phone 1): Sales → **Confirm** → scan Phone 2's QR (or Enter code `SS-…`) → "Handed over" → **Pay out** to BABATUNDE OLUMIDE ADEYEMI ···0790. *Phone 2* flips to Handed over.
5. **Share Passport** (Phone 1, real bank): Passport → **Share with bank** → **Share** → code `123456` → **Authorise**. "Bank statement · Bank-verified" for ···0790. "Stop sharing" revokes it.
6. **Stock loan** (Phone 1, real bank): Passport → **Get stock loan** → **Apply** → decision, credit score, rate, fee, schedule → **Accept** → "Funds sent" to ···0790.
7. **Carbon** (Phone 1, labelled *Simulated registry*): Passport → **Open carbon**
   - **Submit MRV**
   - **Approve as verifier**
   - **Retire** → certificate
   - **Pay out** the share to ···0790

Real sandbox: payment, payout, Passport consent and statement, loan, carbon share transfer. Simulated and labelled: carbon registry records. The bank's hosted checkout page still names the sandbox merchant (see CHANGES.md).
