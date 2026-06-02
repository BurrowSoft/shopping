import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { CATEGORIES } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/search?q=${encodeURIComponent(c.query)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
