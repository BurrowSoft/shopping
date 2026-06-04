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
