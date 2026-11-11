# Demo barcodes

Print these and stick them on cartons. They use the `200` in-store prefix, so they never clash with real products.

| Product | Pack | Barcode | Print file |
| --- | --- | --- | --- |
| **Milk powder** | 12 × 380 g, ₦18,500 | `2006001000030` | [docs/barcodes/milk-powder.svg](docs/barcodes/milk-powder.svg) |
| Cream crackers | 12 × 300 g, ₦2,600 | `2006001000016` | [docs/barcodes/cream-crackers.svg](docs/barcodes/cream-crackers.svg) |
| Instant noodles | 40 × 70 g, ₦9,800 | `2006001000023` | [docs/barcodes/instant-noodles.svg](docs/barcodes/instant-noodles.svg) |
| Digestive biscuits | 24 × 200 g, ₦7,200 | `2006001000047` | [docs/barcodes/digestive-biscuits.svg](docs/barcodes/digestive-biscuits.svg) |
| Fruit drink | 12 × 1 L, ₦8,400 | `2006001000054` | [docs/barcodes/fruit-drink.svg](docs/barcodes/fruit-drink.svg) |
| Granulated sugar | 50 × 500 g, ₦42,000 | `2006001000061` | regenerate (below) |
| Long-grain rice | 10 × 2.5 kg, ₦48,000 | `2006001000078` | regenerate |
| Spaghetti | 20 × 500 g, ₦15,600 | `2006001000085` | regenerate |
| Vegetable oil | 4 × 5 L, ₦52,000 | `2006001000092` | regenerate |
| Wheat flour | 10 × 2 kg, ₦21,500 | `2006001000108` | regenerate |

**Scan milk powder (`2006001000030`) on stage** with an expiry about 4 weeks out. The whole story runs on that one carton.

- Print at 100%, at least 4 cm wide, on matte paper.
- Camera struggling? Tap **Enter code** and type the 13 digits.
- Regenerate the SVGs with `node scripts/barcodes.mjs`.

# Demo script (v2, real sandbox)

One trader: **Babatunde Olumide Adeyemi trading as Ade Foods**, Xtradot account `0123456790`. One buyer: **Mama Tolu Canteen**.

**Devices**

| Device | Signed in as | Opens |
| --- | --- | --- |
| Phone 1 | Distributor (Ade Foods) | Home |
| Phone 2 | Buyer (Mama Tolu Canteen) | Home |
| Laptop on the projector | Distributor | Sidebar → **Live board** (`/#/live`) |

**Before you start:** Phone 1 → avatar → **Reset**. Every device goes back to five batches: noodles (9 days left, the "Next action"), sugar (not listed), digestive biscuits (listed), rice (in stock), flour (expired). The Live board shows the noodles journey and this month's figures.

| # | Who taps what | What the Live board shows |
| --- | --- | --- |
| 1 | **Phone 1:** Scan → **Enter code** → `2006001000030` → **Find** → expiry 4 weeks out → **Save**. Lands on the Milk powder journey: "Scanned" done, **List it** lit. | Milk powder becomes "Now". "Added Milk powder" tops the stream. |
| 2 | **Phone 1:** **List it** → slide the discount (live price and "You recover") → **List now**. Back on the journey, "Listed" done. **Phone 2** gets "New near you · Milk powder". | "Listed" lights up. "Listed Milk powder" in the stream. |
| 3 | **Phone 2:** tap the notice → **Buy** → **Pay with bank** → on the bank page **Pay with test card**. Returns: "Confirming with bank", then **Paid** with a QR code. "Paid" never shows before the bank confirms it. | "Sold" and "Paid" light up with the amount. "Mama Tolu Canteen paid ₦…". **Recovered this month** counts up. |
| 4 | **Phone 1:** "Mama Tolu Canteen paid" notice → Sales → **Hand over** → scan Phone 2's QR (or **Enter code** `SS-…`) → "Handed over" → **Next: pay out** → the bank-resolved name BABATUNDE OLUMIDE ADEYEMI in large type → **Pay out ₦…** → "Sent" with reference and fees from the bank. **Phone 2** flips to Collected. | "Handed over" and "Paid out" light up. **Paid out to Ade Foods** counts up. **Carbon avoided** grows. |
| 5 | **Phone 1:** Home → Passport card → **Share with bank** → read what's shared → **Share** → type `123456` in the six boxes (it authorises on the last digit) → **Bank-verified**. | "Passport shared with the bank". |
| 6 | **Phone 1:** **See loan offer** → **Check my offer** → "Checking your record → Scoring → Offer ready": amount, rate, fee, total, score dial, schedule → **Accept** → **Funds sent**. | "Stock loan disbursed ₦…". **Passport score** shows the bank's credit score. |
| 7 | **Phone 1:** Home → Carbon card → **Submit MRV** (about 2.3 t CO₂e sent as solar-equivalent kWh, with an **Evidence** link). About a minute later the registry auto-verifies: credits and serial range. **Sell 2 credits · ₦50,000** → on the bank page **Pay with test card** → back: "Retired", then "Registry paid the pool" (₦49,000 after the 2% fee, by webhook) → **Pay Ade Foods ₦29,400** → **Pay out** → **See certificate**. | Milk powder's "Carbon" step lights up "Retired · NG-AFF-…". Stream: MRV submitted, Credits issued, Credits retired, Registry paid the pool, Carbon share paid. |

**Closing shot:** the laptop's Live board with the Milk powder journey fully lit, and Phone 1's Home: "Recovered this month", "Sold before expiry", "Carbon avoided", the Passport card "Bank-verified" with the score, and the Carbon card at "Paid".

Everything runs on the real sandbox: checkout and verify, payout, consent and statement, loan, and the carbon registry. In the app the carbon project shows as "Food waste reduction (VM0046)". The registry carries it as the solar-type pool "SecondShelf carbon pool (sandbox)" (`prj_118`), as the organisers instructed. The bank's hosted checkout page names the sandbox merchant (see CHANGES.md).

**Rollback:** the previous interface is tagged `v1-backup` (`838ab4f`); see DEPLOY.md.
