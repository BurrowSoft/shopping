import { createHmac } from "crypto";

const BASE = "https://api.lazada.co.th/rest";
const API_PATH = "/marketing/getlink";

function sign(secret: string, apiPath: string, params: Record<string, string>): string {
  // Lazada signature: api_path + sorted_params_key+value concatenated
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  const message = `${apiPath}${sorted}`;
  return createHmac("sha256", secret).update(message).digest("hex").toUpperCase();
}

/**
 * Convert up to 100 Lazada product URLs into affiliate tracking links.
 * Returns a map of original URL → affiliate URL (or original if conversion failed).
 */
export async function getLazadaAffiliateLinks(
  urls: string[]
): Promise<Record<string, string>> {
  const appKey = process.env.LAZADA_APP_KEY;
  const appSecret = process.env.LAZADA_APP_SECRET;
  const userToken = process.env.LAZADA_USER_TOKEN;

  if (!appKey || !appSecret || !userToken || urls.length === 0) {
    return {};
  }

  const timestamp = String(Date.now());
  const params: Record<string, string> = {
    app_key: appKey,
    timestamp,
    sign_method: "sha256",
    userToken,
    inputType: "url",
    inputValue: urls.join(","),
  };

  params.sign = sign(appSecret, API_PATH, params);

  const qs = new URLSearchParams(params as Record<string, string>);
  const url = `${BASE}${API_PATH}?${qs}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("[Lazada Affiliate] API error:", res.status);
      return {};
    }
    const json = await res.json() as {
      code: string;
      data?: {
        urlBatchGetLinkInfoList?: Array<{
          originalUrl: string;
          regularPromotionLink: string;
        }>;
      };
    };

    if (json.code !== "0" && json.code !== "200") {
      console.error("[Lazada Affiliate] API error code:", json.code);
      return {};
    }

    const map: Record<string, string> = {};
    for (const item of json.data?.urlBatchGetLinkInfoList ?? []) {
      if (item.originalUrl && item.regularPromotionLink) {
        map[item.originalUrl] = item.regularPromotionLink;
      }
    }
    return map;
  } catch (err) {
    console.error("[Lazada Affiliate] fetch error:", err);
    return {};
  }
}

/** Returns true if this URL is a Lazada Thailand product page. */
export function isLazadaThUrl(url: string): boolean {
  return url.includes("lazada.co.th");
}

// ─── Shopee Thailand ────────────────────────────────────────────────────────

/**
 * Wraps a shopee.co.th URL in Shopee's official affiliate redirect format:
 *   https://s.shopee.co.th/an_redir?origin_link={encoded_url}&affiliate_id={id}
 *
 * Shopee injects uls_trackid and utm_term automatically on redirect — proper
 * commission attribution with no API call needed.
 *
 * Env: SHOPEE_AFFILIATE_ID (numeric, e.g. 15128610001 — strip the "an_" prefix)
 */
export function buildShopeeAffiliateUrl(url: string): string {
  const affiliateId = process.env.SHOPEE_AFFILIATE_ID;
  if (!affiliateId || !url.includes("shopee.co.th")) return url;

  try {
    // Strip any existing tracking params before wrapping
    const parsed = new URL(url);
    ["uls_trackid", "gads_t_sig", "utm_term", "utm_source", "utm_medium",
     "utm_campaign", "utm_content", "mmp_pid", "__mobile__"].forEach((p) =>
      parsed.searchParams.delete(p)
    );
    const encoded = encodeURIComponent(parsed.toString());
    return `https://s.shopee.co.th/an_redir?origin_link=${encoded}&affiliate_id=${affiliateId}`;
  } catch {
    return url;
  }
}

/** Returns true if this URL is a Shopee Thailand product page. */
export function isShopeeThUrl(url: string): boolean {
  return url.includes("shopee.co.th");
}

// ─── Priceza Publisher Network (PSPN) — BNN + Powerbuy ──────────────────────
// Both retailers use AppsFlyer + Priceza tracking.
// Publisher ID: PSPN_PUBLISHER_ID (e.g. 140450)
// BNN site ID:      301266
// Powerbuy site ID: 301296 (prefixed with "U" in af_siteid)

function generatePzClickId(siteId: string): string {
  // Format: r-th--{SITE_ID}--{UUID_no_hyphens}--{hex_timestamp}
  const uuid = crypto.randomUUID().replace(/-/g, "");
  const ts = Date.now().toString(16);
  return `r-th--${siteId}--${uuid}--${ts}`;
}

function buildPspnUrl(url: string, siteId: string, extraParams: Record<string, string> = {}): string {
  const publisherId = process.env.PSPN_PUBLISHER_ID;
  if (!publisherId) return url;
  try {
    const parsed = new URL(url);
    // Strip any existing tracking params
    ["utm_source", "utm_medium", "utm_campaign", "af_siteid", "c",
     "pzclickid", "clickid", "pid", "af_click_lookback", "af_xp",
     "af_dp", "deep_link_value", "openExternalBrowser", "af_reengagement_window",
     "is_retargeting", "af_force_deeplink"].forEach((p) =>
      parsed.searchParams.delete(p)
    );
    // Set affiliate params
    parsed.searchParams.set("utm_source", `pspn-support-${publisherId}`);
    parsed.searchParams.set("utm_medium", "web");
    parsed.searchParams.set("utm_campaign", "na");
    parsed.searchParams.set("c", `pspn-support-${publisherId}`);
    parsed.searchParams.set("pzclickid", generatePzClickId(siteId));
    for (const [k, v] of Object.entries(extraParams)) {
      parsed.searchParams.set(k, v);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function buildBnnAffiliateUrl(url: string): string {
  return buildPspnUrl(url, "301266", { af_siteid: "301266" });
}

export function buildPowerbuyAffiliateUrl(url: string): string {
  return buildPspnUrl(url, "301296", {
    af_siteid: "U301296",
    pid: "priceza_int",
    af_click_lookback: "30d",
  });
}

export function isBnnUrl(url: string): boolean {
  return url.includes("bnn.in.th");
}

export function isPowerbuyUrl(url: string): boolean {
  return url.includes("powerbuy.co.th");
}

export function buildLotussAffiliateUrl(url: string): string {
  return buildPspnUrl(url, "20005", {
    af_siteid: "20005",
    pid: "priceza_int",
    af_click_lookback: "30d",
  });
}

export function isLotussUrl(url: string): boolean {
  return url.includes("lotuss.com");
}

// ─── eBay — eBay Partner Network (EPN) ───────────────────────────────────────
// campid=5339155714 is your EPN campaign ID — stays the same across all eBay sites
// Env: EBAY_CAMPAIGN_ID

export function buildEbayAffiliateUrl(url: string): string {
  const campId = process.env.EBAY_CAMPAIGN_ID;
  if (!campId || !url.includes("ebay.")) return url;
  try {
    const parsed = new URL(url);
    // Strip any existing EPN params
    ["mkcid", "mkrid", "siteid", "campid", "toolid", "customid", "mkevt"].forEach((p) =>
      parsed.searchParams.delete(p)
    );
    parsed.searchParams.set("campid", campId);
    parsed.searchParams.set("mkcid", "1");
    parsed.searchParams.set("mkrid", "711-53200-19255-0");
    parsed.searchParams.set("siteid", "0");
    parsed.searchParams.set("toolid", "20014");
    parsed.searchParams.set("mkevt", "1");
    return parsed.toString();
  } catch {
    return url;
  }
}

export function isEbayUrl(url: string): boolean {
  return url.includes("ebay.");
}
