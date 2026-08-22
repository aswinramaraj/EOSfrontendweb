"use client";

import { useState } from "react";
import Link from "next/link";
import { PlacementStatCard } from "@/modules/placement/components/PlacementStatCard";
import { ChevronRightIcon } from "@/shared/components/icons";
import {
  useBatches,
  useClasses,
  useCourses,
  useDepartments,
} from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { DepartmentRail } from "@/modules/academic-structure/components/DepartmentRail";
import { StructurePanel } from "@/modules/academic-structure/components/StructurePanel";
import { BatchesTab } from "@/modules/academic-structure/components/BatchesTab";
import { DepartmentDialog } from "@/modules/academic-structure/components/DepartmentDialog";
import { CourseDialog } from "@/modules/academic-structure/components/CourseDialog";
import { BatchDialog } from "@/modules/academic-structure/components/BatchDialog";
import type { Batch, Course, Department } from "@/modules/academic-structure/types";

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

export default function AcademicStructurePage() {
  const [tab, setTab] = useState<Tab>("structure");
  const [departmentId, setDepartmentId] = useState<number | null>(null);

  const { data: departments = [] } = useDepartments();
  const { data: courses = [] } = useCourses();
  const { data: batches = [] } = useBatches();
  const { data: classes = [] } = useClasses();

  const [departmentDialog, setDepartmentDialog] = useState<{ open: boolean; department: Department | null }>({
    open: false,
    department: null,
  });
  const [courseDialog, setCourseDialog] = useState<{ open: boolean; course: Course | null } | null>(null);
  const [batchDialog, setBatchDialog] = useState<{ open: boolean; batch: Batch | null }>({ open: false, batch: null });

  // No effect: default to the first department purely at render time until
  // the user explicitly picks one — matches this codebase's established
  // pattern of avoiding setState-in-effect for a value derivable from props/state.
  const effectiveDepartmentId = departmentId ?? departments[0]?.id ?? null;
  const selectedDepartment = departments.find((d) => d.id === effectiveDepartmentId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <nav className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "#8b95a6" }}>
        <Link href="/admin" className="hover:text-[#1f4fd8]">
          Home
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span style={{ fontWeight: 600, color: "#3f4b60" }}>Academic structure</span>
      </nav>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Academic structure</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <PlacementStatCard label="Departments" value={departments.length} />
        <PlacementStatCard label="Courses" value={courses.length} />
        <PlacementStatCard label="Classes" value={classes.length} />
        <button
          type="button"
          onClick={() => setTab("batches")}
          style={{ all: "unset", cursor: "pointer" }}
          title="Open the batches tab"
        >
          <PlacementStatCard label="Batches" value={batches.length} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "inline-flex", gap: 6, background: "#f1f3f7", padding: 4, borderRadius: 10 }}>
          <button type="button" style={tabButtonStyle(tab === "structure")} onClick={() => setTab("structure")}>
            Departments &amp; classes
          </button>
          <button type="button" style={tabButtonStyle(tab === "batches")} onClick={() => setTab("batches")}>
            Batches
          </button>
        </div>
        <p style={{ fontSize: 11.5, color: "#8b95a6", margin: 0 }}>
          Classes created here are the only ones the admission form can allocate a student to.
        </p>
      </div>

      {tab === "structure" ? (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>
          <DepartmentRail
            departments={departments}
            classes={classes}
            selectedId={effectiveDepartmentId}
            onSelect={setDepartmentId}
            onAdd={() => setDepartmentDialog({ open: true, department: null })}
          />
          {selectedDepartment ? (
            <StructurePanel
              department={selectedDepartment}
              courses={courses}
              batches={batches}
              classes={classes}
              onEditDepartment={() => setDepartmentDialog({ open: true, department: selectedDepartment })}
              onAddCourse={() => setCourseDialog({ open: true, course: null })}
              onEditCourse={(course) => setCourseDialog({ open: true, course })}
            />
          ) : (
            <div style={{ background: "#fff", border: "1px dashed #dfe4ec", borderRadius: 12, padding: 60, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#8b95a6", margin: 0 }}>Add a department to start building the structure.</p>
            </div>
          )}
        </div>
      ) : (
        <BatchesTab
          batches={batches}
          classes={classes}
          onAdd={() => setBatchDialog({ open: true, batch: null })}
          onEdit={(batch) => setBatchDialog({ open: true, batch })}
        />
      )}

      {departmentDialog.open && (
        <DepartmentDialog
          key={departmentDialog.department?.id ?? "new"}
          open={departmentDialog.open}
          onClose={() => setDepartmentDialog({ open: false, department: null })}
          department={departmentDialog.department}
        />
      )}

      {courseDialog?.open && (
        <CourseDialog
          key={courseDialog.course?.id ?? "new"}
          open={courseDialog.open}
          onClose={() => setCourseDialog(null)}
          course={courseDialog.course}
          departments={departments}
          defaultDepartmentId={effectiveDepartmentId}
        />
      )}

      {batchDialog.open && (
        <BatchDialog
          key={batchDialog.batch?.id ?? "new"}
          open={batchDialog.open}
          onClose={() => setBatchDialog({ open: false, batch: null })}
          batch={batchDialog.batch}
        />
      )}
    </div>
  );
}
