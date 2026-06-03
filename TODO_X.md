# TODO_X: SEO — Google Crawlability & Structured Data

## App: shopping (https://www.shoppingmole.com)

## Permissions
Run with: `claude --dangerously-skip-permissions`

## Do NOT fill a Reports file for this TODO. Just commit and push when done.

## Overview
Three SEO tasks. Do all three. Do NOT change any existing functionality, API routes, or UI.

---

## Task 1 — WebSite JSON-LD in layout.tsx

Add a `<script type="application/ld+json">` tag inside the `<body>` of`src/app/layout.tsx`.

`	sx
const WEBSITE_SCHEMA = { /* see App-specific section below */ };

// Inside the layout return, inside <body>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
/>
`"

---

## Task 2 — hreflang alternate links

Add to the root `metadata` export in `src/app/layout.tsx`:

`	s
alternates: {
  languages: {
    "en": "https://www.shoppingmole.com",
    "th": "https://www.shoppingmole.com",
    "es": "https://www.shoppingmole.com",
    "ru": "https://www.shoppingmole.com",
    "pt-BR": "https://www.shoppingmole.com",
    "fr": "https://www.shoppingmole.com",
    "ja": "https://www.shoppingmole.com",
    "zh": "https://www.shoppingmole.com",
    "zh-TW": "https://www.shoppingmole.com",
    "ar": "https://www.shoppingmole.com",
    "de": "https://www.shoppingmole.com",
    "id": "https://www.shoppingmole.com",
    "ko": "https://www.shoppingmole.com",
    "it": "https://www.shoppingmole.com",
    "vi": "https://www.shoppingmole.com",
    "x-default": "https://www.shoppingmole.com",
  },
},
`"

---

## Task 3 — robots.ts audit

See App-specific section for exact disallow rules.

---

## App-specific: shopping

### WebSite schema for Task 1

```ts
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ShoppingMole",
  "url": "https://www.shoppingmole.com",
  "description": "Compare prices and find the best deals from top online stores.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.shoppingmole.com/search?q={search_term}"
    },
    "query-input": "required name=search_term"
  }
};
```

### robots.ts

Disallow: `["/api/", "/_next/", "/search"]`

---

## Commit and push

```bash
git add -A
git commit -m "seo: JSON-LD structured data, hreflang, robots.txt"
git push origin master
vercel deploy --prod --yes --scope burrowsoft
```