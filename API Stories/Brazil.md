# ShoppingMole — Brazil E-commerce API Integration

> Work on this AFTER localisation (TODO4) is complete.

## What the user needs to arrange

| Platform | Registration | Notes |
|---|---|---|
| **Mercado Livre API** | https://developers.mercadolivre.com.br | **Free, public REST API — no approval needed.** Register app immediately. |
| **Magalu Developer API** | https://developers.magalu.com/ | Partner-level. Contact parceiros@magalu.com. Covers Magalu + Netshoes + Kabum. |
| **Shopee Brasil** | https://affiliate.shopee.com.br/open_api | Same as Thailand. Brazilian endpoint + affiliate program. |

New env vars: `MERCADOLIVRE_APP_ID` + `MERCADOLIVRE_CLIENT_SECRET`, `MAGALU_API_KEY`.

## Tasks

### 1. MercadoLivreProvider (implement first — easiest)
File: `packages/shared/src/providers/shopping/mercadolivre.ts`
- Base: `https://api.mercadolibre.com`
- Auth: OAuth 2.0 (client_credentials)
- Search: `GET /sites/MLB/search?q={query}&limit=20` (MLB = Brazil)
- Price already in BRL
- Gate: `process.env.MERCADOLIVRE_APP_ID` + BR countries

### 2. MagaluProvider
File: `packages/shared/src/providers/shopping/magalu.ts`
- Implement once partner credentials obtained
- Covers Magalu + Netshoes + Kabum under one auth

### 3. Country routing for Brazil
```ts
if (country === "BR" || in LATAM countries) {
  if (MERCADOLIVRE_APP_ID) providers.push(new MercadoLivreProvider(...));
  if (MAGALU_API_KEY) providers.push(new MagaluProvider(...));
  if (SHOPEE_PARTNER_KEY) providers.push(new ShopeeProvider(...));
}
```
