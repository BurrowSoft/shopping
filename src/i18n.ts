import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const SUPPORTED = [
  "en", "th", "es", "ru", "pt-BR", "fr", "ja", "zh", "zh-TW", "ar", "de", "id", "ko", "it", "vi",
] as const;

type Locale = (typeof SUPPORTED)[number];

const COUNTRY_LOCALE: Record<string, Locale> = {
  TH: "th",
  // Spanish
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", UY: "es", EC: "es",
  // Portuguese (Brazilian)
  BR: "pt-BR", PT: "pt-BR",
  // French
  FR: "fr", BE: "fr", CH: "fr", CA: "fr", SN: "fr", CI: "fr",
  // Japanese
  JP: "ja",
  // Chinese Simplified
  CN: "zh",
  // Chinese Traditional
  TW: "zh-TW", HK: "zh-TW", MO: "zh-TW",
  // Arabic
  SA: "ar", AE: "ar", EG: "ar", KW: "ar", QA: "ar", BH: "ar", OM: "ar", JO: "ar", LB: "ar",
  MA: "ar", DZ: "ar", TN: "ar", LY: "ar", YE: "ar", IQ: "ar", SY: "ar", SD: "ar",
  // German
  DE: "de", AT: "de",
  // Indonesian
  ID: "id",
  // Korean
  KR: "ko",
  // Italian
  IT: "it",
  // Vietnamese
  VN: "vi",
  // Russian
  RU: "ru", UA: "ru", KZ: "ru", BY: "ru",
};

function isSupported(v: string | undefined): v is Locale {
  return SUPPORTED.includes(v as Locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const hdrs = await headers();

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const country = hdrs.get("x-vercel-ip-country") ?? hdrs.get("cf-ipcountry") ?? "US";

  const locale: Locale = isSupported(cookieLocale)
    ? cookieLocale
    : (COUNTRY_LOCALE[country] ?? "en");

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
