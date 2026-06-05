"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Product } from "@burrowsoft/shared";
import { ProductCard } from "./ProductCard";
import { AdUnit } from "./AdUnit";

const THAI_DOMAINS = ["lazada.co.th", "shopee.co.th", "bnn.in.th", "powerbuy.co.th"];
const THAI_SOURCE_KEYWORDS = ["lazada", "shopee", "bnn", "banana", "powerbuy"];

function isThaiPlatform(p: Product) {
  const link = p.link || p.offers[0]?.link || "";
  const src = p.source.toLowerCase();
  return (
    THAI_DOMAINS.some((d) => link.includes(d)) ||
    THAI_SOURCE_KEYWORDS.some((k) => src.includes(k))
  );
}

interface Props {
  products: Product[];
  query: string;
  country?: string;
}

type SortOption = "relevance" | "price_low" | "price_high" | "review_score";

export function ProductResults({ products, query, country }: Props) {
  const t = useTranslations("results");
  const isThai = country === "TH";
  const [sort, setSort] = useState<SortOption>("relevance");
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [minRating, setMinRating] = useState(0);
  // TH: checked (default) = local retailers only; unchecked = show all
  const [localOnly, setLocalOnly] = useState(true);
  const [withReviewsOnly, setWithReviewsOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);

  const { minAvailable, maxAvailable, currency } = useMemo(() => {
    const amounts = products.map((p) => p.price.amount).filter((a) => a > 0);
    const cur = products[0]?.price.currency ?? "USD";
    return {
      minAvailable: amounts.length ? Math.min(...amounts) : 0,
      maxAvailable: amounts.length ? Math.max(...amounts) : 100,
      currency: cur,
    };
  }, [products]);

  // Round max up to a clean number
  const priceSliderMax = useMemo(() => {
    if (maxAvailable <= 100) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxAvailable)));
    return Math.ceil(maxAvailable / magnitude) * magnitude;
  }, [maxAvailable]);

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (maxPrice !== Infinity && p.price.amount > maxPrice) return false;
      if (minRating > 0 && (p.rating ?? 0) < minRating) return false;
      if (withReviewsOnly && !p.reviewCount) return false;
      if (freeDeliveryOnly && !p.delivery?.toLowerCase().includes("free")) return false;
      // TH users: checked (default) = local retailers only; unchecked = show all
      if (isThai && localOnly && !isThaiPlatform(p)) return false;
      // Intl users: filter out Thai-specific platforms
      if (!isThai && isThaiPlatform(p)) return false;
      return true;
    });
  }, [products, maxPrice, minRating, withReviewsOnly, freeDeliveryOnly, isThai, localOnly]);

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

  const sortOptions: [SortOption, string][] = [
    ["relevance", t("sortRelevance")],
    ["price_low", t("sortPriceLow")],
    ["price_high", t("sortPriceHigh")],
    ["review_score", t("sortRating")],
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-60 shrink-0">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">{t("maxPrice")}</h3>
            <input
              type="range"
              min={minAvailable}
              max={priceSliderMax}
              step={Math.max(1, Math.floor(priceSliderMax / 100))}
              value={maxPrice === Infinity ? priceSliderMax : Math.min(maxPrice, priceSliderMax)}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMaxPrice(v >= priceSliderMax ? Infinity : v);
              }}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{formatPrice(minAvailable)}</span>
              <span className="font-medium text-violet-600">
                {maxPrice === Infinity ? "Any" : formatPrice(maxPrice)}
              </span>
              <span>{formatPrice(priceSliderMax)}+</span>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">{t("minRating")}</h3>
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
              {t("hasReviews")}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
              <input
                type="checkbox"
                checked={freeDeliveryOnly}
                onChange={(e) => setFreeDeliveryOnly(e.target.checked)}
                className="accent-violet-600"
              />
              {t("freeDelivery")}
            </label>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500">{t("sortBy")}</span>
          {sortOptions.map(([value, label]) => (
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
            {filtered.length === 1 ? t("result", { count: filtered.length }) : t("resultPlural", { count: filtered.length })}
          </span>
        </div>

        {isThai && (
          <label className={`mb-4 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
            localOnly
              ? "border-orange-200 bg-orange-50 text-orange-800"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}>
            <input
              type="checkbox"
              checked={localOnly}
              onChange={(e) => setLocalOnly(e.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            <span className="text-sm font-medium">
              {localOnly ? "🛒 " : "🌏 "}
              {t("includeInternational")}
            </span>
          </label>
        )}

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-20 text-center">
            <p className="text-lg font-medium text-slate-400">{t("noFilters")}</p>
            <p className="mt-2 text-sm text-slate-400">{t("noFiltersTip")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {sorted.map((product, idx) => (
                <>
                  <ProductCard key={product.id} product={product} query={query} />
                  {idx === 7 && (
                    <div key="ad" className="col-span-2 sm:col-span-3 lg:col-span-4">
                      <AdUnit slot="SEARCH_MID_SLOT" format="horizontal" />
                    </div>
                  )}
                </>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
