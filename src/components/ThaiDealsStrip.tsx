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

const SCROLL_AMOUNT = 480; // ~3 cards

export function ThaiDealsStrip() {
  const [products, setProducts] = useState<Product[]>([]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/shopee-deals")
      .then((r) => r.json())
      .then((data: { products: Product[] }) => setProducts(data.products ?? []))
      .catch(() => {});
  }, []);

  function updateArrows() {
    const el = stripRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
  }, [products]);

  function scrollBy(dir: 1 | -1) {
    stripRef.current?.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div className="mx-auto max-w-4xl px-2 pb-3">
      <div className="relative">
        {/* Left arrow */}
        {canLeft && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((p) => (
            <DealCard key={p.id} product={p} />
          ))}
        </div>

        {/* Right arrow */}
        {canRight && (
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
