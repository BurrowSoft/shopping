import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { CATEGORIES } from "@/lib/data";

const BASE = "https://www.shoppingmole.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/"];
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const locale of routing.locales) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      entries.push({
        url: `${BASE}${prefix}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      });
    }
  }

  // Category search pages (English only — locale versions indexed via hreflang)
  for (const cat of CATEGORIES) {
    entries.push({
      url: `${BASE}/search?q=${encodeURIComponent(cat.query)}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  return entries;
}
