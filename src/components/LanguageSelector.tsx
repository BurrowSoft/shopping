"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LanguageSelector() {
  const router = useRouter();
  const locale = useLocale();

  function setLocale(next: string) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
      <button
        onClick={() => setLocale("en")}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
          locale === "en"
            ? "bg-violet-600 text-white"
            : "text-slate-500 hover:text-slate-700"
        }`}
        aria-label="English"
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => setLocale("th")}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
          locale === "th"
            ? "bg-violet-600 text-white"
            : "text-slate-500 hover:text-slate-700"
        }`}
        aria-label="ภาษาไทย"
      >
        🇹🇭 TH
      </button>
    </div>
  );
}
