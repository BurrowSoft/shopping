import { unstable_cache } from "next/cache";
import { createShoppingRouter } from "@burrowsoft/shared";
import type { Product } from "@burrowsoft/shared";
import { buildShopeeAffiliateUrl, isShopeeThUrl } from "@/lib/lazada-affiliate";

const getShopeeDeals = unstable_cache(
  async (): Promise<Product[]> => {
    const router = createShoppingRouter();
    // Search for popular/trending items on Shopee Thailand
    const results = await router.search(
      { query: "สินค้าขายดี", country: "TH", currency: "THB" },
      "TH"
    );
    // Keep only Shopee results and apply affiliate links
    return results
      .filter((p) => {
        const link = p.link || p.offers[0]?.link || "";
        return isShopeeThUrl(link) || p.source.toLowerCase().includes("shopee");
      })
      .slice(0, 8)
      .map((p) => ({
        ...p,
        link: buildShopeeAffiliateUrl(p.link),
        offers: p.offers.map((o) => ({ ...o, link: buildShopeeAffiliateUrl(o.link) })),
      }));
  },
  ["shopee-deals-th"],
  { revalidate: 86400 } // 24 hours
);

export async function GET() {
  try {
    const products = await getShopeeDeals();
    return Response.json({ products });
  } catch {
    return Response.json({ products: [] });
  }
}
