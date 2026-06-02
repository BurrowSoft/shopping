import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { ProductResults } from "@/components/ProductResults";
import { AdUnit } from "@/components/AdUnit";
import { buildSearchMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getCurrencyForCountry } from "@/lib/currency";
import { createShoppingRouter, detectCountry, type Product } from "@burrowsoft/shared";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) return { title: `Search | ${SITE_NAME}` };
  return buildSearchMetadata(q);
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  const currencyInfo = getCurrencyForCountry(country);

  let products: Product[] = [];
  let error = false;

  if (query) {
    try {
      const router = createShoppingRouter();
      products = await router.search(
        {
          query,
          country,
          currency: currencyInfo.code,
        },
        country
      );
    } catch {
      error = true;
    }
  }

  return (
    <>
      {/* Search header */}
      <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-purple-600 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-violet-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white font-medium truncate max-w-xs">
                {query ? `"${query}"` : "Search"}
              </li>
            </ol>
          </nav>
          <SearchBar defaultValue={query} large placeholder="Refine your search…" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {!query ? (
          <div className="py-20 text-center">
            <p className="text-2xl font-bold text-slate-300">🔍</p>
            <p className="mt-4 text-lg font-medium text-slate-500">Enter a product name to compare prices</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="font-semibold text-red-700">Unable to load results right now</p>
            <p className="mt-1 text-sm text-red-500">Please try again in a moment.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-5xl">🔍</p>
            <p className="mt-4 text-lg font-semibold text-slate-700">
              No results found for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or check for typos.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-xl font-bold text-slate-900">
              Results for &ldquo;{query}&rdquo;
            </h1>
            <p className="mb-6 text-sm text-slate-500">
              {products.length} products found · Prices compared across 500+ stores
            </p>

            <ProductResults products={products} query={query} />
          </>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 py-4">
        <AdUnit slot="SEARCH_BOTTOM_SLOT" format="horizontal" />
      </div>

      {/* SEO footer content for search pages */}
      {query && products.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 py-10">
          <h2 className="mb-3 text-base font-semibold text-slate-700">
            Buying guide for &ldquo;{query}&rdquo;
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {SITE_NAME} searches live prices across Amazon, eBay, Walmart, Best Buy, and 500+
            other retailers for &ldquo;{query}&rdquo;. Prices are updated every 5 minutes.
            Always compare total cost including shipping before purchasing. Click any product to
            see full price history, reviews, and all available retailers.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Results powered by Google Shopping · Affiliate links may earn {SITE_NAME} a commission ·{" "}
            <Link href={SITE_URL} className="hover:text-violet-500">
              {SITE_URL}
            </Link>
          </p>
        </section>
      )}
    </>
  );
}
