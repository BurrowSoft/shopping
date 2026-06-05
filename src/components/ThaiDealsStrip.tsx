"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@burrowsoft/shared";

function DealCard({ product }: { product: Product }) {
  const link = product.link || product.offers[0]?.link || "";
  const image = product.images?.[0] || "";
  const price = product.price.amount > 0
    ? new Intl.NumberFormat("th-TH", { style: "currency", currency: product.price.currency ?? "THB", maximumFractionDigits: 0 }).format(product.price.amount)
    : null;

  const inner = (
    <div className="w-36 shrink-0 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-slate-50">
        {image ? (
          <Image src={image} alt={product.title} fill className="object-contain p-1" sizes="144px" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-slate-200">🛍</div>
        )}
      </div>
      <p className="line-clamp-2 text-xs font-medium text-slate-700 leading-snug">{product.title}</p>
      {price && <p className="mt-1 text-xs font-bold text-violet-600">{price}</p>}
      <p className="mt-0.5 text-[10px] text-slate-400 truncate">{product.source}</p>
    </div>
  );

  if (!link) return <div>{inner}</div>;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer sponsored" className="block">
      {inner}
    </a>
  );
}

export function ThaiDealsStrip() {
  const [products, setProducts] = useState<Product[]>([]);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/shopee-deals")
      .then((r) => r.json())
      .then((data: { products: Product[] }) => setProducts(data.products ?? []))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="mx-auto max-w-4xl px-2 pb-3">
      <div
        ref={stripRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((p) => (
          <DealCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
