# ShoppingMole — TODO4: Region-Specific APIs (Thailand/SEA + Brazil)

## Permissions
Ask the user to enable bypass permissions before starting: `claude --dangerously-skip-permissions`.

## Please fill in Reports4.md when done.

## Overview
When a user is in Thailand (or SEA broadly), ShoppingMole should show results from Shopee and Lazada — the dominant platforms — alongside Google Shopping. This requires the user to register for API access (see below).

---

## What the user needs to arrange first

| Platform | Registration | Notes |
|---|---|---|
| **Shopee Affiliate API** | https://affiliate.shopee.co.th/ or Shopee Open Platform | API for product search + affiliate links. Requires seller/affiliate account. |
| **Lazada Open Platform** | https://open.lazada.com/ | OAuth 2.0. Register as developer. Separate from seller account. |
| **RapidAPI — Shopee/Lazada** | https://rapidapi.com/search/Shopee | Unofficial endpoints may work while official access is pending — check availability. |

New env vars to add to Vercel (shopping project) once keys are obtained:
- `SHOPEE_PARTNER_ID` + `SHOPEE_PARTNER_KEY` (Shopee Open Platform)
- `LAZADA_APP_KEY` + `LAZADA_APP_SECRET` (Lazada Open Platform)

---

## Architecture
The existing `ProviderRouter` and `Product` DTO handle multi-provider already. Just add two new providers behind country-gated env vars.

Country gating logic in `packages/shared/src/providers/shopping/index.ts`:
```ts
if (country === "TH" || country === "MY" || country === "SG" || country === "ID" || country === "PH" || country === "VN") {
  if (process.env.SHOPEE_PARTNER_KEY) providers.push(new ShopeeProvider(...));
  if (process.env.LAZADA_APP_KEY) providers.push(new LazadaProvider(...));
}
```

---

## Tasks

### 1. ShopeeProvider
File: `packages/shared/src/providers/shopping/shopee.ts`

Shopee Product Search API (Open Platform):
- Base URL: `https://partner.shopeemobile.com/api/v2/`
- Auth: HMAC-SHA256 signature per request (partner_id + timestamp + path)
- Search endpoint: `GET /product/search_item?keyword=...&page_size=20&page_no=0&shop_id=...` OR use the affiliate API for product links
- Response fields: `item_id`, `name`, `price` (in cents), `image`, `stock`, `item_url`
- Normalize to `Product` DTO: price / 100 for THB amount, `link` = `https://shopee.co.th/product/{shop_id}/{item_id}`

If official API access is complex/delayed, check RapidAPI for a Shopee search endpoint as interim.

### 2. LazadaProvider
File: `packages/shared/src/providers/shopping/lazada.ts`

Lazada Open Platform:
- Base URL: `https://api.lazada.co.th/rest`
- Auth: HMAC-SHA256 signature (app_key + timestamp + method + params)
- Search endpoint: `GET /products/search?q=...&limit=20&offset=0`
- Response fields: `name`, `price`, `original_price`, `sale_price`, `image`, `product_url`, `review_count`, `rating_score`
- Normalize to `Product` DTO

### 3. Register providers in router
Update `packages/shared/src/providers/shopping/index.ts`:
- Accept `country` param in `createShoppingRouter(country)`
- Gate Shopee + Lazada on SEA countries (TH, MY, SG, ID, PH, VN)
- Update `shopping/src/app/api/products/route.ts` to pass country from `detectCountry(headers)`

### 4. Loading overlay labels
Add to `ShoppingLoadingOverlay` provider name map:
- `"Shopee"` → show Shopee branding (orange)
- `"Lazada"` → show Lazada branding (blue)

### 5. "Buy on Shopee / Buy on Lazada" buttons
Product cards already use `offer.retailer` for button labels — ensure each `Product` from Shopee/Lazada sets `source: "Shopee"` / `source: "Lazada"` and `link` is the direct product URL.

### 6. Sync packages/shared to other apps after changes
After editing `packages/shared/src/providers/shopping/`, sync to: flight-booking, hotel-booking, news-feed, rent-a-car, main-website, games.
**Important:** Do NOT overwrite `shopping/packages/shared/` from the root `shared/` — the shopping app's bundled copy is authoritative for this app.

---

## Brazil Region (country === "BR")

### What the user needs to arrange

| Platform | Registration | Notes |
|---|---|---|
| **Mercado Livre API** | https://developers.mercadolivre.com.br | **Free, public REST API — no approval needed.** Register app, get client credentials immediately. Best opportunity here. |
| **Shopee Brasil Affiliate** | https://affiliate.shopee.com.br/open_api | Same Shopee Open API as Thailand but Brazilian endpoint. Apply separately. |
| **Magalu Developer API** | https://developers.magalu.com/ | Partner-level, contact parceiros@magalu.com. Covers Magalu + Netshoes + Kabum under one auth. |

New env vars for Vercel (shopping project):
- `MERCADOLIVRE_APP_ID` + `MERCADOLIVRE_CLIENT_SECRET`
- `MAGALU_API_KEY` (once partner access granted)
- Shopee Brasil uses same `SHOPEE_PARTNER_KEY` if unified, or a separate Brazilian key

### MercadoLivreProvider (implement first — easiest, free)
File: `packages/shared/src/providers/shopping/mercadolivre.ts`

Mercado Livre Product Search API:
- Base URL: `https://api.mercadolibre.com`
- Auth: OAuth 2.0 — get `access_token` via `POST /oauth/token` with client_credentials
- Search: `GET /sites/MLB/search?q={query}&limit=20` (MLB = Brazil site ID)
- Response fields: `title`, `price`, `currency_id`, `thumbnail`, `permalink`, `condition`, `seller.nickname`, `original_price`, `reviews.rating_average`, `reviews.total`
- Normalize to `Product` DTO — price is already in BRL
- Booking link = `permalink` (direct Mercado Livre product page)
- No affiliate commission (this is a direct API, not affiliate) — revenue via AdSense
- Gate on `country === "BR"` or `country === "AR"` (also works for Argentina, Mexico MX, etc.)

### MagaluProvider
File: `packages/shared/src/providers/shopping/magalu.ts`
- Implement once partner credentials are obtained
- Covers Magalu + Netshoes (sports) + Kabum (electronics) under one integration
- Gate on `country === "BR"`

### Country routing update
Update `packages/shared/src/providers/shopping/index.ts`:
```ts
if (country === "BR" || country === "AR" || country === "MX" || country === "CO" || country === "CL") {
  if (process.env.MERCADOLIVRE_APP_ID) providers.push(new MercadoLivreProvider(...));
  if (process.env.MAGALU_API_KEY) providers.push(new MagaluProvider(...));
  if (process.env.SHOPEE_PARTNER_KEY) providers.push(new ShopeeProvider(...)); // Shopee is growing in BR too
}
```
