"use client";

import { useState } from "react";

const LAZADA_ADS = [
  {
    href: "https://s.lazada.co.th/s.ZhTKMF?c=b&t=p-i6RvCVf-sRab381",
    label: "ช้อปที่ Lazada",
    sub: "ส่วนลดสูงสุด 90%",
  },
  {
    href: "https://s.lazada.co.th/s.ZhTKLe?c=a&t=p-iHa6GOt-s2EYQBV0",
    label: "ดีลพิเศษวันนี้",
    sub: "ส่งฟรีทั่วประเทศ",
  },
];

export function LazadaFloatingAd() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2"
      aria-label="Lazada promotions"
    >
      <div className="relative rounded-2xl bg-white shadow-2xl border border-orange-100 overflow-hidden w-52">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#F57224] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-white">lazada</span>
            <span className="rounded bg-white/20 px-1 py-0.5 text-[9px] font-bold uppercase text-white">TH</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Close Lazada ad"
            className="text-white/80 hover:text-white transition-colors ml-2"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col divide-y divide-slate-100">
          {LAZADA_ADS.map((ad) => (
            <a
              key={ad.href}
              href={ad.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group flex flex-col px-3 py-2.5 hover:bg-orange-50 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-800 group-hover:text-[#F57224] transition-colors">
                {ad.label}
              </span>
              <span className="text-xs text-slate-400">{ad.sub}</span>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] text-slate-300 text-center">โฆษณา · Sponsored</p>
        </div>
      </div>
    </div>
  );
}
