import type { PackageBand } from "../../types";

const BAR_COLORS = ["#b8ccf5", "#6b94ec", "#2f62e0", "#0b2f8f"];

/** Exact values transcribed from Placement Module v2.dc.html's Placements-page "Package bands" block. */
export function PackageBandsBarChart({ data }: { data: PackageBand[] }) {
  const max = Math.max(1, ...data.map((b) => b.count));

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 650 }}>Package bands</div>
      <div style={{ fontSize: 11.5, color: "#8b95a6", marginTop: 2 }}>Accepted offers by CTC range</div>

      {data.every((b) => b.count === 0) ? (
        <p style={{ marginTop: 24, fontSize: 13, color: "#96a0b0" }}>No accepted offers yet.</p>
      ) : (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 180, marginTop: 18 }}>
          {data.map((b, i) => (
            <div
              key={b.label}
              style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, height: "100%" }}
            >
              <div style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 12, textAlign: "center" }}>
                {b.count.toLocaleString("en-IN")}
              </div>
              <div
                style={{
                  height: Math.round((b.count / max) * 130),
                  borderRadius: "6px 6px 0 0",
                  background: BAR_COLORS[i % BAR_COLORS.length],
                }}
              />
              <div style={{ fontSize: 10.5, color: "#77808f", textAlign: "center" }}>₹{b.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
