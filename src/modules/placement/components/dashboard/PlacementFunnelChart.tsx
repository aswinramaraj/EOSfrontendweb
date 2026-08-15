import type { PlacementFunnel } from "../../types";

interface PlacementFunnelChartProps {
  data: PlacementFunnel;
}

/** Exact values transcribed from Placement Module v2.dc.html's dashboard funnel block. */
export function PlacementFunnelChart({ data }: PlacementFunnelChartProps) {
  const stages = [
    { label: "Registered", value: data.eligible },
    { label: "Applied", value: data.applied },
    { label: "Shortlisted", value: data.shortlisted },
    { label: "Interviewed", value: data.interviewed },
    { label: "Offers", value: data.offers },
    { label: "Placed", value: data.placed },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);
  const converted = data.eligible > 0 ? Math.round((data.placed / data.eligible) * 1000) / 10 : 0;

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 650 }}>Placement funnel</div>
          <div style={{ fontSize: 11.5, color: "#8b95a6", marginTop: 2 }}>
            {data.eligible.toLocaleString("en-IN")} registered students this cycle
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-ibm-plex-mono)",
            fontSize: 11,
            color: "#1f4fd8",
            background: "#eef3fe",
            padding: "4px 9px",
            borderRadius: 5,
          }}
        >
          {converted}% converted
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 150, marginTop: 20 }}>
        {stages.map((s, i) => {
          const color = i === stages.length - 1 ? "#1f4fd8" : i === 0 ? "#9fb4e8" : "#1f4fd8";
          const opacity = 0.55 + i * 0.09;
          const height = Math.max(8, Math.round((s.value / max) * 112));
          return (
            <div key={s.label} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, height: "100%" }}>
              <div style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 12, fontWeight: 500, textAlign: "center" }}>
                {s.value.toLocaleString("en-IN")}
              </div>
              <div style={{ height, borderRadius: "5px 5px 0 0", background: color, opacity }} />
              <div style={{ fontSize: 10.5, color: "#77808f", textAlign: "center", lineHeight: 1.3 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
