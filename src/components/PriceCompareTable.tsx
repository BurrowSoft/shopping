"use client";

import { useTranslations } from "next-intl";
import type { ProductOffer } from "@burrowsoft/shared";

interface Props {
  offers: ProductOffer[];
}

export function PriceCompareTable({ offers }: Props) {
  const t = useTranslations("results");
  if (offers.length === 0) return null;

  const sorted = [...offers].sort((a, b) => a.price.amount - b.price.amount);
  const lowest = sorted[0]?.price.amount ?? 0;
  const storeLabel =
    offers.length === 1
      ? t("storeCount", { count: offers.length })
      : t("storeCountPlural", { count: offers.length });

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">
          {t("priceComparison")} — {storeLabel}
        </h2>
      </div>
      <div className="divide-y divide-slate-100">
        {sorted.map((offer, i) => {
          const isCheapest = offer.price.amount === lowest;
          return (
            <div
              key={i}
              className={`flex items-center gap-4 px-4 py-3 ${
                isCheapest ? "bg-green-50" : "bg-white"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 truncate">{offer.retailer}</span>
                  {isCheapest && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      {t("bestPrice")}
                    </span>
                  )}
                  {offer.condition && offer.condition !== "" && (
                    <span className="text-xs text-slate-400">{offer.condition}</span>
                  )}
                </div>
                {offer.delivery && (
                  <p className="text-xs text-slate-500 mt-0.5">{offer.delivery}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-violet-700 text-lg">{offer.price.formatted}</p>
                {offer.originalPrice && offer.originalPrice.amount > offer.price.amount && (
                  <p className="text-xs text-slate-400 line-through">
                    {offer.originalPrice.formatted}
                  </p>
                )}
              </div>

              <a
                href={offer.link}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors whitespace-nowrap"
                aria-label={t("buyOn", { retailer: offer.retailer })}
              >
                {t("buyOn", { retailer: offer.retailer })}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
