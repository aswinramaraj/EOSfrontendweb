import Link from "next/link";
import type { UpcomingDrive } from "../../types";

interface UpcomingDrivesCardProps {
  drives: UpcomingDrive[];
}

/** Exact values transcribed from Placement Module v2.dc.html's Drives this month block. */
export function UpcomingDrivesCard({ drives }: UpcomingDrivesCardProps) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 650 }}>Drives this month</div>
      <div style={{ fontSize: 11.5, color: "#8b95a6", marginTop: 2 }}>Scheduled and in progress</div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
        {drives.map((d) => (
          <Link
            key={d.id}
            href="/placement/drives"
            style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 4px", borderTop: "1px solid #f1f4f8" }}
            className="hover:bg-[#f8fafc]"
          >
            <div
              style={{
                width: 40,
                height: 42,
                borderRadius: 8,
                background: "#f4f7fc",
                border: "1px solid #e7ecf4",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1.15,
              }}
            >
              <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 13, fontWeight: 500 }}>{d.day}</span>
              <span style={{ fontSize: 9, color: "#8b95a6", letterSpacing: ".6px" }}>{d.month}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{d.company}</div>
              {(d.role || d.venue) && (
                <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 1 }}>{[d.role, d.venue].filter(Boolean).join(" · ")}</div>
              )}
            </div>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3.5px 9px", borderRadius: 5, whiteSpace: "nowrap", background: "#eaf0fe", color: "#1f4fd8" }}>
              Upcoming
            </span>
          </Link>
        ))}
        {drives.length === 0 && <p style={{ fontSize: 13, color: "#96a0b0" }}>No drives scheduled yet.</p>}
      </div>
    </div>
  );
}
