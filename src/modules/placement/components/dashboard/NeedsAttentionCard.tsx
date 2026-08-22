import Link from "next/link";
import type { AttentionFlag } from "../../types";

interface NeedsAttentionCardProps {
  data: AttentionFlag[];
}

/** Mirrors the reference's 4 semantic dot tones (amber/red/amber/slate) by matching the real flag's target page, since flags are conditionally included so index position isn't stable. */
function dotColor(flag: AttentionFlag): string {
  if (flag.href.startsWith("/placement/offers")) return "#5b7fdf";
  if (flag.href.includes("drive=")) return "#5b7fdf";
  if (flag.href.startsWith("/placement/rounds")) return "#16224a";
  if (flag.href.startsWith("/placement/students")) return "#5b6577";
  return "#5b7fdf";
}

/** Every flag here is threshold-triggered from real data (DrivesService.getPlacementStats on the backend) — nothing is a static illustrative value. Exact spacing/type transcribed from Placement Module v2.dc.html's Needs attention block. */
export function NeedsAttentionCard({ data }: NeedsAttentionCardProps) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 650 }}>Needs attention</div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
        {data.length === 0 && (
          <p style={{ padding: "8px 0", fontSize: 13, color: "#96a0b0" }}>
            Nothing is currently over threshold — screening, shortlists and offer responses all look healthy.
          </p>
        )}
        {data.map((flag, i) => (
          <Link
            key={i}
            href={flag.href}
            style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 3px", borderTop: "1px solid #f1f4f8" }}
            className="hover:bg-[#f8fafc]"
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "0 0 8px", background: dotColor(flag) }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 550 }}>{flag.title}</div>
              <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 2 }}>{flag.description}</div>
            </div>
            <span style={{ fontSize: 14, color: "#b9c2cf" }}>›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
