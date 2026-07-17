import { ImageResponse } from "next/og";

export const alt = "HYPA · Maroquinerie artisanale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social preview. System serif keeps it dependency-free; the ecru /
// bordeaux palette matches the site.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F4EEE4",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 40,
            letterSpacing: 12,
            color: "#632434",
            marginBottom: 28,
          }}
        >
          H Y P A
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 76,
            color: "#2A2320",
            lineHeight: 1.15,
            padding: "0 60px",
          }}
        >
          <span>Une galerie,</span>
          <span>plutôt qu&apos;une boutique.</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            letterSpacing: 6,
            color: "#632434",
            opacity: 0.7,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          MAROQUINERIE ARTISANALE
        </div>
      </div>
    ),
    size,
  );
}
