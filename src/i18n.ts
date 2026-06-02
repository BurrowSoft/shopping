import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const SUPPORTED = ["en", "th"] as const;
type Locale = (typeof SUPPORTED)[number];

function isSupported(v: string | undefined): v is Locale {
  return SUPPORTED.includes(v as Locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const hdrs = await headers();

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const country =
    hdrs.get("x-vercel-ip-country") ?? hdrs.get("cf-ipcountry") ?? "US";

  const raw = isSupported(cookieLocale)
    ? cookieLocale
    : country === "TH"
    ? "th"
    : "en";

  const locale: Locale = isSupported(raw) ? raw : "en";

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
