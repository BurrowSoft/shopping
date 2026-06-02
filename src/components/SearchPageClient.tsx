"use client";

import { useEffect, useState } from "react";
import type { Product, AISummary } from "@burrowsoft/shared";
import { ShoppingLoadingOverlay } from "./ShoppingLoadingOverlay";
import { ProductResults } from "./ProductResults";

interface Props {
  query: string;
  country: string;
  currency: string;
  providers: string[];
}

interface ApiResponse {
  products: Product[];
  summary: AISummary | null;
}

export function SearchPageClient({ query, country, currency, providers }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    setProducts([]);
    setSummary(null);

    const params = new URLSearchParams({ q: query, country, currency });

    fetch(`/api/products?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        setProducts(data.products ?? []);
        setSummary(data.summary ?? null);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [query, country, currency]);

  if (!query) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium text-slate-500">
          Enter a product name to compare prices
        </p>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <ShoppingLoadingOverlay providers={providers} done={false} error={false} />
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-700">Unable to load results right now</p>
          <p className="mt-1 text-sm text-red-500">Please try again in a moment.</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-4 text-lg font-semibold text-slate-700">
            No results found for &ldquo;{query}&rdquo;
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Try a different search term or check for typos.
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          {/* AI summary card */}
          {summary && (
            <div className="mb-6 rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">✨</span>
                <div>
                  <p className="text-sm font-semibold text-violet-800 mb-1">
                    ShoppingMole AI — Buying Guide
                  </p>
                  <p className="text-sm text-violet-700 leading-relaxed">{summary.summary}</p>
                  {summary.highlights.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {summary.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-violet-600">
                          <span className="mt-0.5 text-violet-400">›</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  {summary.recommendation && (
                    <p className="mt-2 text-xs font-medium text-violet-700">
                      💡 {summary.recommendation}
                    </p>
                  )}
                  {summary.countryNote && (
                    <p className="mt-1 text-xs text-violet-500 italic">{summary.countryNote}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="mb-6 text-sm text-slate-500">
            {products.length} products found · Prices compared across 500+ stores
          </p>
          <ProductResults products={products} query={query} />
        </>
      )}
    </>
  );
}
