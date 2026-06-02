# ShoppingMole — Thailand E-commerce API Integration

> Work on this AFTER localisation (TODO4) is complete.

## What the user needs to arrange

| Platform | Registration | Notes |
|---|---|---|
| **Shopee Affiliate API** | https://affiliate.shopee.co.th/ | Apply for affiliate program. 5-10% commission. |
| **Lazada Open Platform** | https://open.lazada.com/ | OAuth 2.0. Developer portal. |
| **RapidAPI (interim)** | https://rapidapi.com/search/Shopee | Unofficial endpoints while official access is pending. |

New env vars: `SHOPEE_PARTNER_ID` + `SHOPEE_PARTNER_KEY`, `LAZADA_APP_KEY` + `LAZADA_APP_SECRET`.

## Tasks

### 1. ShopeeProvider
File: `packages/shared/src/providers/shopping/shopee.ts`
- Base: `https://partner.shopeemobile.com/api/v2/`
- Auth: HMAC-SHA256 signature (partner_id + timestamp + path)
- Search: `GET /product/search_item?keyword=...&page_size=20`
- Normalize to `Product` DTO
- Gate: `process.env.SHOPEE_PARTNER_KEY` + SEA countries

### 2. LazadaProvider
File: `packages/shared/src/providers/shopping/lazada.ts`
- Base: `https://api.lazada.co.th/rest`
- Auth: HMAC-SHA256 signature (app_key + timestamp)
- Search: `GET /products/search?q=...&limit=20&offset=0`

### 3. ShoppingLoadingOverlay
Add Shopee/Lazada branding (orange/blue) to loading states.

### 4. Sync packages/shared after changes
Copy to: flight-booking, hotel-booking, news-feed, rent-a-car, main-website, games.
