"use client";

import { useMemo, useState } from "react";
import { useCourseProgress } from "@/modules/academic-coordinator/hooks/useCourseProgressQueries";
import { useAcademicYear } from "@/modules/academic-coordinator/context/AcademicYearContext";

export default function CoordinatorCourseProgressPage() {
  const progress = useCourseProgress();
  const { batchId } = useAcademicYear();
  const [search, setSearch] = useState("");

  const inBatch = useMemo(() => (progress.data ?? []).filter((p) => p.batchId === batchId), [progress.data, batchId]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = inBatch.filter(
      (p) => !q || p.subjectCode.toLowerCase().includes(q) || p.subjectName.toLowerCase().includes(q) || p.facultyName.toLowerCase().includes(q),
    );
    return [...filtered].sort((a, b) => (b.percentComplete ?? -1) - (a.percentComplete ?? -1));
  }, [inBatch, search]);

  const withData = inBatch.filter((p) => p.totalSessions > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Course Progress</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
          Lesson plans and syllabus completion. {withData} of {inBatch.length} lesson plans have session-level records so far.
        </p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by subject or faculty"
        style={{ height: 36, maxWidth: 360, border: "1px solid #dfe4ec", borderRadius: 8, padding: "0 12px", fontSize: 12.5, outline: "none" }}
      />

      {progress.isLoading ? (
        <div style={{ fontSize: 13, color: "#8b95a6" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>
          No lesson plans match this search.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }}>
          {rows.map((p) => (
            <div key={p.id} style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    {p.subjectCode} · {p.subjectName}
                  </div>
                  <div style={{ fontSize: 12, color: "#77808f", marginTop: 2 }}>
                    {p.facultyName} · {p.classLabel} · Sem {p.semester}
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1d4ed8", flexShrink: 0 }}>{p.percentComplete != null ? `${p.percentComplete}%` : "—"}</div>
              </div>

              <div style={{ height: 6, borderRadius: 4, background: "#eef2f8", overflow: "hidden", marginTop: 12 }}>
                <div style={{ height: "100%", width: `${p.percentComplete ?? 0}%`, background: "#2563eb" }} />
              </div>

              <div style={{ marginTop: 12 }}>
                {p.totalSessions === 0 ? (
                  <p style={{ fontSize: 12, color: "#96a0b0", margin: 0 }}>No sessions recorded yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.sessions.map((s) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.isCovered ? "#16a34a" : "#cbd5e1", flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.unitTitle ? `${s.unitTitle} — ` : ""}
                          {s.topic}
                        </span>
                        <span style={{ color: s.isCovered ? "#166534" : "#94a3b8", flexShrink: 0 }}>{s.isCovered ? "Completed" : "Pending"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
