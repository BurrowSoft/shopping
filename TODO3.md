# ShoppingMole — TODO3: Thai Localisation + Language Selector

## Permissions
Ask the user to enable bypass permissions before starting: `claude --dangerously-skip-permissions`.

## Please fill in Reports3.md when done.

## Overview
When a user visits from Thailand (`x-vercel-ip-country: TH`), the app defaults to Thai. Thailand has a large e-commerce market (Lazada, Shopee dominant). All users get a language selector (EN / TH) in the header.

## Architecture: `next-intl` with cookie-based locale (no URL changes)
- Install `next-intl`
- Messages: `src/messages/en.json` and `src/messages/th.json`
- Locale in `NEXT_LOCALE` cookie
- Locale detection: cookie → `detectCountry()` → TH defaults to `th`, else `en`

## Tasks

### 1. Install and configure next-intl
```bash
npm install next-intl
```
- `src/i18n.ts`, `src/middleware.ts`, wrap layout with `NextIntlClientProvider`

### 2. Translation files

**`src/messages/en.json`**
```json
{
  "nav": { "home": "ShoppingMole", "search": "Search Products" },
  "hero": { "title": "Compare Products. Find the Best Price.", "subtitle": "Search across Google Shopping and top retailers." },
  "search": {
    "placeholder": "Search for products…",
    "button": "Search",
    "trending": "Trending searches"
  },
  "results": {
    "found": "{count} products found",
    "noneFound": "No products found.",
    "bestPrice": "Best price",
    "buyOn": "Buy on {retailer}",
    "loading": "Loading products from {provider}…",
    "unavailable": "{provider} unavailable",
    "priceComparison": "Price comparison",
    "delivery": "Delivery",
    "condition": "Condition",
    "rating": "{rating} out of 5",
    "reviews": "{count} reviews",
    "aiSummary": "AI Buying Guide"
  },
  "footer": { "tagline": "Digging deep. Building solutions." }
}
```

**`src/messages/th.json`**
```json
{
  "nav": { "home": "ShoppingMole", "search": "ค้นหาสินค้า" },
  "hero": { "title": "เปรียบเทียบสินค้า ราคาดีที่สุด", "subtitle": "ค้นหาจาก Google Shopping และร้านค้าชั้นนำ" },
  "search": {
    "placeholder": "ค้นหาสินค้า…",
    "button": "ค้นหา",
    "trending": "ค้นหายอดนิยม"
  },
  "results": {
    "found": "พบสินค้า {count} รายการ",
    "noneFound": "ไม่พบสินค้า",
    "bestPrice": "ราคาดีที่สุด",
    "buyOn": "ซื้อที่ {retailer}",
    "loading": "กำลังโหลดสินค้าจาก {provider}…",
    "unavailable": "{provider} ไม่พร้อมใช้งาน",
    "priceComparison": "เปรียบเทียบราคา",
    "delivery": "การจัดส่ง",
    "condition": "สภาพสินค้า",
    "rating": "{rating} จาก 5",
    "reviews": "{count} รีวิว",
    "aiSummary": "คู่มือซื้อโดย AI"
  },
  "footer": { "tagline": "ค้นหาลึก สร้างสรรค์โซลูชัน" }
}
```

### 3. Language selector
`src/components/LanguageSelector.tsx` — 🇬🇧 EN / 🇹🇭 TH, sets cookie + `router.refresh()`.

### 4. Replace hardcoded strings
Priority: `layout.tsx`, `SearchBar.tsx` (or equivalent), `ProductResults.tsx`, `ProductCard.tsx`, `ShoppingLoadingOverlay.tsx`, `PriceCompareTable.tsx` (or `AISummaryCard`).

### 5. Thai font
```tsx
import { Sarabun } from "next/font/google";
const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400", "600", "700"] });
```

### 6. Currency
`getCurrencyForCountry("TH")` returns `"THB"`. When locale is `th`, pass `currency: "THB"` into `ShoppingSearchParams` so providers can filter/sort by THB prices where supported.
