# ShoppingMole — TODO4: Complete Thai/Portuguese Localisation

Finish translation coverage and adopt the shared `LanguageSelector` dropdown component.

## Replace LanguageSelector with shared component
Delete `src/components/LanguageSelector.tsx`. In `layout.tsx`:
```tsx
import { LanguageSelector } from "@burrowsoft/shared";
<LanguageSelector locales={["en", "th"]} />
```

## Wire SearchBar strings (if pending)
Add `useTranslations("search")` and replace hardcoded strings:
- Placeholder: `"Search for products…"` → `t("placeholder")`
- Button: `"Search"` → `t("button")`
- Trending label (if exists) → `t("trending")`

## Translate page-level hero
- `page.tsx` hero title/subtitle (if still hardcoded)
- `"Compare prices across Google Shopping and top retailers"` → use `t("hero.subtitle")`

## Verify product card labels
- `ProductCard.tsx` — `"Best price"`, `"per item"`, provider names — all using `t()` calls

## Test end-to-end
1. Load page in EN
2. Switch locale dropdown to TH — verify Thai render + Sarabun font
3. Do a search — verify all results/loading overlay labels are translated
4. Switch back to EN
5. Reload — verify cookie persists

## Fill in ThaiReports.md
Document translation coverage. Link to `API Stories/Thai.md` for later API work (Shopee, Lazada, Mercado Livre, Magalu, etc.).

---

**API work:** See `API Stories/Thai.md` and `API Stories/Brazil.md` (start after localisation is complete).
