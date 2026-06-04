import Image from "next/image";

// Campaign: Lazada ALP "Hot Deals up to 80% Off"
// Link expires: 31 July 2026 — update link + image when renewed
const AFFILIATE_LINK =
  "https://s.lazada.co.th/s.Zh9y6P?c=a&t=ntv-t1_alp-native&sub_id1=shoppingmole&sub_id2=home_banner";

export function LazadaDealsBanner() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <a
        href={AFFILIATE_LINK}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group block overflow-hidden rounded-2xl shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
        aria-label="Lazada — Hot Deals up to 80% off. Shop Now."
      >
        <Image
          src="/banners/lazada-th-deals.jpg"
          alt="Lazada — Hot Deals and Top Selling Items Up to 80% Off"
          width={1280}
          height={320}
          className="w-full h-auto"
          priority
        />
      </a>
      <p className="mt-1.5 text-right text-xs text-slate-400">Sponsored</p>
    </div>
  );
}
