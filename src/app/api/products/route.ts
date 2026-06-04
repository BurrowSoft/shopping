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

/** Keep only Lazada and Shopee products for Thai users. */
function filterThaiProducts(products: Product[]): Product[] {
  return products.filter((p) => {
    const link = p.link || p.offers[0]?.link || "";
    const source = p.source.toLowerCase();
    return (
      link.includes("lazada.co.th") ||
      link.includes("shopee.co.th") ||
      source.includes("lazada") ||
      source.includes("shopee")
    );
  });
}

/** Replace Lazada + Shopee links with affiliate tracking links for Thai users. */
async function applyThaiAffiliateLinks(products: Product[]): Promise<Product[]> {
  // Shopee: synchronous URL rewrite (no API needed)
  const withShopee = products.map((p) => ({
    ...p,
    link: isShopeeThUrl(p.link) ? buildShopeeAffiliateUrl(p.link) : p.link,
    offers: p.offers.map((o) => ({
      ...o,
      link: isShopeeThUrl(o.link) ? buildShopeeAffiliateUrl(o.link) : o.link,
    })),
  }));

  // Lazada: requires API call to get tracking links
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
    const search = makeCachedSearch(q, country, currency);
    const result = await search();

    // For Thai users: show only Lazada + Shopee, with affiliate links applied
    const products =
      country === "TH"
        ? await applyThaiAffiliateLinks(filterThaiProducts(result.products))
        : result.products;

    return Response.json({ products, summary: result.summary });
  } catch {
    return Response.json({ products: [], summary: null }, { status: 500 });
  }
}
