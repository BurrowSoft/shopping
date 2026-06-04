import { unstable_cache } from "next/cache";
import { createShoppingRouter, summarize } from "@burrowsoft/shared";
import type { Product, AISummary } from "@burrowsoft/shared";
import {
  getLazadaAffiliateLinks,
  isLazadaThUrl,
  buildShopeeAffiliateUrl,
  isShopeeThUrl,
} from "@/lib/lazada-affiliate";

interface ProductsResponse {
  products: Product[];
  summary: AISummary | null;
}

/** True if the string contains at least one Thai character (U+0E00–U+0E7F). */
function hasThai(s: string): boolean {
  return /[฀-๿]/.test(s);
}

// Colloquial Thai terms that Shopee/Lazada sellers actually use in listings.
// Prioritise what shoppers type, not dictionary-correct translations.
const THAI_DICT: Record<string, string> = {
  // Beauty — sellers use แต้งหน้า not เครื่องสำอาง
  makeup: "แต้งหน้า", "make-up": "แต้งหน้า",
  cosmetics: "เครื่องสำอาง", beauty: "ความงาม",
  lipstick: "ลิปสติก", "lip gloss": "ลิปกลอส", "lip tint": "ลิปทินต์",
  foundation: "รองพื้น", "bb cream": "บีบีครีม", concealer: "คอนซีลเลอร์",
  mascara: "มาสคาร่า", eyeliner: "อายไลเนอร์", eyeshadow: "อายแชโดว์",
  blush: "บลัชออน", highlighter: "ไฮไลท์เตอร์", contour: "คอนทัวร์",
  // Skincare — loanwords dominate on Shopee
  skincare: "สกินแคร์", moisturizer: "มอยส์เจอร์ไรเซอร์",
  sunscreen: "กันแดด", "sun cream": "กันแดด",
  serum: "เซรั่ม", toner: "โทนเนอร์", cleanser: "คลีนเซอร์",
  "face wash": "โฟมล้างหน้า", mask: "มาส์กหน้า",
  // Phones — มือถือ is what everyone searches, not โทรศัพท์
  phone: "มือถือ", smartphone: "มือถือ", mobile: "มือถือ",
  iphone: "ไอโฟน", samsung: "ซัมซุง", android: "แอนดรอยด์",
  // Computers
  laptop: "โน้ตบุ๊ก", notebook: "โน้ตบุ๊ก", computer: "คอมพิวเตอร์",
  tablet: "แท็บเล็ต", ipad: "ไอแพด",
  // Audio
  headphone: "หูฟัง", headphones: "หูฟัง", earphone: "หูฟัง",
  earbuds: "หูฟังไร้สาย", "wireless earbuds": "หูฟังไร้สาย",
  // Fashion — colloquial terms
  shoes: "รองเท้า", sneakers: "รองเท้าผ้าใบ", heels: "รองเท้าส้นสูง",
  sandals: "รองเท้าแตะ", boots: "บูท",
  bag: "กระเป๋า", handbag: "กระเป๋าถือ", backpack: "กระเป๋าเป้",
  wallet: "กระเป๋าสตางค์",
  shirt: "เสื้อ", "t-shirt": "เสื้อยืด", dress: "ชุดเดรส",
  jeans: "กางเกงยีนส์", pants: "กางเกง", skirt: "กระโปรง",
  // Electronics
  watch: "นาฬิกา", smartwatch: "สมาร์ทวอทช์",
  camera: "กล้อง", tv: "ทีวี", television: "ทีวี",
  refrigerator: "ตู้เย็น", "washing machine": "เครื่องซักผ้า",
  "air conditioner": "แอร์", fan: "พัดลม",
  gaming: "เกมมิ่ง", keyboard: "คีย์บอร์ด", mouse: "เมาส์",
  // Health & wellness
  supplement: "อาหารเสริม", vitamin: "วิตามิน", protein: "โปรตีน",
  // Personal care
  perfume: "น้ำหอม", shampoo: "แชมพู", conditioner: "ครีมนวด",
  // Home & misc
  toy: "ของเล่น", book: "หนังสือ", furniture: "เฟอร์นิเจอร์",
};

function dictLookup(query: string): string | null {
  const q = query.toLowerCase().trim();
  return THAI_DICT[q] ?? null;
}

/**
 * Translate a short query to Thai using OpenAI.
 * Returns null if the key is missing or the call fails.
 */
async function translateToThai(query: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Translate the product search query to Thai. Reply with ONLY the Thai translation, nothing else.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 60,
        temperature: 0,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json() as { choices: Array<{ message: { content: string } }> };
    return json.choices[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

function makeCachedSearch(query: string, country: string, currency: string) {
  return unstable_cache(
    async (): Promise<Product[]> => {
      const router = createShoppingRouter();
      return router.search({ query, country, currency }, country);
    },
    [`products:${query}:${country}`],
    { revalidate: 300 }
  );
}

/** Merge two product arrays, deduplicated by title+source. */
function mergeProducts(a: Product[], b: Product[]): Product[] {
  const seen = new Set(a.map((p) => `${p.title.toLowerCase()}|${p.source.toLowerCase()}`));
  const unique = b.filter((p) => {
    const key = `${p.title.toLowerCase()}|${p.source.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Interleave: one from b for every two from a so Thai results surface early
  const merged: Product[] = [];
  let ai = 0, bi = 0;
  while (ai < a.length || bi < unique.length) {
    if (ai < a.length) merged.push(a[ai++]);
    if (ai < a.length) merged.push(a[ai++]);
    if (bi < unique.length) merged.push(unique[bi++]);
  }
  return merged;
}

/** Replace Lazada + Shopee links with affiliate tracking links for Thai users. */
async function applyThaiAffiliateLinks(products: Product[]): Promise<Product[]> {
  const withShopee = products.map((p) => ({
    ...p,
    link: isShopeeThUrl(p.link) ? buildShopeeAffiliateUrl(p.link) : p.link,
    offers: p.offers.map((o) => ({
      ...o,
      link: isShopeeThUrl(o.link) ? buildShopeeAffiliateUrl(o.link) : o.link,
    })),
  }));

  const lazadaUrls = withShopee
    .flatMap((p) => [p.link, p.offers[0]?.link ?? ""])
    .filter((url) => url && isLazadaThUrl(url));

  if (lazadaUrls.length === 0) return withShopee;

  const affiliateMap = await getLazadaAffiliateLinks(lazadaUrls);
  if (Object.keys(affiliateMap).length === 0) return withShopee;

  return withShopee.map((p) => ({
    ...p,
    link: affiliateMap[p.link] ?? p.link,
    offers: p.offers.map((o) => ({
      ...o,
      link: affiliateMap[o.link] ?? o.link,
    })),
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const country = searchParams.get("country") ?? "US";
  const currency = searchParams.get("currency") ?? "USD";

  if (!q) {
    return Response.json({ products: [], summary: null });
  }

  try {
    let products: Product[];

    if (country === "TH" && !hasThai(q)) {
      // 1. Check static dictionary first (instant, no API cost)
      // 2. Fall back to OpenAI translation if not found
      // Both run in parallel with the English query
      const dictResult = dictLookup(q);
      const [thaiQuery, englishResults] = await Promise.all([
        dictResult ? Promise.resolve(dictResult) : translateToThai(q),
        makeCachedSearch(q, country, currency)(),
      ]);

      if (thaiQuery) {
        const thaiResults = await makeCachedSearch(thaiQuery, country, currency)();
        products = mergeProducts(englishResults, thaiResults);
      } else {
        products = englishResults;
      }
    } else {
      products = await makeCachedSearch(q, country, currency)();
    }

    const summary = await summarize("shopping", products, country);

    const finalProducts =
      country === "TH"
        ? await applyThaiAffiliateLinks(products)
        : products;

    return Response.json({ products: finalProducts, summary });
  } catch {
    return Response.json({ products: [], summary: null }, { status: 500 });
  }
}
