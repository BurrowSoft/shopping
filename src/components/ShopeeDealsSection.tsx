"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Product } from "@burrowsoft/shared";

function ShopeeProductCard({ product }: { product: Product }) {
  const link = product.link || product.offers[0]?.link || "";
  const image = product.images?.[0] || "";

  return (
    <a
      href={link || "#"}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-contain p-2 transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-200">🛍</div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-xs font-medium text-slate-700 leading-snug">
          {product.title}
        </p>
        <p className="mt-auto text-sm font-bold text-orange-500">
          ฿{product.price.amount.toLocaleString()}
        </p>
        {product.rating && (
          <p className="text-xs text-slate-400">
            {"★".repeat(Math.round(product.rating))} {product.rating.toFixed(1)}
          </p>
        )}
      </div>
    </a>
  );
}

export function ShopeeDealsSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/shopee-deals")
      .then((r) => r.json())
      .then((data: { products: Product[] }) => setProducts(data.products ?? []))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🛒</span>
        <h2 className="text-base font-bold text-slate-800">สินค้าขายดีบน Shopee</h2>
        <span className="ml-auto text-xs text-slate-400">Sponsored</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.slice(0, 8).map((p) => (
          <ShopeeProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
