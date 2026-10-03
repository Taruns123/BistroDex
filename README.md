# BistroDex

A desktop point-of-sale for small Indian restaurants and cafés, built with Electron, React and TypeScript.

- **Today**: net sales, orders and covers, average ticket, sales by hour, payment mix (UPI / card / cash), top sellers, tables that need attention, and ingredients running low.
- **Order**: a touch-first register. Menu grid by category with veg / non-veg / egg marks, bestseller and sold-out states, and a running order per table with qty steppers. New items are kept apart from items already sent to the kitchen (KOT). Totals include discount, CGST 2.5% + SGST 2.5%, and round-off.
- **Settle**: UPI QR, card (EDC) or cash with change due. The table closes and a GST tax invoice is generated.
- **Floor**: live table map by area (Indoor, Terrace, Takeaway) with status, covers, time seated and running amount, plus a steward-wise view.
- **Bills**: the day's invoices, filterable by payment mode, with a thermal-style receipt preview.
- **Stock**: ingredient levels against par and reorder points, with critical and low flags, suppliers, and one-tap reorder quantities.

## Running it

```bash
yarn            # install
yarn dev        # Electron app (data in ~/BistroDex/bistrodex.json via IPC)
yarn dev:web    # renderer only, in the browser, on built-in demo data -> http://localhost:5303
```

### Demo mode

The renderer talks to one interface, `BistroApi` (`src/shared/types.ts`). `src/renderer/src/api/index.ts` picks the implementation:

- **Electron**: `window.context`, exposed by the preload script. Each call is an IPC channel handled in `src/main/lib/pos.ts`.
- **Demo**: `src/renderer/src/api/demo.ts`, an in-memory dataset for a Mumbai café on a busy weeknight. The clock is pinned to 8:45 PM. Demo mode is used when `VITE_DEMO=1` or when no Electron bridge is present. Orders and settlements work but are not persisted.

## Build

```bash
yarn build:mac | build:win | build:linux   # desktop installers
yarn build:web                             # static demo build in out/web
```
