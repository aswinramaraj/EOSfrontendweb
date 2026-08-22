import type { TopRecruiter } from "../../types";

interface TopRecruitersCardProps {
  data: TopRecruiter[];
}

/** Exact values transcribed from Placement Module v2.dc.html's Top recruiters block. */
export function TopRecruitersCard({ data }: TopRecruitersCardProps) {
  const max = Math.max(...data.map((d) => d.offers), 1);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 650 }}>Top recruiters</div>
      <div style={{ fontSize: 11.5, color: "#8b95a6", marginTop: 2 }}>Offers made this cycle</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 14 }}>
        {data.length === 0 && <p style={{ fontSize: 13, color: "#96a0b0" }}>No offers recorded yet.</p>}
        {data.map((r) => (
          <div key={r.company} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{r.company}</span>
              <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 11, color: "#77808f" }}>
                {r.offers} offer{r.offers === 1 ? "" : "s"} · avg ₹{r.avgPackageLpa} LPA
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: "#eceff5", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(r.offers / max) * 100}%`, borderRadius: 4, background: "#1f4fd8" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
