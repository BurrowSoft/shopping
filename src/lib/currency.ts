export interface CurrencyInfo {
  code: string;
  rate: number;
  locale: string;
}

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD", CA: "CAD", MX: "MXN",
  BR: "BRL", AR: "ARS", CO: "COP", PE: "PEN", CL: "CLP",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
  AT: "EUR", PT: "EUR", FI: "EUR", IE: "EUR", GR: "EUR", HR: "EUR",
  GB: "GBP", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN",
  CZ: "CZK", HU: "HUF", RO: "RON",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD",
  JP: "JPY", CN: "CNY", KR: "KRW", HK: "HKD", TW: "TWD",
  SG: "SGD", MY: "MYR", TH: "THB", ID: "IDR", PH: "PHP", VN: "VND",
  IN: "INR", PK: "PKR",
  ZA: "ZAR", NG: "NGN", KE: "KES", EG: "EGP",
  AU: "AUD", NZ: "NZD",
};

const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149, CNY: 7.24, AUD: 1.53,
  CAD: 1.36, CHF: 0.89, SEK: 10.4, NOK: 10.5, DKK: 6.9, NZD: 1.63,
  SGD: 1.34, HKD: 7.82, KRW: 1320, INR: 83, BRL: 4.97, MXN: 17.2,
  AED: 3.67, SAR: 3.75, QAR: 3.64, KWD: 0.307, ILS: 3.7, TRY: 32.5,
  ZAR: 18.6, EGP: 48.5, TWD: 31.6, THB: 35.8, MYR: 4.7, IDR: 15700,
  PHP: 56.5, VND: 24800, PKR: 278, PLN: 3.97, CZK: 23.2, HUF: 356,
  RON: 4.6, ARS: 870, COP: 3950, CLP: 930, PEN: 3.72,
};

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP", CNY: "zh-CN",
  AUD: "en-AU", CAD: "en-CA", CHF: "de-CH", SEK: "sv-SE", NOK: "nb-NO",
  DKK: "da-DK", NZD: "en-NZ", SGD: "en-SG", HKD: "zh-HK", KRW: "ko-KR",
  INR: "en-IN", BRL: "pt-BR", MXN: "es-MX", AED: "ar-AE", SAR: "ar-SA",
  QAR: "ar-QA", KWD: "ar-KW", TWD: "zh-TW", THB: "th-TH", MYR: "ms-MY",
  IDR: "id-ID", PHP: "fil-PH", VND: "vi-VN", PKR: "ur-PK", PLN: "pl-PL",
  CZK: "cs-CZ", HUF: "hu-HU", RON: "ro-RO", ARS: "es-AR", COP: "es-CO",
  CLP: "es-CL", PEN: "es-PE",
};

export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  const code = COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? "USD";
  const rate = RATES[code] ?? 1;
  const locale = CURRENCY_LOCALE[code] ?? "en-US";
  return { code, rate, locale };
}

export function formatPrice(amountUsd: number, currency: CurrencyInfo): string {
  const converted = Math.round(amountUsd * currency.rate);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    return `${currency.code} ${converted.toLocaleString()}`;
  }
}
