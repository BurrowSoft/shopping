import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { SearchPageClient } from "@/components/SearchPageClient";
import { AdUnit } from "@/components/AdUnit";
import { buildSearchMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getCurrencyForCountry } from "@/lib/currency";
import { detectCountry } from "@burrowsoft/shared";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) return { title: `Search | ${SITE_NAME}` };
  return buildSearchMetadata(q);
}

const ACTIVE_PROVIDERS = ["Google Shopping", "Real-Time Product Search"];

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  const currencyInfo = getCurrencyForCountry(country);

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
        {query && (
          <h1 className="mb-4 text-xl font-bold text-slate-900">
            Results for &ldquo;{query}&rdquo;
          </h1>
        )}

        <SearchPageClient
          query={query}
          country={country}
          currency={currencyInfo.code}
          providers={ACTIVE_PROVIDERS}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-4">
        <AdUnit slot="SEARCH_BOTTOM_SLOT" format="horizontal" />
      </div>

      {query && (
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
