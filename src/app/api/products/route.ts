import { unstable_cache } from "next/cache";
import { createShoppingRouter, summarize } from "@burrowsoft/shared";
import type { Product, AISummary } from "@burrowsoft/shared";
import {
  getLazadaAffiliateLinks,
  isLazadaThUrl,
  buildShopeeAffiliateUrl,
  isShopeeThUrl,
} from "@/lib/lazada-affiliate";

interface ProductsResponse {
  products: Product[];
  summary: AISummary | null;
}

/** True if the string contains at least one Thai character (U+0E00–U+0E7F). */
function hasThai(s: string): boolean {
  return /[฀-๿]/.test(s);
}

/**
 * Returns the Thai search term Thai shoppers actually type on Shopee/Lazada.
 * Uses colloquial, platform-native phrasing rather than dictionary Thai.
 * Returns null if the key is missing or the call fails.
 */
async function translateToThai(query: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You help users search on Thai e-commerce platforms like Shopee and Lazada. " +
              "Given an English product search query, return the most common Thai search term " +
              "that Thai shoppers actually type on these platforms — use colloquial, everyday Thai, " +
              "not formal dictionary translations. For example: 'makeup' → 'แต้งหน้า' (not เครื่องสำอาง), " +
              "'phone' → 'มือถือ' (not โทรศัพท์). Reply with ONLY the Thai term, nothing else.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 60,
        temperature: 0,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json() as { choices: Array<{ message: { content: string } }> };
    return json.choices[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

function makeCachedSearch(query: string, country: string, currency: string) {
  return unstable_cache(
    async (): Promise<Product[]> => {
      const router = createShoppingRouter();
      return router.search({ query, country, currency }, country);
    },
    [`products:${query}:${country}`],
    { revalidate: 300 }
  );
}

/** Merge two product arrays, deduplicated by title+source. */
function mergeProducts(a: Product[], b: Product[]): Product[] {
  const seen = new Set(a.map((p) => `${p.title.toLowerCase()}|${p.source.toLowerCase()}`));
  const unique = b.filter((p) => {
    const key = `${p.title.toLowerCase()}|${p.source.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Interleave: one from b for every two from a so Thai results surface early
  const merged: Product[] = [];
  let ai = 0, bi = 0;
  while (ai < a.length || bi < unique.length) {
    if (ai < a.length) merged.push(a[ai++]);
    if (ai < a.length) merged.push(a[ai++]);
    if (bi < unique.length) merged.push(unique[bi++]);
  }
  return merged;
}

/** Replace Lazada + Shopee links with affiliate tracking links for Thai users. */
async function applyThaiAffiliateLinks(products: Product[]): Promise<Product[]> {
  const withShopee = products.map((p) => ({
    ...p,
    link: isShopeeThUrl(p.link) ? buildShopeeAffiliateUrl(p.link) : p.link,
    offers: p.offers.map((o) => ({
      ...o,
      link: isShopeeThUrl(o.link) ? buildShopeeAffiliateUrl(o.link) : o.link,
    })),
  }));

  const lazadaUrls = withShopee
    .flatMap((p) => [p.link, p.offers[0]?.link ?? ""])
    .filter((url) => url && isLazadaThUrl(url));

  if (lazadaUrls.length === 0) return withShopee;

  const affiliateMap = await getLazadaAffiliateLinks(lazadaUrls);
  if (Object.keys(affiliateMap).length === 0) return withShopee;

  return withShopee.map((p) => ({
    ...p,
    link: affiliateMap[p.link] ?? p.link,
    offers: p.offers.map((o) => ({
      ...o,
      link: affiliateMap[o.link] ?? o.link,
    })),
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const country = searchParams.get("country") ?? "US";
  const currency = searchParams.get("currency") ?? "USD";

  if (!q) {
    return Response.json({ products: [], summary: null });
  }

  try {
    let products: Product[];

    if (country === "TH" && !hasThai(q)) {
      // Run English query + OpenAI Thai translation in parallel
      const [thaiQuery, englishResults] = await Promise.all([
        translateToThai(q),
        makeCachedSearch(q, country, currency)(),
      ]);

      if (thaiQuery) {
        const thaiResults = await makeCachedSearch(thaiQuery, country, currency)();
        products = mergeProducts(englishResults, thaiResults);
      } else {
        products = englishResults;
      }
    } else {
      products = await makeCachedSearch(q, country, currency)();
    }

    const summary = await summarize("shopping", products, country);

    const finalProducts =
      country === "TH"
        ? await applyThaiAffiliateLinks(products)
        : products;

    return Response.json({ products: finalProducts, summary });
  } catch {
    return Response.json({ products: [], summary: null }, { status: 500 });
  }
}
