import { useState } from "react";

interface PlacementStatCardProps {
  label: string;
  value: string | number;
  /** Small pill next to the value — e.g. "+142 MTD". Only pass when backed by a real historical comparison; never fabricate one. */
  delta?: string;
  caption?: string;
  /** 0-100 */
  progressPercent?: number;
}

/** Exact values transcribed from Placement Module v2.dc.html's `K()`/`up()`/`bar()` helpers — this module's own tile (not the shared app-wide `StatCard`), so other pages stay untouched. */
export function PlacementStatCard({ label, value, delta, caption, progressPercent }: PlacementStatCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hover ? "#1f4fd8" : "#e2e7ef"}`,
        borderRadius: 12,
        padding: "15px 17px",
        cursor: "pointer",
        transform: hover ? "translateY(-4px)" : undefined,
        boxShadow: hover ? "0 12px 26px rgba(31,79,216,.16)" : undefined,
        color: hover ? "#1f4fd8" : undefined,
        transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
      }}
    >
      <div style={{ fontSize: 11.5, color: "#77808f", fontWeight: 550 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 7 }}>
        <span style={{ fontSize: 26, fontWeight: 680, letterSpacing: "-1px" }}>{value}</span>
        {delta && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 650,
              color: "#1f4fd8",
              background: "#e8f0fe",
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: "var(--font-ibm-plex-mono)",
            }}
          >
            {delta}
          </span>
        )}
      </div>
      {caption && <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 5 }}>{caption}</div>}
      {progressPercent != null && (
        <div style={{ height: 4, borderRadius: 3, background: "#e8ecf3", marginTop: 11, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, progressPercent))}%`, background: "#1f4fd8", borderRadius: 3 }} />
        </div>
      )}
    </div>
  );
}
