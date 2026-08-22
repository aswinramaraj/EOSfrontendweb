"use client";

import { useMemo, useState, type CSSProperties, type DragEvent } from "react";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { ApiError } from "@/shared/lib/api-client";
import { placementSelectStyle } from "@/modules/placement/components/table/PlacementTable";
import { useCourses, useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useDepartmentMapping } from "@/modules/academic-coordinator/hooks/useMappingQueries";
import { useAddMapping, useRemoveMapping } from "@/modules/academic-coordinator/hooks/useMappingMutations";
import { SUBJECT_COURSE_TYPE_LABELS, type MappingSubject } from "@/modules/academic-coordinator/types";

const DEFAULT_MAX_SEMESTER = 8;

const cardStyle: CSSProperties = { background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12 };

export default function CoordinatorMapPage() {
  const { show } = useToast();
  const departments = useDepartments();
  const courses = useCourses();
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [poolDeptFilter, setPoolDeptFilter] = useState<string>("All");
  const [removing, setRemoving] = useState<{ semester: number; subject: MappingSubject } | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverSemester, setDragOverSemester] = useState<number | null>(null);

  const effectiveDeptId = departmentId ?? departments.data?.[0]?.id ?? null;
  const mapping = useDepartmentMapping(effectiveDeptId);
  const addMapping = useAddMapping(effectiveDeptId);
  const removeMapping = useRemoveMapping(effectiveDeptId);

  const deptById = useMemo(() => new Map((departments.data ?? []).map((d) => [d.id, d])), [departments.data]);
  const maxSemester = useMemo(() => {
    const course = (courses.data ?? []).find((c) => c.department_id === effectiveDeptId);
    return course ? course.duration_years * 2 : DEFAULT_MAX_SEMESTER;
  }, [courses.data, effectiveDeptId]);

  const visibleSemesters = useMemo(
    () => (mapping.data?.semesters ?? []).filter((s) => s.semester <= maxSemester),
    [mapping.data, maxSemester],
  );

  const pool = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (mapping.data?.pool ?? []).filter((s) => {
      const matchesQuery = !q || s.subjectCode.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      const matchesDept = poolDeptFilter === "All" || String(s.departmentId) === poolDeptFilter;
      return matchesQuery && matchesDept;
    });
  }, [mapping.data, search, poolDeptFilter]);

  function handleDragStart(e: DragEvent<HTMLDivElement>, subjectId: number) {
    e.dataTransfer.setData("text/plain", String(subjectId));
    e.dataTransfer.effectAllowed = "copy";
    setDraggingId(subjectId);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, semester: number, totalClasses: number) {
    e.preventDefault();
    setDragOverSemester(null);
    setDraggingId(null);
    const subjectId = Number(e.dataTransfer.getData("text/plain"));
    if (!subjectId || effectiveDeptId == null) return;
    if (totalClasses === 0) {
      show("No classes sit at this semester for this department yet — nothing to map it to.", "error");
      return;
    }
    addMapping.mutate(
      { semester, subjectId },
      {
        onSuccess: (res) => show(res.added > 0 ? `Mapped to ${res.added} class${res.added === 1 ? "" : "es"}.` : "Already mapped to every class here.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error"),
      },
    );
  }

  function handleRemoveConfirmed() {
    if (!removing) return;
    removeMapping.mutate(
      { semester: removing.semester, subjectId: removing.subject.id },
      {
        onSuccess: () => show("Removed from mapping.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error"),
        onSettled: () => setRemoving(null),
      },
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Course Mapping</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Drag a course from the pool onto a semester to map it — applies to every class at that semester, across every batch.
          </p>
        </div>
        <select value={effectiveDeptId ?? ""} onChange={(e) => setDepartmentId(Number(e.target.value))} style={{ ...placementSelectStyle, minWidth: 220 }}>
          {(departments.data ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, alignItems: "flex-start" }}>
        {/* LEFT — semester buckets, one per semester of this department's program */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mapping.isLoading ? (
            <div style={{ ...cardStyle, padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>Loading…</div>
          ) : (
            visibleSemesters.map((bucket) => {
              const isDragOver = dragOverSemester === bucket.semester;
              const isEmpty = bucket.totalClasses === 0;
              return (
                <div
                  key={bucket.semester}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isEmpty) setDragOverSemester(bucket.semester);
                  }}
                  onDragLeave={() => setDragOverSemester((cur) => (cur === bucket.semester ? null : cur))}
                  onDrop={(e) => handleDrop(e, bucket.semester, bucket.totalClasses)}
                  style={{
                    ...cardStyle,
                    padding: 14,
                    opacity: isEmpty ? 0.55 : 1,
                    borderColor: isDragOver ? "#1f4fd8" : "#e2e7ef",
                    borderStyle: isDragOver ? "dashed" : "solid",
                    borderWidth: isDragOver ? 2 : 1,
                    background: isDragOver ? "#f5f9ff" : "#fff",
                    transition: "border-color 120ms, background 120ms",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>Semester {bucket.semester}</span>
                      <span style={{ fontSize: 11, color: "#96a0b0" }}>
                        {isEmpty ? "no classes here" : `${bucket.totalClasses} class${bucket.totalClasses === 1 ? "" : "es"}`}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#eaf0fe", color: "#1f4fd8" }}>
                      {bucket.mapped.length} mapped
                    </span>
                  </div>

                  {bucket.mapped.length === 0 ? (
                    <div style={{ fontSize: 11.5, color: "#b7c0cc", padding: "10px 0" }}>
                      {isEmpty ? "No class sits here — nothing to map." : "Drag a course here to map it."}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {bucket.mapped.map((s) => {
                        const partial = s.mappedClasses < bucket.totalClasses;
                        return (
                          <span
                            key={s.id}
                            title={`${s.name} — mapped to ${s.mappedClasses}/${bucket.totalClasses} classes`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 11.5,
                              fontWeight: 600,
                              padding: "5px 6px 5px 10px",
                              borderRadius: 20,
                              background: partial ? "#fef9c3" : "#eef2f8",
                              color: partial ? "#854d0e" : "#2c3542",
                            }}
                          >
                            {s.subjectCode}
                            {partial && <span style={{ fontWeight: 700 }}>{s.mappedClasses}/{bucket.totalClasses}</span>}
                            <button
                              type="button"
                              onClick={() => setRemoving({ semester: bucket.semester, subject: s })}
                              aria-label={`Remove ${s.subjectCode}`}
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                border: "none",
                                background: "rgba(0,0,0,.08)",
                                color: "inherit",
                                fontSize: 10,
                                lineHeight: "16px",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT — full course pool, draggable, filterable, sticky while scrolling the semesters */}
        <div style={{ ...cardStyle, padding: 14, position: "sticky", top: 18, maxHeight: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>Course pool</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or name"
            style={{ width: "100%", height: 34, boxSizing: "border-box", border: "1px solid #dfe4ec", borderRadius: 8, padding: "0 12px", fontSize: 12.5, outline: "none", marginBottom: 8, flexShrink: 0 }}
          />
          <select value={poolDeptFilter} onChange={(e) => setPoolDeptFilter(e.target.value)} style={{ ...placementSelectStyle, width: "100%", marginBottom: 10, boxSizing: "border-box", flexShrink: 0 }}>
            <option value="All">All departments</option>
            {(departments.data ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.code}
              </option>
            ))}
          </select>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7, paddingRight: 2 }}>
            {pool.length === 0 ? (
              <p style={{ fontSize: 12, color: "#96a0b0", textAlign: "center", padding: "20px 0" }}>No courses match.</p>
            ) : (
              pool.map((s) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, s.id)}
                  onDragEnd={() => setDraggingId(null)}
                  style={{
                    border: "1px solid #e2e7ef",
                    borderRadius: 8,
                    padding: "8px 10px",
                    cursor: "grab",
                    background: draggingId === s.id ? "#eaf0fe" : "#fff",
                    opacity: draggingId === s.id ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1f4fd8" }}>{s.subjectCode}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#77808f", background: "#f1f5f9", padding: "1px 6px", borderRadius: 10 }}>
                      {deptById.get(s.departmentId ?? -1)?.code ?? "—"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#3f4b60", marginTop: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 10.5, color: "#96a0b0", marginTop: 3 }}>
                    {s.credits ?? "—"} cr · {s.courseType ? SUBJECT_COURSE_TYPE_LABELS[s.courseType] : "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={removing != null}
        title="Remove from mapping?"
        message={removing ? `${removing.subject.subjectCode} · ${removing.subject.name} will be unmapped from Semester ${removing.semester} in this department.` : ""}
        confirmLabel="Remove"
        tone="danger"
        isPending={removeMapping.isPending}
        onConfirm={handleRemoveConfirmed}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
