# ShoppingMole — TODO2 (Follow-up improvements)

Please fill in Reports2.md as usual when done

## Permissions
Ask the user to enable bypass permissions before starting: Claude Code settings → permission mode "bypass", or `claude --dangerously-skip-permissions`.

## Tasks

### 1. Provider badge per product card
Once both SerpAPI (Google Shopping) and Real-Time Product Search (RapidAPI) return live data, each product card should display which provider it came from.

Requirements:
- Add a `provider` field to the `Product` DTO if not already present (it should be — check `packages/shared/src/types/index.ts`)
- Each provider's `search()` method should set `product.provider` to its display name: `"Google Shopping"` (SerpAPI) or `"Real-Time Search"` (RapidAPI)
- On the product card, show a small source badge (bottom-right of card or below the price) — e.g. a pill reading "Google Shopping" or "Real-Time"
- On the product detail page, the offers table already shows retailer names — the provider badge here is less critical

Implementation note: `SerpApiShoppingProvider` already sets `provider: this.name` (= `"Google Shopping"`) per the existing `serpapi.ts` code. Verify the RapidAPI provider also sets it. If the field is missing on some products, default to `"Unknown"` gracefully.

### 2. Verify Real-Time Product Search field mapping
The RapidAPI Real-Time Product Search response format was assumed from API docs and may need field name adjustments once live traffic hits it. When testing:
- Log the raw response from `real-time-product-search.p.rapidapi.com` on first search
- Compare field names to what the provider's `search()` method expects
- Adjust the normalisation mapping if needed (price field, image URL, retailer name, product link)
- Ensure `RAPIDAPI_KEY` subscription plan includes `real-time-product-search.p.rapidapi.com` — check at rapidapi.com/subscriptions
