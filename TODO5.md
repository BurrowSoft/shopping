# ShoppingMole — TODO5: Fix Floating Ad Bug + Adopt Shared RegionalFloatingAd

## Permissions
Ask the user to enable bypass permissions before starting: `claude --dangerously-skip-permissions`.

## Please fill in Reports5.md when done.

## Critical bug from TODO4
`src/components/LazadaFloatingAd.tsx` is missing the locale check — it shows the Lazada ad to ALL users regardless of language. This must be fixed.

## Replace with shared RegionalFloatingAd
Delete `src/components/LazadaFloatingAd.tsx`.

In `src/app/layout.tsx`:
```tsx
import { RegionalFloatingAd } from "@burrowsoft/shared";
<RegionalFloatingAd />
```

The shared version only renders when locale matches an entry in REGIONAL_ADS.

## Verify end-to-end
- EN: **no floating ad shown** (verify the previous bug is fixed)
- TH: Lazada ad appears, dismissible
- Language dropdown works

## Commit and push + fill Reports5.md