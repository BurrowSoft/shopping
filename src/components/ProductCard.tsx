import Image from "next/image";
import type { Product } from "@burrowsoft/shared";
import { StarRating } from "./StarRating";

interface ProductCardProps {
  product: Product;
  query?: string;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount =
    product.originalPrice && product.originalPrice.amount > product.price.amount
      ? Math.round(
          ((product.originalPrice.amount - product.price.amount) /
            product.originalPrice.amount) *
            100
        )
      : null;

  const href = product.link || product.offers[0]?.link || "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
      aria-label={`Buy ${product.title} on ${product.source}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-slate-50">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-slate-200">
            🛍️
          </div>
        )}
        {discount && (
          <span className="absolute top-2 left-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 text-sm font-medium text-slate-800 group-hover:text-violet-700 transition-colors leading-snug">
          {product.title}
        </p>

        {product.rating !== undefined && (
          <StarRating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-violet-700">
              {product.price.formatted}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                {product.originalPrice.formatted}
              </span>
            )}
          </div>

          {product.delivery && (
            <p className="mt-0.5 text-xs text-green-600 font-medium">
              {product.delivery}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-1">
            <p className="text-xs text-slate-400 truncate">via {product.source}</p>
            <ProviderBadge provider={product.provider} />
          </div>
        </div>
      </div>
    </a>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const label =
    provider === "Google Shopping"
      ? "G Shopping"
      : provider === "Real-Time Product Search"
      ? "Real-Time"
      : provider || "Unknown";

  const color =
    provider === "Google Shopping"
      ? "bg-blue-50 text-blue-600 border-blue-100"
      : provider === "Real-Time Product Search"
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : "bg-slate-50 text-slate-500 border-slate-100";

  return (
    <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${color}`}>
      {label}
    </span>
  );
}
