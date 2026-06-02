# ShoppingMole — API Integration TODO

## Permissions
Before starting work, ask the user to enable bypass permissions so you don't get approval prompts on every file operation. They can do this by opening Claude Code settings and setting permission mode to "bypass", or by launching with `claude --dangerously-skip-permissions`.

## Available API Keys
- `SERPAPI_KEY` — Google Shopping via SerpAPI (wired in shared lib, set in `.env.local`)
- `OPENAI_API_KEY` — AI summaries
- Note: `SERPAPI_KEY` is NOT yet visible in the Vercel project env vars screenshot. Add it to Vercel before deploying.

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

### 7. AI summary
Use `summarize()` from `@burrowsoft/shared` to generate a short buying guide blurb on the search results page (e.g. "Here are the top picks for X, with prices ranging from $Y to $Z").
