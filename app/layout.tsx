import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  // Without the optical-size axis the display sizes render at text proportions,
  // and the headline no longer fits its two lines.
  axes: ["opsz"],
  display: "swap",
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "HYPA · Maroquinerie artisanale",
    template: "%s · HYPA",
  },
  description:
    "Des pièces tissées à la main à partir d'un unique cordon de coton tressé. Aucune machine. Aucune série. Une galerie, plutôt qu'une boutique.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
