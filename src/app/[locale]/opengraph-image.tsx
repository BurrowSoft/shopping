import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ShoppingMole — Compare prices across 500+ stores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 110, marginBottom: 24 }}>🛍️</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: "white", letterSpacing: "-2px", marginBottom: 16 }}>
          ShoppingMole
        </div>
        <div style={{ fontSize: 30, color: "rgba(255,255,255,0.8)", maxWidth: 700, textAlign: "center", lineHeight: 1.4 }}>
          Compare prices across 500+ stores instantly
        </div>
        <div style={{ marginTop: 40, fontSize: 22, color: "rgba(255,255,255,0.55)", letterSpacing: "1px" }}>
          shoppingmole.com
        </div>
      </div>
    ),
    { ...size }
  );
}
