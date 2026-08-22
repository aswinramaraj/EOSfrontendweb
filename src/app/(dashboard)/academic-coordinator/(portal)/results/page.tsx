"use client";

import { useMemo, useState } from "react";
import { useClasses, useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useClassResults } from "@/modules/academic-coordinator/hooks/useResultsQueries";
import { useAcademicYear } from "@/modules/academic-coordinator/context/AcademicYearContext";
import { placementSelectStyle, PlacementTable, type PlacementTableColumn, type PlacementTableSort } from "@/modules/placement/components/table/PlacementTable";
import type { ResultsRow } from "@/modules/academic-coordinator/types";

function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: "good" | "bad" }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.4px", color: tone === "good" ? "#166534" : tone === "bad" ? "#991b1b" : undefined }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#77808f", marginTop: 4 }}>{label}</div>
    </div>
  );
}

const PAGE_SIZE = 15;

export default function CoordinatorResultsPage() {
  const departments = useDepartments();
  const classes = useClasses();
  const { batchId } = useAcademicYear();
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<PlacementTableSort | null>(null);

  const deptCodeById = useMemo(() => new Map((departments.data ?? []).map((d) => [d.id, d.code])), [departments.data]);
  const classesInBatch = useMemo(() => (classes.data ?? []).filter((c) => c.batch_id === batchId), [classes.data, batchId]);
  const effectiveDeptId = departmentId ?? classesInBatch[0]?.department_id ?? departments.data?.[0]?.id ?? null;
  const classesInDept = useMemo(
    () => classesInBatch.filter((c) => c.department_id === effectiveDeptId).sort((a, b) => a.section.localeCompare(b.section)),
    [classesInBatch, effectiveDeptId],
  );
  const effectiveClassId = classesInDept.some((c) => c.id === classId) ? classId : (classesInDept[0]?.id ?? null);
  const results = useClassResults(effectiveClassId);

  const columns: PlacementTableColumn<ResultsRow>[] = [
    { key: "roll", label: "ROLL NO", width: "0.8fr", type: "mono", render: (r) => ({ text: r.student.rollNo ?? "—" }) },
    { key: "name", label: "STUDENT", width: "1.6fr", strong: true, render: (r) => ({ text: r.student.name }), sortValue: (r) => r.student.name },
    { key: "cgpa", label: "CGPA", width: "0.8fr", render: (r) => ({ text: r.cgpa != null ? r.cgpa.toFixed(2) : "—" }), sortValue: (r) => r.cgpa ?? -1 },
    { key: "backlogs", label: "BACKLOGS", width: "0.8fr", render: (r) => ({ text: String(r.backlogs) }), sortValue: (r) => r.backlogs },
    { key: "standing", label: "STANDING", width: "1fr", type: "badge", render: (r) => ({ text: r.standing }) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Results and Performance</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>Pass percentage, CGPA and at-risk students — computed live from published results.</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <select
            value={effectiveDeptId ?? ""}
            onChange={(e) => {
              setDepartmentId(Number(e.target.value));
              setClassId(null);
              setPage(1);
            }}
            style={{ ...placementSelectStyle, minWidth: 140 }}
          >
            {[...new Set(classesInBatch.map((c) => c.department_id))].map((deptId) => (
              <option key={deptId} value={deptId}>
                {deptCodeById.get(deptId) ?? "?"}
              </option>
            ))}
          </select>
          <select
            value={effectiveClassId ?? ""}
            onChange={(e) => {
              setClassId(Number(e.target.value));
              setPage(1);
            }}
            style={{ ...placementSelectStyle, minWidth: 140 }}
          >
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
        <StatCard label="Pass percentage" value={results.data?.passPercentage != null ? `${results.data.passPercentage}%` : "—"} tone="good" />
        <StatCard label="Class average" value={results.data?.classAverage != null ? results.data.classAverage : "—"} />
        <StatCard label="Highest mark" value={results.data?.highestMark ?? "—"} />
        <StatCard label="Lowest mark" value={results.data?.lowestMark ?? "—"} tone="bad" />
        <StatCard label="Students with backlogs" value={results.data?.studentsWithBacklogs ?? 0} tone="bad" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Subject-wise pass percentage</h2>
          {(results.data?.subjects ?? []).length > 0 && <span style={{ fontSize: 11, color: "#96a0b0" }}>Lowest first</span>}
        </div>
        {(results.data?.subjects ?? []).length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#96a0b0", margin: 0 }}>No published results for this class yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
            {[...(results.data?.subjects ?? [])]
              .sort((a, b) => (a.passPercentage ?? -1) - (b.passPercentage ?? -1))
              .map((s) => {
                const pct = s.passPercentage ?? 0;
                const color = pct >= 85 ? "#16a34a" : pct >= 75 ? "#2563eb" : "#ca8a04";
                return (
                  <div key={s.subjectId} style={{ border: "1px solid #eef1f6", borderRadius: 10, padding: "10px 12px" }} title={s.subjectName}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1f4fd8" }}>{s.subjectCode}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color }}>{s.passPercentage != null ? `${s.passPercentage}%` : "—"}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#77808f", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.subjectName}</div>
                    <div style={{ height: 5, borderRadius: 3, background: "#eef2f8", overflow: "hidden", marginTop: 8 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <PlacementTable
        toolbar={<h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Student performance</h2>}
        columns={columns}
        rows={results.data?.rows ?? []}
        rowKey={(r) => r.student.id}
        sort={sort}
        onSortChange={setSort}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage={results.isLoading ? "Loading…" : "No students in this class."}
      />
    </div>
  );
}
