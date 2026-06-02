"use client";

import { useState, useMemo } from "react";
import type { Product } from "@burrowsoft/shared";
import { ProductCard } from "./ProductCard";
import { AdUnit } from "./AdUnit";

interface Props {
  products: Product[];
  query: string;
}

type SortOption = "relevance" | "price_low" | "price_high" | "review_score";

export function ProductResults({ products, query }: Props) {
  const [sort, setSort] = useState<SortOption>("relevance");
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [minRating, setMinRating] = useState(0);
  const [withReviewsOnly, setWithReviewsOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);

  const maxAvailable = useMemo(
    () => Math.max(...products.map((p) => p.price.amount), 100),
    [products]
  );

  const priceSliderMax = Math.ceil(maxAvailable / 10) * 10;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (maxPrice !== Infinity && p.price.amount > maxPrice) return false;
      if (minRating > 0 && (p.rating ?? 0) < minRating) return false;
      if (withReviewsOnly && !p.reviewCount) return false;
      if (freeDeliveryOnly && !p.delivery?.toLowerCase().includes("free")) return false;
      return true;
    });
  }, [products, maxPrice, minRating, withReviewsOnly, freeDeliveryOnly]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price_low": return a.price.amount - b.price.amount;
        case "price_high": return b.price.amount - a.price.amount;
        case "review_score": return (b.rating ?? 0) - (a.rating ?? 0);
        default: return 0;
      }
    });
  }, [filtered, sort]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-60 shrink-0">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Max price</h3>
            <input
              type="range"
              min={0}
              max={priceSliderMax}
              value={maxPrice === Infinity ? priceSliderMax : Math.min(maxPrice, priceSliderMax)}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMaxPrice(v >= priceSliderMax ? Infinity : v);
              }}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$0</span>
              <span className="font-medium text-violet-600">
                {maxPrice === Infinity ? "Any" : `$${maxPrice}`}
              </span>
              <span>${priceSliderMax}+</span>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Min rating</h3>
            <div className="space-y-2">
              {[4.5, 4, 3.5, 3].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === r}
                    onChange={() => setMinRating(minRating === r ? 0 : r)}
                    className="accent-violet-600"
                  />
                  <span className="text-amber-400 text-sm">{"★".repeat(Math.floor(r))}</span>
                  <span className="text-xs text-slate-600">{r}+</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
              <input
                type="checkbox"
                checked={withReviewsOnly}
                onChange={(e) => setWithReviewsOnly(e.target.checked)}
                className="accent-violet-600"
              />
              Has reviews
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
              <input
                type="checkbox"
                checked={freeDeliveryOnly}
                onChange={(e) => setFreeDeliveryOnly(e.target.checked)}
                className="accent-violet-600"
              />
              Free delivery
            </label>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Sort bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Sort:</span>
          {(
            [
              ["relevance", "Best Match"],
              ["price_low", "Price: Low → High"],
              ["price_high", "Price: High → Low"],
              ["review_score", "Best Rated"],
            ] as [SortOption, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sort === value
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-20 text-center">
            <p className="text-lg font-medium text-slate-400">No products match your filters</p>
            <p className="mt-2 text-sm text-slate-400">Try adjusting the price or rating filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {sorted.map((product, idx) => (
                <>
                  <ProductCard key={product.id} product={product} />
                  {idx === 7 && (
                    <div key="ad" className="col-span-2 sm:col-span-3 lg:col-span-4">
                      <AdUnit slot="SEARCH_MID_SLOT" format="horizontal" />
                    </div>
                  )}
                </>
              ))}
            </div>
            <p className="mt-8 text-center text-xs text-slate-400">
              Showing {sorted.length} results for &ldquo;{query}&rdquo; · Prices updated in real-time
            </p>
          </>
        )}
      </div>
    </div>
  );
}
