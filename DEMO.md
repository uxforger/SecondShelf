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
