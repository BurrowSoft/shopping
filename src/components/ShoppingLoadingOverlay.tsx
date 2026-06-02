"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ProviderStatus {
  name: string;
  state: "loading" | "done" | "error";
}

interface Props {
  providers: string[];
  done: boolean;
  error: boolean;
}

export function ShoppingLoadingOverlay({ providers, done, error }: Props) {
  const t = useTranslations("results");
  const [statuses, setStatuses] = useState<ProviderStatus[]>(
    providers.map((name) => ({ name, state: "loading" }))
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!done && !error) return;
    setStatuses((prev) =>
      prev.map((p) => ({ ...p, state: error ? "error" : "done" }))
    );
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, [done, error]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-500 ${
        done || error ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-live="polite"
      aria-label={t("loading")}
    >
      <div className="rounded-2xl border border-slate-200 bg-white px-10 py-8 shadow-xl text-center">
        <div className="mb-5 text-4xl">🛍️</div>
        <p className="mb-4 text-base font-semibold text-slate-800">
          {t("loading")}
        </p>
        <ul className="space-y-3">
          {statuses.map((p) => (
            <li key={p.name} className="flex items-center gap-3 text-sm">
              <span className="w-5 flex-shrink-0 text-center">
                {p.state === "loading" && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
                )}
                {p.state === "done" && <span className="text-green-500 font-bold">✓</span>}
                {p.state === "error" && <span className="text-slate-300">✕</span>}
              </span>
              <span
                className={
                  p.state === "error"
                    ? "text-slate-400"
                    : p.state === "done"
                    ? "text-slate-600"
                    : "text-slate-700 font-medium"
                }
              >
                {p.state === "error"
                  ? t("unavailable", { provider: p.name })
                  : t("loadingFrom", { provider: p.name })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
