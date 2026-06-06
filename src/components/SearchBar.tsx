"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { TRENDING_SEARCHES } from "@/lib/data";
import { SearchIcon, CloseIcon } from "@burrowsoft/shared";

interface SearchBarProps {
  defaultValue?: string;
  large?: boolean;
}

export function SearchBar({ defaultValue = "", large = false }: SearchBarProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDropdown = focused && (query.length === 0 || suggestions.length > 0);

  // Fetch autocomplete suggestions with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}&locale=${locale}`);
      const data = await res.json() as { suggestions: string[] };
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    }
  }, [locale]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length === 0) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSubmit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setFocused(false);
    setActiveIndex(-1);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const items = query.length === 0 ? TRENDING_SEARCHES.slice(0, 8) : suggestions;
    if (!showDropdown || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSubmit(items[activeIndex]);
    } else if (e.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
    }
  }

  const placeholder = large ? t("placeholder") : t("placeholderShort");
  const dropdownItems = query.length === 0 ? TRENDING_SEARCHES.slice(0, 8) : suggestions;

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(activeIndex >= 0 ? dropdownItems[activeIndex] : query); }}
        className={`flex items-center gap-2 rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-violet-500 transition-all ${
          large ? "px-5 py-4" : "px-4 py-3"
        }`}
      >
        <SearchIcon className={`shrink-0 text-slate-400 ${large ? "h-6 w-6" : "h-5 w-5"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none placeholder-slate-400 text-slate-900 ${
            large ? "text-lg" : "text-base"
          }`}
          aria-label={t("placeholder")}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
            className="shrink-0 text-slate-400 hover:text-slate-600"
            aria-label={t("clear")}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className={`shrink-0 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors ${
            large ? "px-6 py-2.5 text-base" : "px-4 py-2 text-sm"
          }`}
        >
          {t("button")}
        </button>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
          {query.length === 0 && (
            <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("trending")}
            </p>
          )}
          {dropdownItems.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => handleSubmit(s)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                i === activeIndex
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-700 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              <span className="text-slate-300">↗</span>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
