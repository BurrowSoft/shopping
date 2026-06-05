"use client";

import { usePathname } from "@/i18n/navigation";
import { SearchBar } from "./SearchBar";

export function HeaderSearchBar() {
  const pathname = usePathname();
  // Hide in the header on the home page — the hero already has a search bar
  if (pathname === "/") return null;
  return (
    <div className="flex-1 max-w-2xl">
      <SearchBar />
    </div>
  );
}
