import { unstable_cache } from "next/cache";

// Google locale codes differ from our locales in a few cases
const LOCALE_TO_HL: Record<string, string> = {
  "zh": "zh-CN",
  "pt-BR": "pt-BR",
};
function toHl(locale: string): string {
  return LOCALE_TO_HL[locale] ?? locale;
}

async function fetchSuggest(query: string, hl: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&hl=${hl}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return [];
    const json = await res.json() as [string, string[]];
    return json[1] ?? [];
  } catch {
    return [];
  }
}

function makeCachedSuggest(query: string, locale: string) {
  return unstable_cache(
    async (): Promise<string[]> => {
      const hl = toHl(locale);
      const isEnglish = locale === "en";

      const [localeSuggestions, enSuggestions] = await Promise.all([
        fetchSuggest(query, hl),
        isEnglish ? Promise.resolve([]) : fetchSuggest(query, "en"),
      ]);

      // Locale suggestions first (up to 5), then English-only ones not already present
      const seen = new Set(localeSuggestions.map((s) => s.toLowerCase()));
      const enOnly = enSuggestions.filter((s) => !seen.has(s.toLowerCase()));
      return [...localeSuggestions.slice(0, 5), ...enOnly.slice(0, 3)].slice(0, 8);
    },
    [`suggest:${query}:${locale}`],
    { revalidate: 300 }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const locale = searchParams.get("locale") ?? "en";

  if (q.length < 2) return Response.json({ suggestions: [] });

  try {
    const suggestions = await makeCachedSuggest(q, locale)();
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
