export { SerpApiShoppingProvider } from "./serpapi";
export type { ShoppingProvider } from "./types";

import { ProviderRouter } from "../base";
import { SerpApiShoppingProvider } from "./serpapi";
import type { ShoppingSearchParams, Product } from "../../types";

export function createShoppingRouter(): ProviderRouter<ShoppingSearchParams, Product> {
  const providers: SerpApiShoppingProvider[] = [];
  if (process.env.SERPAPI_KEY) {
    providers.push(new SerpApiShoppingProvider(process.env.SERPAPI_KEY));
  }
  return new ProviderRouter(providers);
}

export function createShoppingProvider(): SerpApiShoppingProvider | null {
  if (!process.env.SERPAPI_KEY) return null;
  return new SerpApiShoppingProvider(process.env.SERPAPI_KEY);
}
