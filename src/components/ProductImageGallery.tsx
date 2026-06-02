"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  title: string;
}

export function ProductImageGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const shown = images.length > 0 ? images : [""];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 border border-slate-200">
        {shown[active] ? (
          <Image
            src={shown[active] ?? ""}
            alt={title}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl text-slate-200">
            🛍️
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {shown.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {shown.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                active === i
                  ? "border-violet-500 shadow-sm"
                  : "border-slate-200 hover:border-violet-300"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {img && (
                <Image
                  src={img}
                  alt={`${title} thumbnail ${i + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                  unoptimized
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
