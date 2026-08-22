"use client";

import { Fragment, useMemo, useState } from "react";
import { useClasses, useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useAllTimetableSlots } from "@/modules/academic-coordinator/hooks/useTimetableQueries";
import { useAcademicYear } from "@/modules/academic-coordinator/context/AcademicYearContext";
import { placementSelectStyle } from "@/modules/placement/components/table/PlacementTable";
import type { TimetableSlot } from "@/modules/academic-coordinator/types";

const DAY_LABELS: Record<number, string> = { 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT" };

interface ClashRow {
  label: string;
  detail: string;
  kind: "good" | "bad";
}

function computeClashes(classSlots: TimetableSlot[], allSlots: TimetableSlot[]): ClashRow[] {
  const facultyClashes: string[] = [];
  for (const slot of classSlots) {
    const conflicting = allSlots.filter(
      (s) =>
        s.id !== slot.id &&
        s.facultyId === slot.facultyId &&
        s.dayOfWeek === slot.dayOfWeek &&
        s.periodNumber === slot.periodNumber &&
        s.classId !== slot.classId,
    );
    for (const c of conflicting) {
      facultyClashes.push(`${slot.facultyName} — ${DAY_LABELS[slot.dayOfWeek]} P${slot.periodNumber}: also teaching ${c.departmentCode} ${c.classSection}`);
    }
  }

  const rows: ClashRow[] = [];
  if (facultyClashes.length === 0) {
    rows.push({ label: "Faculty clash", detail: "None detected", kind: "good" });
  } else {
    const unique = Array.from(new Set(facultyClashes));
    for (const detail of unique) rows.push({ label: "Faculty clash", detail, kind: "bad" });
  }
  return rows;
}

export default function CoordinatorTimetablePage() {
  const departments = useDepartments();
  const classes = useClasses();
  const slots = useAllTimetableSlots();
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
  // Fall back to the first section in this department whenever the previous selection doesn't belong to it
  // (department or batch just changed, or the picked class no longer exists) — no extra effect needed.
  const effectiveClassId = classesInDept.some((c) => c.id === classId) ? classId : (classesInDept[0]?.id ?? null);
  const selectedClass = classes.data?.find((c) => c.id === effectiveClassId) ?? null;

  const classSlots = useMemo(() => (slots.data ?? []).filter((s) => s.classId === effectiveClassId), [slots.data, effectiveClassId]);

  const periods = useMemo(() => {
    const byPeriod = new Map<number, { start: string; end: string }>();
    for (const s of slots.data ?? []) {
      if (!byPeriod.has(s.periodNumber)) byPeriod.set(s.periodNumber, { start: s.startTime, end: s.endTime });
    }
    return Array.from(byPeriod.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([period, time]) => ({ period, ...time }));
  }, [slots.data]);

  const days = [1, 2, 3, 4, 5, 6];

  const cellFor = (day: number, period: number) => classSlots.find((s) => s.dayOfWeek === day && s.periodNumber === period);

  const clashes = useMemo(() => computeClashes(classSlots, slots.data ?? []), [classSlots, slots.data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Timetable Management</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>Weekly class schedule with real faculty-clash validation.</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <select
            value={effectiveDeptId ?? ""}
            onChange={(e) => {
              setDepartmentId(Number(e.target.value));
              setClassId(null);
            }}
            style={{ ...placementSelectStyle, minWidth: 160 }}
          >
            {[...new Set(classesInBatch.map((c) => c.department_id))].map((deptId) => (
              <option key={deptId} value={deptId}>
                {deptCodeById.get(deptId) ?? "?"}
              </option>
            ))}
          </select>
          <select value={effectiveClassId ?? ""} onChange={(e) => setClassId(Number(e.target.value))} style={{ ...placementSelectStyle, minWidth: 180 }}>
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

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef1f6" }}>
          <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Weekly timetable</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#77808f" }}>
            {selectedClass ? `${deptCodeById.get(selectedClass.department_id) ?? "?"} · Sec ${selectedClass.section}` : ""} · {periods.length} periods, Monday to Saturday.
          </p>
        </div>

        {slots.isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>Loading…</div>
        ) : periods.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>No timetable slots published yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: `110px repeat(${days.length}, minmax(140px,1fr))`, minWidth: 900 }}>
              <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #eaeef4", borderRight: "1px solid #eaeef4" }} />
              {days.map((d) => (
                <div key={d} style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #eaeef4", fontSize: 11, fontWeight: 650, color: "#77808f", textAlign: "center" }}>
                  {DAY_LABELS[d]}
                </div>
              ))}
              {periods.map(({ period, start, end }) => (
                <Fragment key={period}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #f3f5f9", borderRight: "1px solid #eaeef4", fontSize: 11, color: "#77808f" }}>
                    {start} – {end}
                  </div>
                  {days.map((d) => {
                    const cell = cellFor(d, period);
                    return (
                      <div
                        key={`${d}-${period}`}
                        style={{
                          padding: "8px 10px",
                          borderBottom: "1px solid #f3f5f9",
                          background: cell ? "#f5f9ff" : "#fff",
                          minHeight: 56,
                        }}
                      >
                        {cell && (
                          <>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af" }}>{cell.subjectCode}</div>
                            <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2 }}>{cell.facultyName}</div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Validation</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {clashes.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                background: c.kind === "good" ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${c.kind === "good" ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.kind === "good" ? "#16a34a" : "#dc2626", flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 650, flexShrink: 0 }}>{c.label}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>{c.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
