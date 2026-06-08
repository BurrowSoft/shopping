import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Image from "next/image";
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
import { HeaderSearchBar } from "@/components/HeaderSearchBar";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { detectCountry, getCountryName, AppHeader, AppFooter } from "@burrowsoft/shared";
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
  const hdrs = await headers();
  const country = detectCountry(Object.fromEntries(hdrs.entries()));
  const countryName = getCountryName(country);
  const desc = `Clean Search. NO ADS. No sign-up. Looking for the best prices in ${countryName}? ShoppingMole compares hundreds of stores instantly. Always free.`;

  return {
    metadataBase: new URL(BASE),
    title: {
      default: `Shopping Search in ${countryName} — Shopping Mole`,
      template: `%s | Shopping Mole`,
    },
    description: desc,
    keywords: ["price comparison","best deals","cheapest price","product comparison","discount shopping","online deals","buy cheap","price tracker","shopping search engine"],
    alternates: {
      canonical,
      languages: Object.fromEntries([
        ...routing.locales.map((l) => [l, l === "en" ? `${BASE}/` : `${BASE}/${l}/`]),
        ["x-default", `${BASE}/`],
      ]),
    },
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: `Shopping Search in ${countryName} — Shopping Mole`,
      description: desc,
    },
    twitter: {
      card: "summary_large_image",
      title: `Shopping Search in ${countryName} — Shopping Mole`,
      description: desc,
    },
    verification: { google: "ZUD6hhvx3bUNKNxgTn77303ZxBB-F4U3_Y0knlguQdI" },
    other: { "google-adsense-account": "ca-pub-1009857008755875" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1009857008755875"
          crossOrigin="anonymous"
        />
        <meta name="fo-verify" content="54470fe7-e39c-481c-8933-e4e830517781" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <AppHeader
            logo={
              <Link href="/" className="flex shrink-0 items-center gap-2.5">
                <Image src="/shopping.png" alt="ShoppingMole" width={40} height={40} className="shrink-0" priority />
                <span className="text-xl font-bold text-violet-600">{t("home")}</span>
              </Link>
            }
            expand={<HeaderSearchBar />}
            right={
              <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-600">
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
            }
          />

          <CurrencyProvider currency={currency}>
            <main>{children}</main>
          </CurrencyProvider>

          <AppFooter
            supportEmail="support@shoppingmole.com"
            accentHoverClass="hover:text-violet-600"
            currentSite="ShoppingMole"
          >
            <div className="grid grid-cols-2 gap-8 pb-4 sm:grid-cols-3">
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
                </ul>
              </div>
            </div>
          </AppFooter>

          {/* <RegionalFloatingAd /> */}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
