import { unstable_cache } from "next/cache";
import { createShoppingRouter, summarize, detectCountry } from "@burrowsoft/shared";
import type { Product, AISummary } from "@burrowsoft/shared";

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
    return Response.json(result);
  } catch {
    return Response.json({ products: [], summary: null }, { status: 500 });
  }
}
