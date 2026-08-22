"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useSubjects } from "@/modules/academic-coordinator/hooks/useSubjectsQueries";
import { SUBJECT_COURSE_TYPE_LABELS } from "@/modules/academic-coordinator/types";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { BookIcon, LayersIcon, AwardIcon, ClockIcon } from "@/shared/components/icons";

function StatCard({ icon: Icon, value, label }: { icon: typeof BookIcon; value: string | number; label: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 46, height: 46, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon style={{ width: 21, height: 21, color: "#1f4fd8" }} />
      </span>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.4px", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#3f4b60", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function AcademicCoordinatorDashboardPage() {
  const router = useRouter();
  const departments = useDepartments();
  const subjects = useSubjects();

  const deptCodeById = useMemo(() => new Map((departments.data ?? []).map((d) => [d.id, d.code])), [departments.data]);

  const totalCourses = subjects.data?.length ?? 0;
  const totalDepartments = useMemo(
    () => new Set((subjects.data ?? []).map((s) => s.departmentId).filter((id): id is number => id != null)).size,
    [subjects.data],
  );
  const totalCredits = useMemo(() => (subjects.data ?? []).reduce((sum, s) => sum + (s.credits ?? 0), 0), [subjects.data]);
  const recentCount = Math.min(totalCourses, 5);

  const recentRows = useMemo(
    () => [...(subjects.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [subjects.data],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".9px", color: "#9aa5b8" }}>QUICK ACTIONS</span>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button type="button" style={pageButtonStyle(false)} onClick={() => router.push("/academic-coordinator/create")}>
            Create a course
          </button>
          <button type="button" style={pageButtonStyle(false)} onClick={() => router.push("/academic-coordinator/map")}>
            Map outcomes
          </button>
          <button type="button" style={pageButtonStyle(false)} onClick={() => router.push("/academic-coordinator/feedback")}>
            Collect feedback
          </button>
          <button type="button" style={pageButtonStyle(false)} onClick={() => router.push("/academic-coordinator/academic-calendar")}>
            Open calendar
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
        <StatCard icon={BookIcon} value={totalCourses} label="Total courses" />
        <StatCard icon={LayersIcon} value={totalDepartments} label="Total departments" />
        <StatCard icon={AwardIcon} value={totalCredits} label="Total credits" />
        <StatCard icon={ClockIcon} value={recentCount} label="Recently added courses" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eef1f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, letterSpacing: "-.2px" }}>Recently added courses</h2>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "#eaf0fe", color: "#1f4fd8" }}>
              {totalCourses} total
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/academic-coordinator/create")}
            style={{ fontSize: 12.5, fontWeight: 600, color: "#1f4fd8", background: "none", border: "none", cursor: "pointer" }}
          >
            Open course register →
          </button>
        </div>

        {totalCourses === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>No courses in the register yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 2.2fr 0.8fr 1.4fr 1fr", gap: 14, padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #eaeef4" }}>
              {["CODE", "SUBJECT", "CREDITS", "TYPE", "DEPARTMENT"].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 650, color: "#77808f", letterSpacing: ".3px" }}>
                  {h}
                </span>
              ))}
            </div>
            {recentRows.map((s) => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 2.2fr 0.8fr 1.4fr 1fr", gap: 14, padding: "12px 20px", borderBottom: "1px solid #f3f5f9", fontSize: 12.5 }}>
                <span style={{ fontWeight: 700, color: "#1f4fd8" }}>{s.subjectCode}</span>
                <span>{s.name}</span>
                <span>{s.credits ?? "—"}</span>
                <span style={{ color: "#77808f" }}>{s.courseType ? SUBJECT_COURSE_TYPE_LABELS[s.courseType] : "—"}</span>
                <span style={{ color: "#77808f" }}>{s.departmentId != null ? (deptCodeById.get(s.departmentId) ?? "—") : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
