"use client";

import { useMemo, useState } from "react";
import { useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useCoordinatorFacultyList, useCoordinatorFacultyProfile, useCoordinatorFacultyWorkload } from "@/modules/academic-coordinator/hooks/useFacultyQueries";
import { placementSelectStyle } from "@/modules/placement/components/table/PlacementTable";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.4px" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#77808f", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function CoordinatorFacultyPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const departments = useDepartments();
  const list = useCoordinatorFacultyList({ q: search.trim() || undefined, department_id: deptFilter === "All" ? undefined : Number(deptFilter) });
  const workload = useCoordinatorFacultyWorkload();
  const faculty = list.data?.faculty ?? [];
  const effectiveSelectedId = selectedId ?? faculty[0]?.id ?? null;
  const profile = useCoordinatorFacultyProfile(effectiveSelectedId);

  const hoursById = useMemo(() => new Map((workload.data?.summary ?? []).map((s) => [s.facultyId, s.weeklyHours])), [workload.data]);

  const overloadedCount = (workload.data?.summary ?? []).filter((s) => s.weeklyHours > s.weeklyLoadCapHours).length;
  const avgLoad = workload.data?.summary.length
    ? Math.round((workload.data.summary.reduce((sum, s) => sum + s.weeklyHours, 0) / workload.data.summary.length) * 10) / 10
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Faculty Management</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>Directory, profiles and workload — institution-wide.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <StatCard label="Total faculty" value={list.data?.total ?? 0} />
        <StatCard label="Active" value={list.data?.total ?? 0} />
        <StatCard label="Average load" value={`${avgLoad} hrs`} />
        <StatCard label="Overloaded" value={overloadedCount} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr minmax(300px,1fr)", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eef1f6", flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Faculty directory</h2>
            <div style={{ display: "flex", gap: 9 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or designation"
                style={{ height: 34, minWidth: 220, border: "1px solid #dfe4ec", borderRadius: 8, padding: "0 12px", fontSize: 12.5, outline: "none" }}
              />
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={placementSelectStyle}>
                <option value="All">All departments</option>
                {(departments.data ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1.6fr 1.4fr 0.7fr 0.7fr 0.9fr", gap: 12, padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #eaeef4" }}>
            {["ID", "NAME", "DESIGNATION", "DEPT", "LOAD", "STATUS"].map((h) => (
              <span key={h} style={{ fontSize: 10.5, fontWeight: 650, color: "#77808f", letterSpacing: ".3px" }}>
                {h}
              </span>
            ))}
          </div>

          {list.isLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>Loading…</div>
          ) : faculty.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>No faculty match these filters.</div>
          ) : (
            faculty.map((f, i) => {
              const active = f.id === effectiveSelectedId;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "0.7fr 1.6fr 1.4fr 0.7fr 0.7fr 0.9fr",
                    gap: 12,
                    alignItems: "center",
                    padding: "11px 20px",
                    borderBottom: "1px solid #f3f5f9",
                    fontSize: 12.5,
                    cursor: "pointer",
                    background: active ? "#e8f1fe" : i % 2 ? "#f5f9ff" : "#fff",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 11, color: "#77808f" }}>FAC{f.id}</span>
                  <span style={{ fontWeight: 600 }}>{f.name}</span>
                  <span style={{ color: "#77808f" }}>{f.designation ?? "—"}</span>
                  <span>{f.department?.code ?? "—"}</span>
                  <span>{hoursById.has(f.id) ? `${hoursById.get(f.id)} hrs` : "—"}</span>
                  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 5, background: "#e6f4ea", color: "#1e7e34", width: "fit-content" }}>
                    Active
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 20, position: "sticky", top: 16 }}>
          {!profile.data ? (
            <p style={{ fontSize: 12.5, color: "#96a0b0" }}>Select a faculty member to view their profile.</p>
          ) : (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".4px", color: "#9aa5b8" }}>FACULTY PROFILE</span>
              <h2 style={{ margin: "6px 0 2px 0", fontSize: 18, fontWeight: 700 }}>{profile.data.name}</h2>
              <p style={{ margin: 0, fontSize: 12, color: "#77808f" }}>
                FAC{profile.data.id} · {profile.data.designation ?? "—"} · {profile.data.department?.code ?? "—"}
              </p>

              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Email", profile.data.email],
                  ["Phone", profile.data.phone ?? "—"],
                  ["Specialization", profile.data.specialization ?? "—"],
                  ["Employment", profile.data.employmentType ?? "—"],
                  ["Status", profile.data.status],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, borderBottom: "1px solid #f1f4f8", paddingBottom: 7 }}>
                    <span style={{ color: "#77808f" }}>{label}</span>
                    <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".4px", color: "#9aa5b8" }}>ASSIGNED COURSES</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, maxHeight: 220, overflowY: "auto" }}>
                  {profile.data.courses.length === 0 ? (
                    <p style={{ fontSize: 12, color: "#96a0b0", margin: 0 }}>No courses assigned.</p>
                  ) : (
                    profile.data.courses.map((c) => (
                      <div key={c.mappingId} style={{ display: "flex", justifyContent: "space-between", gap: 8, border: "1px solid #eef1f6", borderRadius: 7, padding: "6px 10px", fontSize: 11.5 }}>
                        <span style={{ fontWeight: 700, color: "#1f4fd8", flexShrink: 0 }}>{c.subjectCode}</span>
                        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.classLabel}</span>
                        <span style={{ color: "#96a0b0", flexShrink: 0 }}>{c.weeklyHours} hrs</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".4px", color: "#9aa5b8" }}>WEEKLY WORKLOAD</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {profile.data.weeklyLoadHours} / {profile.data.weeklyLoadCapHours} hrs
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#eceff5", overflow: "hidden", marginTop: 8 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, Math.round((profile.data.weeklyLoadHours / profile.data.weeklyLoadCapHours) * 100))}%`,
                      background: profile.data.weeklyLoadHours > profile.data.weeklyLoadCapHours ? "#dc2626" : "#1f4fd8",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
