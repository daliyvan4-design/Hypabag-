import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Votre sélection",
  robots: { index: false },
};

export default function PanierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
