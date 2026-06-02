"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  th: "ภาษาไทย",
  pt: "Português",
  "pt-BR": "Português (Brasil)",
  zh: "中文",
  "zh-TW": "繁體中文",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  vi: "Tiếng Việt",
  hi: "हिन्दी",
};

interface Props {
  locales: string[];
  className?: string;
}

export function LanguageSelector({ locales, className = "" }: Props) {
  const currentLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const locale = e.target.value;
    document.cookie = `NEXT_LOCALE=${locale};max-age=31536000;path=/;SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      disabled={isPending}
      aria-label="Select language"
      className={`rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm cursor-pointer transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 ${className}`}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {LOCALE_NAMES[locale] ?? locale}
        </option>
      ))}
    </select>
  );
}
