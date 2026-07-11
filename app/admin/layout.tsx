import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backoffice",
  robots: { index: false, follow: false },
};

// The backoffice reads and writes the JSON store on every request; never cache.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
