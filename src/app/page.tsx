import type { Metadata } from "next";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { AdUnit } from "@/components/AdUnit";
import { CATEGORIES, TRENDING_SEARCHES, FEATURES } from "@/lib/data";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Compare Prices Across Hundreds of Stores`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
};

const stats = [
  { value: "500+", label: "Stores compared" },
  { value: "1B+", label: "Products indexed" },
  { value: "5min", label: "Price refresh rate" },
  { value: "$0", label: "Always free" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-purple-600 pb-24 pt-16"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1
            id="hero-heading"
            className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Find the Best Price <br />
            <span className="text-violet-200">on Anything, Instantly</span>
          </h1>
          <p className="mb-10 text-lg text-violet-100 sm:text-xl">
            Compare prices across Amazon, eBay, Walmart, Best Buy, and 500+ stores in one search.
          </p>
          <div className="mx-auto max-w-2xl">
            <SearchBar large />
          </div>

          {/* Trending pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-violet-300 mr-1">Trending:</span>
            {TRENDING_SEARCHES.slice(0, 6).map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="rounded-full bg-white/10 px-3 py-1 text-sm text-violet-100 hover:bg-white/20 transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white" aria-label="Platform statistics">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-3xl font-extrabold text-violet-600">{stat.value}</dt>
                <dd className="mt-1 text-sm text-slate-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="mb-2 text-2xl font-bold text-slate-900">
          Browse by Category
        </h2>
        <p className="mb-8 text-slate-500">
          Find the best prices across all product categories.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?q=${encodeURIComponent(cat.query)}`}
              className={`group flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${cat.color}`}
              aria-label={cat.label}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-semibold">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Ad */}
      <div className="mx-auto max-w-5xl px-4 py-2">
        <AdUnit slot="HOME_BANNER_SLOT" format="horizontal" />
      </div>

      {/* Features */}
      <section className="bg-white py-14" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4">
          <h2 id="features-heading" className="mb-2 text-center text-2xl font-bold text-slate-900">
            Why {SITE_NAME}?
          </h2>
          <p className="mb-10 text-center text-slate-500">
            The smarter way to shop online — always find the lowest price.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-1 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending searches */}
      <section className="mx-auto max-w-7xl px-4 py-14" aria-labelledby="trending-heading">
        <h2 id="trending-heading" className="mb-6 text-xl font-bold text-slate-900">
          Trending Searches
        </h2>
        <div className="flex flex-wrap gap-3">
          {TRENDING_SEARCHES.map((s) => (
            <Link
              key={s}
              href={`/search?q=${encodeURIComponent(s)}`}
              className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* SEO content */}
      <section className="mx-auto max-w-4xl px-4 py-14" aria-labelledby="seo-content-heading">
        <h2 id="seo-content-heading" className="mb-4 text-xl font-bold text-slate-900">
          How to Find the Best Price Online
        </h2>
        <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-3">
          <p>
            {SITE_NAME} is a free shopping search engine that compares prices across hundreds of
            online stores in real time. Whether you&apos;re buying{" "}
            <Link href="/search?q=smartphone+best+price" className="text-violet-600 hover:underline">
              smartphones
            </Link>
            ,{" "}
            <Link href="/search?q=laptop+deals" className="text-violet-600 hover:underline">
              laptops
            </Link>
            , or{" "}
            <Link href="/search?q=home+garden+deals" className="text-violet-600 hover:underline">
              home appliances
            </Link>
            , we instantly surface the lowest price across Amazon, eBay, Walmart, Best Buy, and
            500+ other retailers.
          </p>
          <p>
            Price comparison shopping can save you 20–40% on everyday purchases. Our engine updates
            prices every 5 minutes, so you always see current deals — never outdated data. We also
            show delivery costs, free shipping eligibility, and product ratings so you can make
            truly informed buying decisions.
          </p>
          <p>
            To get the best deal, search for the exact product name or model number. You can filter
            results by price range, star rating, and delivery options. Click any result to see a
            full price breakdown across all available retailers, complete with user reviews and
            product specifications.
          </p>
        </div>
      </section>
    </>
  );
}
