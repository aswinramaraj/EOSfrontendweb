import Link from "next/link";

interface DepartmentPlacementRatesProps {
  data: { department: string; placed: number; total: number }[];
}

/** Exact values transcribed from Placement Module v2.dc.html's Department performance block. */
export function DepartmentPlacementRates({ data }: DepartmentPlacementRatesProps) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 650 }}>Department performance</div>
          <div style={{ fontSize: 11.5, color: "#8b95a6", marginTop: 2 }}>Placed against registered, current cycle</div>
        </div>
        <Link
          href="/placement/placements"
          style={{ border: "1px solid #dfe4ec", background: "#fff", borderRadius: 7, height: 30, padding: "0 11px", fontSize: 11.5, color: "#2c3542" }}
          className="flex items-center hover:bg-[#f3f6fb]"
        >
          Outcomes
        </Link>
      </div>

      {data.length === 0 ? (
        <p style={{ marginTop: 24, fontSize: 13, color: "#96a0b0" }}>No departments on file yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 26px", marginTop: 16 }}>
          {data.map((d) => {
            const pct = d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0;
            const barColor = pct >= 65 ? "#1f4fd8" : "#5b7fdf";
            return (
              <div key={d.department} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{d.department}</span>
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "#77808f", fontSize: 11 }}>
                    {d.placed}/{d.total} · {pct}%
                  </span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: "#eceff5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
