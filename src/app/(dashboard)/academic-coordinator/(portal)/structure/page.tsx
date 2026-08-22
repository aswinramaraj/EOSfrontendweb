"use client";

import { useState } from "react";
import {
  useBatches,
  useClasses,
  useCourses,
  useDepartments,
} from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { DepartmentRail } from "@/modules/academic-structure/components/DepartmentRail";
import { StructurePanel } from "@/modules/academic-structure/components/StructurePanel";
import { BatchesTab } from "@/modules/academic-structure/components/BatchesTab";

type Tab = "structure" | "batches";

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    height: 32,
    borderRadius: 8,
    padding: "0 16px",
    fontSize: 12.5,
    fontWeight: 600,
    border: "1px solid transparent",
    background: active ? "#1f4fd8" : undefined,
    color: active ? "#fff" : "#3f4b60",
  };
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.4px" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#77808f", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function CoordinatorAcademicStructurePage() {
  const [tab, setTab] = useState<Tab>("structure");
  const [departmentId, setDepartmentId] = useState<number | null>(null);

  const { data: departments = [] } = useDepartments();
  const { data: courses = [] } = useCourses();
  const { data: batches = [] } = useBatches();
  const { data: classes = [] } = useClasses();

  const effectiveDepartmentId = departmentId ?? departments[0]?.id ?? null;
  const selectedDepartment = departments.find((d) => d.id === effectiveDepartmentId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Academic Structure</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
          Department, course, batch, and class hierarchy — read-only view of the institution&apos;s real academic structure.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <StatCard label="Departments" value={departments.length} />
        <StatCard label="Courses" value={courses.length} />
        <StatCard label="Batches" value={batches.length} />
        <StatCard label="Classes" value={classes.length} />
      </div>

      <div style={{ display: "inline-flex", gap: 6, background: "#f1f3f7", padding: 4, borderRadius: 10, alignSelf: "flex-start" }}>
        <button type="button" style={tabButtonStyle(tab === "structure")} onClick={() => setTab("structure")}>
          Departments &amp; classes
        </button>
        <button type="button" style={tabButtonStyle(tab === "batches")} onClick={() => setTab("batches")}>
          Batches
        </button>
      </div>

      {tab === "structure" ? (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>
          <DepartmentRail departments={departments} classes={classes} selectedId={effectiveDepartmentId} onSelect={setDepartmentId} />
          {selectedDepartment ? (
            <StructurePanel department={selectedDepartment} courses={courses} batches={batches} classes={classes} readOnly />
          ) : (
            <div style={{ background: "#fff", border: "1px dashed #dfe4ec", borderRadius: 12, padding: 60, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#8b95a6", margin: 0 }}>No departments have been set up yet.</p>
            </div>
          )}
        </div>
      ) : (
        <BatchesTab batches={batches} classes={classes} readOnly />
      )}
    </div>
  );
}
