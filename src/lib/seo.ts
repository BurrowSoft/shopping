import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shopmole.com";
export const SITE_NAME = "ShopMole";
export const SITE_DESCRIPTION =
  "Compare prices across hundreds of stores instantly. Find the best deals on electronics, fashion, home goods, and more — with real reviews and price history.";

export function buildSearchMetadata(query: string): Metadata {
  const title = `"${query}" — Price Comparison | ${SITE_NAME}`;
  const description = `Compare prices for "${query}" across Amazon, eBay, Walmart, Best Buy, and more. Find the lowest price and best deal today.`;
  return {
    title,
    description,
    robots: { index: false, follow: true },
  };
}

export function buildProductMetadata(title: string, price?: string): Metadata {
  const metaTitle = `${title}${price ? ` — from ${price}` : ""} | ${SITE_NAME}`;
  const description = `Compare prices for ${title} across multiple retailers. Find the best deal, read reviews, and buy with confidence.`;
  return {
    title: metaTitle,
    description,
    openGraph: { title: metaTitle, description, type: "website", siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title: metaTitle, description },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productJsonLd(
  title: string,
  price: number,
  currency: string,
  rating?: number,
  reviewCount?: number,
  image?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: image ? [image] : undefined,
    aggregateRating:
      rating && reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
          }
        : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: currency,
      lowPrice: price,
      availability: "https://schema.org/InStock",
    },
  };
}
