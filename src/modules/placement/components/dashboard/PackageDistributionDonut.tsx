import type { PackageBand } from "../../types";

interface PackageDistributionDonutProps {
  data: PackageBand[];
}

const SEGMENT_COLORS = ["#b8ccf5", "#6b94ec", "#2f62e0", "#0b2f8f"];
// r=15.9 makes the circle's circumference ≈100, so dash/offset can be plain
// percentages — same trick the reference markup uses.
const R = 15.9;

/** Exact values transcribed from Placement Module v2.dc.html's Package distribution block. */
export function PackageDistributionDonut({ data }: PackageDistributionDonutProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const segments = data.reduce<{ color: string; dash: string; offset: string; cumulative: number }[]>((acc, d, i) => {
    const frac = total > 0 ? (d.count / total) * 100 : 0;
    const cumulativeBefore = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    return [
      ...acc,
      {
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
        dash: `${frac.toFixed(2)} ${(100 - frac).toFixed(2)}`,
        offset: cumulativeBefore.toFixed(2),
        cumulative: cumulativeBefore + frac,
      },
    ];
  }, []);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 650 }}>Package distribution</div>
      <div style={{ fontSize: 11.5, color: "#8b95a6", marginTop: 2 }}>{total.toLocaleString("en-IN")} accepted offers</div>

      {total === 0 ? (
        <p style={{ marginTop: 24, fontSize: 13, color: "#96a0b0" }}>No accepted offers yet.</p>
      ) : (
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 14 }}>
          <svg viewBox="0 0 42 42" style={{ width: 118, height: 118, flex: "0 0 118px", transform: "rotate(-90deg)" }}>
            <circle cx="21" cy="21" r={R} fill="none" stroke="#eceff5" strokeWidth={7} />
            {segments.map((s, i) => (
              <circle
                key={i}
                cx="21"
                cy="21"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={7}
                strokeDasharray={s.dash}
                strokeDashoffset={`-${s.offset}`}
              />
            ))}
          </svg>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
            {data.map((d, i) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                <span style={{ fontSize: 11.5, color: "#4b566b", flex: 1 }}>₹{d.label}</span>
                <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 11.5, fontWeight: 500 }}>
                  {d.count.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
