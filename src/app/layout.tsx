import type { ReactNode } from "react";

// Thin root layout — serves api/ routes and next.js internals only.
// All HTML structure lives in [locale]/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}
