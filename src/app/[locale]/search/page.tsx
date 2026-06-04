import type { Metadata } from "next";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
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
      <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-purple-600 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-violet-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white font-medium truncate max-w-xs">
                {query ? `"${query}"` : "Search"}
              </li>
            </ol>
          </nav>
          <SearchBar defaultValue={query} large />
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

      <p className="mx-auto max-w-4xl px-4 pb-8 text-xs text-slate-400 text-center">
        Results powered by Google Shopping · Affiliate links may earn {SITE_NAME} a commission ·{" "}
        <a href={SITE_URL} className="hover:text-violet-500">{SITE_URL}</a>
      </p>
    </>
  );
}
