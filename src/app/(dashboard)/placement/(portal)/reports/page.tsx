"use client";

import { useToast } from "@/shared/components/ui/ToastProvider";
import { useReportsGeneratedCount } from "@/modules/placement/hooks/useReportsGeneratedCount";

interface ReportCard {
  tag: "STATUTORY" | "ACCREDITATION" | "MANAGEMENT" | "OPERATIONS" | "ANALYSIS";
  title: string;
  desc: string;
  meta: string;
}

/** Exact tag color pairs transcribed from Placement Module v2.dc.html's Reports page. */
const TAG_COLORS: Record<ReportCard["tag"], [string, string]> = {
  STATUTORY: ["#eaf0fe", "#1f4fd8"],
  ACCREDITATION: ["#e8f0fe", "#1f4fd8"],
  MANAGEMENT: ["#eef3fe", "#5b7fdf"],
  OPERATIONS: ["#eaf0fe", "#1f4fd8"],
  ANALYSIS: ["#e8f0fe", "#1f4fd8"],
};

// The reference names 8 statutory/accreditation formats (NIRF, NAAC, AICTE,
// ...) — none of those prescribed formats exist anywhere in this system, and
// claiming a generic export IS one of them would be a worse kind of
// dishonesty than the mockup's own fake toasts. The catalog stays for visual
// accuracy; "Generate"/"Schedule" say so plainly instead of pretending.
const REPORT_CARDS: ReportCard[] = [
  {
    tag: "STATUTORY",
    title: "NIRF placement submission",
    desc: "Department-wise placed counts, median salary and higher-studies split in the prescribed format.",
    meta: "Not available yet",
  },
  {
    tag: "ACCREDITATION",
    title: "NAAC / NBA criterion report",
    desc: "Three-year placement trend with supporting offer evidence per programme.",
    meta: "Not available yet",
  },
  {
    tag: "MANAGEMENT",
    title: "Cycle review pack",
    desc: "Drives held, conversion at each stage, recruiter mix and package distribution.",
    meta: "Not available yet",
  },
  {
    tag: "OPERATIONS",
    title: "Department coordinator digest",
    desc: "Weekly per-department pending applications, shortlists and interview absentees.",
    meta: "Not available yet",
  },
  {
    tag: "OPERATIONS",
    title: "Unplaced student tracker",
    desc: "Final-year students with zero offers, with training attendance and mock scores.",
    meta: "Not available yet",
  },
  {
    tag: "MANAGEMENT",
    title: "Recruiter feedback summary",
    desc: "Consolidated panel feedback and the skill gaps flagged by visiting companies.",
    meta: "Not available yet",
  },
  {
    tag: "ANALYSIS",
    title: "Salary distribution analysis",
    desc: "Package bands, outliers and year-on-year movement by department.",
    meta: "Not available yet",
  },
  {
    tag: "STATUTORY",
    title: "AICTE annual return",
    desc: "Placement and internship counts formatted for the AICTE portal upload.",
    meta: "Not available yet",
  },
];

export default function ReportsPage() {
  const { show } = useToast();
  const generatedCount = useReportsGeneratedCount();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Reports</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Statutory, accreditation and management reporting.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "15px 17px" }}>
          <div style={{ fontSize: 11.5, color: "#77808f", fontWeight: 550 }}>Report templates</div>
          <div style={{ fontSize: 26, fontWeight: 680, letterSpacing: "-1px", marginTop: 7 }}>{REPORT_CARDS.length}</div>
          <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 5 }}>Statutory and internal</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "15px 17px" }}>
          <div style={{ fontSize: 11.5, color: "#77808f", fontWeight: 550 }}>Generated this month</div>
          <div style={{ fontSize: 26, fontWeight: 680, letterSpacing: "-1px", marginTop: 7 }}>
            {generatedCount.data ?? "—"}
          </div>
          <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 5 }}>Student and class-wise report downloads</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "15px 17px" }}>
          <div style={{ fontSize: 11.5, color: "#77808f", fontWeight: 550 }}>Scheduled</div>
          <div style={{ fontSize: 26, fontWeight: 680, letterSpacing: "-1px", marginTop: 7 }}>—</div>
          <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 5 }}>Not tracked in this system yet</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: "15px 17px" }}>
          <div style={{ fontSize: 11.5, color: "#77808f", fontWeight: 550 }}>Last ERP sync</div>
          <div style={{ fontSize: 26, fontWeight: 680, letterSpacing: "-1px", marginTop: 7 }}>—</div>
          <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 5 }}>Not tracked in this system yet</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
        {REPORT_CARDS.map((card) => {
          const [bg, fg] = TAG_COLORS[card.tag];
          return (
            <div
              key={card.title}
              style={{
                background: "#fff",
                border: "1px solid #e2e7ef",
                borderRadius: 12,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono)",
                    fontSize: 9.5,
                    letterSpacing: ".6px",
                    fontWeight: 500,
                    padding: "3px 7px",
                    borderRadius: 4,
                    background: bg,
                    color: fg,
                  }}
                >
                  {card.tag}
                </span>
                <span style={{ fontSize: 10.5, color: "#96a0b0" }}>{card.meta}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 650 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: "#77808f", lineHeight: 1.55 }}>{card.desc}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                <button
                  type="button"
                  onClick={() => show("This report format isn't available yet.", "error")}
                  style={{
                    height: 32,
                    border: "none",
                    background: "#1f4fd8",
                    color: "#fff",
                    borderRadius: 7,
                    padding: "0 13px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => show("Scheduled runs aren't available yet.", "error")}
                  style={{
                    height: 32,
                    border: "1px solid #dfe4ec",
                    background: "#fff",
                    borderRadius: 7,
                    padding: "0 13px",
                    fontSize: 12,
                    color: "#2c3542",
                    cursor: "pointer",
                  }}
                >
                  Schedule
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
