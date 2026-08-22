"use client";

import { useState } from "react";
import { useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useDepartmentAudit } from "@/modules/academic-coordinator/hooks/useAuditQueries";
import { useAcademicYear } from "@/modules/academic-coordinator/context/AcademicYearContext";
import { placementSelectStyle } from "@/modules/placement/components/table/PlacementTable";
import type { AuditStatus } from "@/modules/academic-coordinator/types";

const STATUS_STYLE: Record<AuditStatus, { bg: string; border: string; badgeBg: string; fg: string; glyph: string }> = {
  Completed: { bg: "#f0fdf4", border: "#bbf7d0", badgeBg: "#dcfce7", fg: "#166534", glyph: "✓" },
  Pending: { bg: "#fefce8", border: "#fef08a", badgeBg: "#fef08a", fg: "#854d0e", glyph: "!" },
  Overdue: { bg: "#fef2f2", border: "#fecaca", badgeBg: "#fecaca", fg: "#991b1b", glyph: "!" },
  "Not started": { bg: "#f8fafc", border: "#eef2f8", badgeBg: "#f1f5f9", fg: "#64748b", glyph: "○" },
};

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function CoordinatorAcademicAuditPage() {
  const departments = useDepartments();
  const { batchId, selectedBatch } = useAcademicYear();
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [semester, setSemester] = useState(5);

  const effectiveDeptId = departmentId ?? departments.data?.[0]?.id ?? null;
  const dept = departments.data?.find((d) => d.id === effectiveDeptId) ?? null;
  const audit = useDepartmentAudit(effectiveDeptId, semester, batchId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Academic Audit</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Completion of the academic process by department, for the {selectedBatch ? `${selectedBatch.start_year}-${selectedBatch.end_year}` : "selected"} batch — computed live.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <select value={effectiveDeptId ?? ""} onChange={(e) => setDepartmentId(Number(e.target.value))} style={placementSelectStyle}>
            {(departments.data ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.code}
              </option>
            ))}
          </select>
          <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} style={placementSelectStyle}>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{dept?.code ?? "—"} academic audit</div>
            <div style={{ fontSize: 12.5, color: "#77808f", marginTop: 3 }}>Semester {semester}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>{audit.data ? `${audit.data.percentComplete}%` : "—"}</div>
            <div style={{ fontSize: 11, color: "#96a0b0" }}>overall completion</div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "#eef2f8", overflow: "hidden", marginTop: 14 }}>
          <div style={{ height: "100%", width: `${audit.data?.percentComplete ?? 0}%`, background: "#2563eb" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {audit.isLoading ? (
          <div style={{ fontSize: 13, color: "#8b95a6" }}>Loading…</div>
        ) : (
          (audit.data?.milestones ?? []).map((m) => {
            const s = STATUS_STYLE[m.status];
            return (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: s.badgeBg, color: s.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {s.glyph}
                </span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{m.label}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: s.fg }}>{m.status}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
