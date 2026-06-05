import type { Metadata } from "next";
import { headers } from "next/headers";
import { Link } from "@/i18n/navigation";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { PriceCompareTable } from "@/components/PriceCompareTable";
import { StarRating } from "@/components/StarRating";
import {
  buildProductMetadata,
  SITE_NAME,
  SITE_URL,
  breadcrumbJsonLd,
  productJsonLd,
} from "@/lib/seo";
import { getCurrencyForCountry } from "@/lib/currency";
import { createShoppingProvider, detectCountry } from "@burrowsoft/shared";

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ title?: string; q?: string; link?: string; source?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { title } = await searchParams;
  const { id } = await params;
  if (!title && !id) return { title: `Product | ${SITE_NAME}` };
  return buildProductMetadata(title ?? id);
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { title: titleParam, q: backQuery, link: fallbackLink, source: fallbackSource } =
    await searchParams;

  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  const currencyInfo = getCurrencyForCountry(country);

  const provider = createShoppingProvider();

  const product = provider
    ? await provider.getProductDetail(decodeURIComponent(id), currencyInfo.code)
    : null;

  if (!product) {
    const title = titleParam ?? decodeURIComponent(id);
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-5xl mb-6">🛍️</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">{title}</h1>
        <p className="text-slate-500 mb-8 text-sm">
          Detailed price comparison isn&apos;t available for this product right now.
        </p>
        {fallbackLink && (
          <a
            href={fallbackLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-base font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            Buy on {fallbackSource || "Retailer"}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {backQuery && (
          <div className="mt-6">
            <Link href={`/search?q=${encodeURIComponent(backQuery)}`} className="text-sm text-violet-600 hover:underline">
              ← Back to results for &ldquo;{backQuery}&rdquo;
            </Link>
          </div>
        )}
      </div>
    );
  }

  const lowestOffer = [...product.offers].sort((a, b) => a.price.amount - b.price.amount)[0];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    ...(backQuery ? [{ name: `"${backQuery}"`, url: `${SITE_URL}/search?q=${encodeURIComponent(backQuery)}` }] : []),
    { name: product.title, url: `${SITE_URL}/product/${id}` },
  ]);

  const productLd = productJsonLd(
    product.title, product.price.amount, currencyInfo.code,
    product.rating, product.reviewCount, product.thumbnail || undefined
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-violet-600 transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            {backQuery && (
              <>
                <li>
                  <Link href={`/search?q=${encodeURIComponent(backQuery)}`} className="hover:text-violet-600 transition-colors">
                    &ldquo;{backQuery}&rdquo;
                  </Link>
                </li>
                <li aria-hidden>/</li>
              </>
            )}
            <li className="text-slate-600 font-medium truncate max-w-xs">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div><ProductImageGallery images={product.images} title={product.title} /></div>
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-500">{product.source}</p>
              <h1 className="text-2xl font-bold text-slate-900 leading-snug">{product.title}</h1>
            </div>
            {product.rating !== undefined && (
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            )}
            <div className="rounded-xl bg-violet-50 border border-violet-100 px-5 py-4">
              <p className="text-xs text-violet-500 mb-1">Lowest price found</p>
              <p className="text-4xl font-extrabold text-violet-700">
                {lowestOffer?.price.formatted ?? product.price.formatted}
              </p>
              {lowestOffer && <p className="mt-1 text-sm text-slate-500">at {lowestOffer.retailer}</p>}
              {lowestOffer?.delivery && <p className="mt-1 text-xs font-medium text-green-600">{lowestOffer.delivery}</p>}
              {lowestOffer && (
                <a
                  href={lowestOffer.link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-base font-semibold text-white hover:bg-violet-700 transition-colors"
                >
                  Buy on {lowestOffer.retailer}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
            {product.highlights && product.highlights.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-700">Highlights</h2>
                <ul className="space-y-1">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-violet-400">✓</span>{h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.description && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-slate-700">Description</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {product.offers.length > 0 && (
          <div className="mt-10"><PriceCompareTable offers={product.offers} /></div>
        )}

        <section className="mt-10 rounded-xl border border-slate-100 bg-white p-6">
          <h2 className="mb-3 text-base font-semibold text-slate-700">About this product</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {SITE_NAME} found {product.offers.length} store{product.offers.length !== 1 ? "s" : ""}{" "}
            selling &ldquo;{product.title}&rdquo;. The lowest price is{" "}
            <strong>{lowestOffer?.price.formatted ?? product.price.formatted}</strong>.
          </p>
          {backQuery && (
            <Link href={`/search?q=${encodeURIComponent(backQuery)}`} className="mt-3 inline-block text-sm text-violet-600 hover:underline">
              ← Back to results for &ldquo;{backQuery}&rdquo;
            </Link>
          )}
        </section>
      </div>
    </>
  );
}
