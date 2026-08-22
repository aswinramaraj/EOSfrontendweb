"use client";

import { useMemo } from "react";
import { useCoordinatorFacultyWorkload } from "@/modules/academic-coordinator/hooks/useFacultyQueries";
import { SUBJECT_COURSE_TYPE_LABELS } from "@/modules/academic-coordinator/types";
import { useAcademicYear } from "@/modules/academic-coordinator/context/AcademicYearContext";

function barColor(hours: number, cap: number): string {
  if (hours > cap) return "#dc2626";
  const pct = (hours / cap) * 100;
  if (pct > 85) return "#ca8a04";
  return "#1f4fd8";
}

export default function CoordinatorFacultyWorkloadPage() {
  const workload = useCoordinatorFacultyWorkload();
  const { batchId, selectedBatch } = useAcademicYear();

  const allocations = useMemo(
    () => (workload.data?.allocations ?? []).filter((a) => a.batchId === batchId),
    [workload.data, batchId],
  );
  const summary = workload.data?.summary ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Faculty Workload</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
          Course allocation for the {selectedBatch ? `${selectedBatch.start_year}-${selectedBatch.end_year}` : "selected"} batch.
        </p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef1f6" }}>
          <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Course allocation</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#77808f" }}>Real faculty-subject-class assignments, with weekly hours drawn from the published timetable.</p>
        </div>

        {workload.isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>Loading…</div>
        ) : allocations.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>No course allocations recorded yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.8fr 0.8fr 1.4fr 1fr 0.8fr 0.9fr", gap: 12, padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #eaeef4", minWidth: 900 }}>
              {["CODE", "COURSE", "CLASS", "FACULTY", "TYPE", "HRS/WK", "CHECK"].map((h) => (
                <span key={h} style={{ fontSize: 10.5, fontWeight: 650, color: "#77808f", letterSpacing: ".3px" }}>
                  {h}
                </span>
              ))}
            </div>
            {allocations.map((a, i) => (
              <div
                key={a.mappingId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.9fr 1.8fr 0.8fr 1.4fr 1fr 0.8fr 0.9fr",
                  gap: 12,
                  alignItems: "center",
                  padding: "11px 20px",
                  borderBottom: "1px solid #f3f5f9",
                  fontSize: 12.5,
                  minWidth: 900,
                  background: i % 2 ? "#f5f9ff" : "#fff",
                }}
              >
                <span style={{ fontWeight: 700, color: "#1f4fd8" }}>{a.subjectCode}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.subjectName}</span>
                <span>{a.classLabel}</span>
                <span>{a.facultyName}</span>
                <span style={{ color: "#77808f" }}>{a.courseType ? SUBJECT_COURSE_TYPE_LABELS[a.courseType] : "—"}</span>
                <span>{a.weeklyHours}</span>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 5,
                    width: "fit-content",
                    background: a.check === "Overload" ? "#fef08a" : "#dcfce7",
                    color: a.check === "Overload" ? "#854d0e" : "#166534",
                  }}
                >
                  {a.check}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Workload summary</h2>
        <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#77808f" }}>
          Each faculty member&apos;s total weekly teaching hours across all batches — not limited to the batch selected above.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          {summary.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#96a0b0" }}>No scheduled teaching hours recorded yet.</p>
          ) : (
            summary.map((s) => (
              <div key={s.facultyId}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{s.facultyName}</span>
                  <span style={{ color: "#77808f" }}>
                    {s.weeklyHours} / {s.weeklyLoadCapHours} hrs
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#eceff5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.percent}%`, background: barColor(s.weeklyHours, s.weeklyLoadCapHours) }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
