import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1f2937 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              borderRadius: "999px",
              background: "rgba(251, 146, 60, 0.2)",
              border: "1px solid rgba(251, 146, 60, 0.4)",
              fontSize: "22px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Barn Coffee POS
          </div>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.08)",
              fontSize: "18px",
            }}
          >
            Demo Build
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "64px", fontWeight: 600, lineHeight: 1.1 }}>
            A barista-first POS experience
          </div>
          <div style={{ fontSize: "28px", color: "#cbd5f5", maxWidth: "900px" }}>
            Checkout speed, inventory control, and reporting — all in one
            portfolio-ready product demo.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "20px",
            color: "#f8fafc",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            Next.js
          </div>
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            Supabase
          </div>
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            Zustand
          </div>
        </div>
      </div>
    ),
    size
  );
}
