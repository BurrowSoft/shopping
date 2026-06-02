# ShoppingMole — API Integration TODO

## Permissions
Before starting work, ask the user to enable bypass permissions so you don't get approval prompts on every file operation. They can do this by opening Claude Code settings and setting permission mode to "bypass", or by launching with `claude --dangerously-skip-permissions`.

## Available API Keys
- `SERPAPI_KEY` — Google Shopping via SerpAPI (wired in shared lib, set in `.env.local`)
- `OPENAI_API_KEY` — AI summaries
- Note: `SERPAPI_KEY` is NOT yet visible in the Vercel project env vars screenshot. Add it to Vercel before deploying.

## Architecture: Client-Driven Fetching
All search calls must go through a Next.js API route (`/api/products`) rather than directly in server components. This enables the client to drive the loading overlay.

Pattern:
1. User submits search → client calls `/api/products?q=...`
2. API route fans out to all providers concurrently via `ProviderRouter`
3. Client shows the loading overlay per provider
4. Results return as JSON; client renders them

Wrap every provider call with `unstable_cache` from `next/cache` (TTL: 5 min / `revalidate: 300`). Cache key = query + country. This keeps SerpAPI quota usage low — repeated searches for the same term share one cached result.

## Current State
- SerpAPI provider is fully implemented in `packages/shared/src/providers/shopping/`
- `createShoppingRouter()` and `createShoppingProvider()` are exported from `@burrowsoft/shared`
- Search page and product detail page import these and call them server-side
- `packages/shared/` is now bundled at `shopping/packages/shared/` (just added)
- Vercel project: NOT YET CREATED — needs GitHub repo + Vercel project setup

## Tasks

### 1. Vercel + GitHub setup
- Create Vercel project for shopping, linked to `burrowsoft/shopping` GitHub repo (repo may not exist yet either)
- Add env vars to Vercel: `SERPAPI_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_SITE_URL=https://shoppingmole.com`
- Set up custom domain `shoppingmole.com` in Vercel

### 2. Verify end-to-end search works
- Run `npm install && npm run dev` in the `shopping/` directory
- Search for a product and confirm real results return with photos, prices, retailer names
- Check the product detail page loads offers and images

### 3. Product photos
SerpAPI returns `thumbnail` per result. The `Product` DTO supports `images[]`.
- Ensure product cards display the thumbnail
- Add all domains from SerpAPI image URLs to `next.config.ts` `images.remotePatterns` (currently has Google, Amazon, eBay, Walmart — add any others that appear)

### 4. Price comparison table
The product detail page should show all offers from `product.offers[]`:
- Retailer name, price, delivery cost, condition (new/used), link
- Sort by total price (price + delivery)
- "Visit store" CTA per offer

### 5. Review scores
SerpAPI returns `rating` and `reviews` count per product.
- Display star rating + review count on product cards
- On detail page, show review breakdown if available

### 6. Category browsing
The home page has category links. Wire them to `/search?q=<category>` with pre-filled queries.
- Ensure trending searches on the home page are real (can be hardcoded popular terms or fetched from a trending products endpoint if SerpAPI supports it)

### 7. Add a second shopping provider — Amazon or Walmart via RapidAPI
SerpAPI alone is not enough (expensive quota, single source). Add a RapidAPI-based product search as a parallel provider.
- Search RapidAPI for "amazon product search" or "walmart product search" — pick whichever has the best uptime and response quality
- Requires a new env var (likely still covered by `RAPIDAPI_KEY` subscription — check) — add to Vercel and `.env.example`
- File: create `packages/shared/src/providers/shopping/<name>.ts` implementing `Provider<ShoppingSearchParams, Product>`
- Register in `packages/shared/src/providers/shopping/index.ts` `createShoppingRouter()`
- Normalize the response to the existing `Product` DTO — pay attention to price format, image URLs, and offer structure which will differ from SerpAPI
- On results page, show provider badge per product card (Google Shopping vs Amazon vs Walmart)

### 8. Loading overlay — show while APIs are fetching
The search results page must show a loading overlay while SerpAPI (and any future provider) fetches. Requirements:
- Overlay shows: "Loading products from Google Shopping…" (add more lines as providers are added)
- As each resolves, its line gets a checkmark and results stream in
- If a provider fails, show "[Provider] unavailable" in muted text — no hard error
- Implement as a client component (`<ShoppingLoadingOverlay providers={string[]} />`)
- Overlay fades out once all providers have settled

### 9. "Visit store" redirect buttons
Every product card and the detail page must have labelled buttons per offer. Requirements:
- Button label: "Buy on [Retailer]" (e.g. "Buy on Amazon", "Buy on Walmart") — retailer name comes from `offer.retailer`
- Links to `offer.link` in a new tab (`target="_blank" rel="noopener noreferrer"`)
- On the detail page price comparison table, each row has its own "Buy on [Retailer]" button
- Cheapest offer gets a "Best price" badge

### 10. AI summary
Use `summarize()` from `@burrowsoft/shared` to generate a short buying guide blurb on the search results page (e.g. "Here are the top picks for X, with prices ranging from $Y to $Z").
