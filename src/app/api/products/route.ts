import { unstable_cache } from "next/cache";
import { createShoppingRouter, summarize } from "@burrowsoft/shared";
import type { Product, AISummary } from "@burrowsoft/shared";
import { getLazadaAffiliateLinks, isLazadaThUrl } from "@/lib/lazada-affiliate";

interface ProductsResponse {
  products: Product[];
  summary: AISummary | null;
}

function makeCachedSearch(query: string, country: string, currency: string) {
  return unstable_cache(
    async (): Promise<ProductsResponse> => {
      const router = createShoppingRouter();
      const products = await router.search({ query, country, currency }, country);
      const summary = await summarize("shopping", products, country);
      return { products, summary };
    },
    [`products:${query}:${country}`],
    { revalidate: 300 }
  );
}

/** Replace Lazada links with affiliate tracking links for Thai users. */
async function applyLazadaAffiliateLinks(products: Product[]): Promise<Product[]> {
  const lazadaUrls = products
    .flatMap((p) => [p.link, p.offers[0]?.link ?? ""])
    .filter((url) => url && isLazadaThUrl(url));

  if (lazadaUrls.length === 0) return products;

  const affiliateMap = await getLazadaAffiliateLinks(lazadaUrls);
  if (Object.keys(affiliateMap).length === 0) return products;

  return products.map((p) => ({
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
    const search = makeCachedSearch(q, country, currency);
    const result = await search();

    // For Thai users, replace Lazada product links with affiliate tracking links
    const products =
      country === "TH"
        ? await applyLazadaAffiliateLinks(result.products)
        : result.products;

    return Response.json({ products, summary: result.summary });
  } catch {
    return Response.json({ products: [], summary: null }, { status: 500 });
  }
}
