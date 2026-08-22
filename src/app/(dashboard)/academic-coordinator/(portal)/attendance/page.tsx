"use client";

import { useMemo, useState } from "react";
import { useClasses, useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useClassAttendance } from "@/modules/academic-coordinator/hooks/useAttendanceQueries";
import { useAcademicYear } from "@/modules/academic-coordinator/context/AcademicYearContext";
import { placementSelectStyle } from "@/modules/placement/components/table/PlacementTable";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.4px" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#77808f", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function CoordinatorAttendancePage() {
  const departments = useDepartments();
  const classes = useClasses();
  const { batchId } = useAcademicYear();
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);

  const deptCodeById = useMemo(() => new Map((departments.data ?? []).map((d) => [d.id, d.code])), [departments.data]);
  const classesInBatch = useMemo(() => (classes.data ?? []).filter((c) => c.batch_id === batchId), [classes.data, batchId]);
  const effectiveDeptId = departmentId ?? classesInBatch[0]?.department_id ?? departments.data?.[0]?.id ?? null;
  const classesInDept = useMemo(
    () => classesInBatch.filter((c) => c.department_id === effectiveDeptId).sort((a, b) => a.section.localeCompare(b.section)),
    [classesInBatch, effectiveDeptId],
  );
  const effectiveClassId = classesInDept.some((c) => c.id === classId) ? classId : (classesInDept[0]?.id ?? null);
  const attendance = useClassAttendance(effectiveClassId);

  const rows = attendance.data?.rows ?? [];
  const subjects = attendance.data?.subjects ?? [];
  const withOverall = rows.filter((r) => r.overallPercentage != null);
  const avgAttendance = withOverall.length ? Math.round(withOverall.reduce((sum, r) => sum + (r.overallPercentage ?? 0), 0) / withOverall.length) : null;
  const belowMinimum = rows.filter((r) => r.status === "Shortage").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Attendance Management</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>Class, subject and student attendance.</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <select
            value={effectiveDeptId ?? ""}
            onChange={(e) => {
              setDepartmentId(Number(e.target.value));
              setClassId(null);
            }}
            style={{ ...placementSelectStyle, minWidth: 140 }}
          >
            {[...new Set(classesInBatch.map((c) => c.department_id))].map((deptId) => (
              <option key={deptId} value={deptId}>
                {deptCodeById.get(deptId) ?? "?"}
              </option>
            ))}
          </select>
          <select value={effectiveClassId ?? ""} onChange={(e) => setClassId(Number(e.target.value))} style={{ ...placementSelectStyle, minWidth: 140 }}>
            {classesInDept.length === 0 ? (
              <option value="">No sections</option>
            ) : (
              classesInDept.map((c) => (
                <option key={c.id} value={c.id}>
                  Section {c.section}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <StatCard label="Total students" value={rows.length} />
        <StatCard label="Average attendance" value={avgAttendance != null ? `${avgAttendance}%` : "—"} />
        <StatCard label="Below minimum (75%)" value={belowMinimum} />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef1f6" }}>
          <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Student attendance</h2>
        </div>

        {attendance.isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>No active students in this class.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `1fr 1.6fr repeat(${subjects.length}, 0.8fr) 0.8fr 0.9fr`,
                gap: 10,
                padding: "10px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #eaeef4",
                minWidth: 600 + subjects.length * 90,
              }}
            >
              <span style={{ fontSize: 10.5, fontWeight: 650, color: "#77808f" }}>ROLL NO</span>
              <span style={{ fontSize: 10.5, fontWeight: 650, color: "#77808f" }}>STUDENT</span>
              {subjects.map((s) => (
                <span key={s.id} style={{ fontSize: 10.5, fontWeight: 650, color: "#77808f" }} title={s.name}>
                  {s.subjectCode}
                </span>
              ))}
              <span style={{ fontSize: 10.5, fontWeight: 650, color: "#77808f" }}>OVERALL</span>
              <span style={{ fontSize: 10.5, fontWeight: 650, color: "#77808f" }}>STATUS</span>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.student.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: `1fr 1.6fr repeat(${subjects.length}, 0.8fr) 0.8fr 0.9fr`,
                  gap: 10,
                  alignItems: "center",
                  padding: "11px 20px",
                  borderBottom: "1px solid #f3f5f9",
                  fontSize: 12.5,
                  minWidth: 600 + subjects.length * 90,
                  background: i % 2 ? "#f5f9ff" : "#fff",
                }}
              >
                <span>{r.student.rollNo ?? r.student.studentIdNo}</span>
                <span style={{ fontWeight: 600 }}>{r.student.name}</span>
                {subjects.map((s) => (
                  <span key={s.id} style={{ color: "#77808f" }}>
                    {r.subjectPercentages[s.id] != null ? `${r.subjectPercentages[s.id]}%` : "—"}
                  </span>
                ))}
                <span style={{ fontWeight: 700, color: r.overallPercentage != null && r.overallPercentage < 75 ? "#991b1b" : "#166534" }}>
                  {r.overallPercentage != null ? `${r.overallPercentage}%` : "—"}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 5,
                    width: "fit-content",
                    background: r.status === "Shortage" ? "#fecaca" : "#dcfce7",
                    color: r.status === "Shortage" ? "#991b1b" : "#166534",
                  }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
