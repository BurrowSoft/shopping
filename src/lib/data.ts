export interface Category {
  slug: string;
  label: string;
  icon: string;
  query: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { slug: "electronics", label: "Electronics", icon: "💻", query: "electronics deals", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { slug: "smartphones", label: "Smartphones", icon: "📱", query: "smartphone best price", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { slug: "fashion", label: "Fashion", icon: "👗", query: "fashion clothing deals", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { slug: "home", label: "Home & Garden", icon: "🏡", query: "home garden deals", color: "bg-green-50 text-green-700 border-green-200" },
  { slug: "sports", label: "Sports", icon: "⚽", query: "sports equipment deals", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { slug: "beauty", label: "Beauty", icon: "💄", query: "beauty skincare deals", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { slug: "gaming", label: "Gaming", icon: "🎮", query: "gaming console deals", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { slug: "toys", label: "Toys & Kids", icon: "🧸", query: "toys kids deals", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { slug: "books", label: "Books", icon: "📚", query: "bestseller books", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { slug: "kitchen", label: "Kitchen", icon: "🍳", query: "kitchen appliances deals", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { slug: "tools", label: "Tools & DIY", icon: "🔧", query: "tools hardware deals", color: "bg-slate-50 text-slate-700 border-slate-200" },
  { slug: "pets", label: "Pets", icon: "🐾", query: "pet supplies deals", color: "bg-lime-50 text-lime-700 border-lime-200" },
];

export const TRENDING_SEARCHES = [
  "iPhone 15 Pro",
  "Samsung Galaxy S24",
  "AirPods Pro",
  "Nintendo Switch",
  "Dyson vacuum",
  "Stanley tumbler",
  "MacBook Air M3",
  "Sony WH-1000XM5",
  "Instant Pot",
  "Kindle Paperwhite",
  "PlayStation 5",
  "LEGO sets",
];

export const FEATURES = [
  {
    icon: "🔍",
    title: "Real-Time Price Comparison",
    description:
      "We search Amazon, eBay, Walmart, Best Buy, and 500+ more stores simultaneously so you always see the lowest price.",
  },
  {
    icon: "⭐",
    title: "Verified Reviews",
    description:
      "Aggregate ratings from multiple platforms so you can trust the scores and make confident buying decisions.",
  },
  {
    icon: "🏷️",
    title: "Deal Alerts",
    description:
      "Prices updated every 5 minutes. You always see the most current deal — no stale data.",
  },
  {
    icon: "🚚",
    title: "Delivery Info Included",
    description:
      "See free shipping, Prime eligibility, and estimated delivery dates right in the search results.",
  },
];
