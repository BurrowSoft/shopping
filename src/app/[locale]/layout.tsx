import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import {
  Sarabun,
  Noto_Sans_JP,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Noto_Sans_KR,
  Noto_Sans_Arabic,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_DESCRIPTION, websiteJsonLd } from "@/lib/seo";
import { getCurrencyForCountry } from "@/lib/currency";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { SearchBar } from "@/components/SearchBar";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { detectCountry, RegionalFloatingAd } from "@burrowsoft/shared";
import "../globals.css";

const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400", "600", "700"], display: "swap", variable: "--font-sarabun" });
const notoJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-jp" });
const notoSC = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-sc" });
const notoTC = Noto_Sans_TC({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-tc" });
const notoKR = Noto_Sans_KR({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-kr" });
const notoAR = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "700"], display: "swap", variable: "--font-noto-ar" });

const SCRIPT_FONT: Record<string, string> = {
  th: sarabun.variable,
  ja: notoJP.variable,
  zh: notoSC.variable,
  "zh-TW": notoTC.variable,
  ko: notoKR.variable,
  ar: notoAR.variable,
};

const BASE = "https://www.shoppingmole.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = locale === "en" ? `${BASE}/` : `${BASE}/${locale}/`;

  return {
    metadataBase: new URL(BASE),
    title: {
      default: `${SITE_NAME} — Compare Prices Across Hundreds of Stores`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
      "price comparison", "best deals", "cheapest price", "product comparison",
      "discount shopping", "online deals", "buy cheap", "price tracker", "shopping search engine",
    ],
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          l === "en" ? `${BASE}/` : `${BASE}/${l}/`,
        ])
      ),
    },
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — Compare Prices Across Hundreds of Stores`,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — Compare Prices Across Hundreds of Stores`,
      description: SITE_DESCRIPTION,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/favicon.ico", sizes: "16x16" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    verification: {
      google: "ZUD6hhvx3bUNKNxgTn77303ZxBB-F4U3_Y0knlguQdI",
    },
    other: { "google-adsense-account": "ca-pub-1009857008755875" },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true, follow: true,
        "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  const currency = getCurrencyForCountry(country);
  const messages = await getMessages();
  const t = await getTranslations("nav");
  const tf = await getTranslations("footer");

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={SCRIPT_FONT[locale] ?? ""}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
        <meta name="fo-verify" content="54470fe7-e39c-481c-8933-e4e830517781" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <nav
              className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3"
              aria-label="Main navigation"
            >
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 font-bold text-violet-600 text-xl"
              >
                <span aria-hidden>🛍️</span>
                {t("home")}
              </Link>
              <div className="flex-1 max-w-2xl">
                <SearchBar />
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-600 shrink-0">
                <Link href="/search?q=electronics+deals" className="hover:text-violet-600 transition-colors">
                  {t("electronics")}
                </Link>
                <Link href="/search?q=fashion+deals" className="hover:text-violet-600 transition-colors">
                  {t("fashion")}
                </Link>
                <Link href="/search?q=best+deals+today" className="hover:text-violet-600 transition-colors">
                  {t("deals")}
                </Link>
                <LocaleSwitch />
              </div>
            </nav>
          </header>

          <CurrencyProvider currency={currency}>
            <main>{children}</main>
          </CurrencyProvider>

          <footer className="mt-16 border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-10">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {tf("popularCategories")}
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><Link href="/search?q=smartphone+best+price" className="hover:text-violet-600">Smartphones</Link></li>
                    <li><Link href="/search?q=laptop+deals" className="hover:text-violet-600">Laptops</Link></li>
                    <li><Link href="/search?q=gaming+console+deals" className="hover:text-violet-600">Gaming</Link></li>
                    <li><Link href="/search?q=fashion+clothing+deals" className="hover:text-violet-600">Fashion</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {tf("topSearches")}
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><Link href="/search?q=iPhone+15+Pro" className="hover:text-violet-600">iPhone 15 Pro</Link></li>
                    <li><Link href="/search?q=AirPods+Pro" className="hover:text-violet-600">AirPods Pro</Link></li>
                    <li><Link href="/search?q=Nintendo+Switch" className="hover:text-violet-600">Nintendo Switch</Link></li>
                    <li><Link href="/search?q=Dyson+vacuum" className="hover:text-violet-600">Dyson Vacuum</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {tf("help")}
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><span className="text-slate-400">{tf("howItWorks")}</span></li>
                    <li><span className="text-slate-400">{tf("priceAlerts")}</span></li>
                    <li><span className="text-slate-400">{tf("browserExtension")}</span></li>
                    <li><a href={`mailto:${tf("support")}`} className="hover:text-violet-600 transition-colors">{tf("support")}</a></li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-bold text-violet-600">{SITE_NAME}</p>
                  <p className="mt-1 text-xs text-slate-400">{tf("tagline")}</p>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐾</span>
                    <span className="text-sm font-semibold text-slate-700">BurrowSoft</span>
                    <span className="text-xs text-slate-400">· {tf("burrowsoft")}</span>
                  </div>
                  <nav aria-label="BurrowSoft products" className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <a href="https://flymole.com" className="hover:text-violet-600 transition-colors">FlyMole</a>
                    <a href="https://bookingmole.com" className="hover:text-violet-600 transition-colors">BookingMole</a>
                    <a href="https://insightmole.com" className="hover:text-violet-600 transition-colors">InsightMole</a>
                    <a href="https://rentacarmole.com" className="hover:text-violet-600 transition-colors">RentACarMole</a>
                    <a href="https://gamesmole.com" className="hover:text-violet-600 transition-colors">GamesMole</a>
                  </nav>
                </div>
                <p className="mt-4 text-center text-xs text-slate-400">
                  {tf("copyright")}
                </p>
              </div>
            </div>
          </footer>
          <RegionalFloatingAd />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
