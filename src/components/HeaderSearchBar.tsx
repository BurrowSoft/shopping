"use client";

import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "./SearchBar";

export function HeaderSearchBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (pathname === "/") return null;
  const q = searchParams.get("q") ?? "";
  return (
    <div className="flex-1 max-w-2xl">
      <SearchBar defaultValue={q} key={q} />
    </div>
  );
}
