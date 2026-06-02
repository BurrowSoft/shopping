"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TRENDING_SEARCHES } from "@/lib/data";

interface SearchBarProps {
  defaultValue?: string;
  large?: boolean;
  placeholder?: string;
}

export function SearchBar({
  defaultValue = "",
  large = false,
  placeholder = "Search for any product…",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = TRENDING_SEARCHES.filter(
    (s) => query.length > 0 && s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const showDropdown = focused && (suggestions.length > 0 || (query.length === 0 && focused));

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
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(query);
        }}
        className={`flex items-center gap-2 rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-violet-500 transition-all ${
          large ? "px-5 py-4" : "px-4 py-3"
        }`}
      >
        <svg
          className={`shrink-0 text-slate-400 ${large ? "h-6 w-6" : "h-5 w-5"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none placeholder-slate-400 text-slate-900 ${
            large ? "text-lg" : "text-base"
          }`}
          aria-label="Search for products"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="shrink-0 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className={`shrink-0 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors ${
            large ? "px-6 py-2.5 text-base" : "px-4 py-2 text-sm"
          }`}
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
          {query.length === 0 ? (
            <>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Trending searches
              </p>
              {TRENDING_SEARCHES.slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => handleSubmit(s)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  <span className="text-slate-300">↗</span>
                  {s}
                </button>
              ))}
            </>
          ) : (
            suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => handleSubmit(s)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                <span className="text-slate-300">↗</span>
                {s}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
