"use client";

import type { Department, SchoolClass } from "../types";

interface DepartmentRailProps {
  departments: Department[];
  classes: SchoolClass[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Omit to render read-only (no "+ Add department" button) — e.g. for a coordinator viewing the real structure without Admin's write access. */
  onAdd?: () => void;
}

export function DepartmentRail({ departments, classes, selectedId, onSelect, onAdd }: DepartmentRailProps) {
  return (
    <aside style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "13px 16px", borderBottom: "1px solid #eef1f6" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".4px", color: "#9aa5b8" }}>DEPARTMENTS</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {departments.length === 0 && (
          <p style={{ fontSize: 12.5, color: "#96a0b0", padding: "14px 10px" }}>No departments yet. Add the first one to begin.</p>
        )}
        {departments.map((d) => {
          const classCount = classes.filter((c) => c.department_id === d.id).length;
          const active = d.id === selectedId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left",
                padding: "9px 10px",
                borderRadius: 8,
                background: active ? "#e8f0fe" : undefined,
                marginBottom: 2,
              }}
              className={!active ? "hover:bg-[#f3f6fb]" : undefined}
            >
              <span
                style={{
                  fontFamily: "var(--font-ibm-plex-mono)",
                  fontSize: 10,
                  fontWeight: 650,
                  padding: "3px 6px",
                  borderRadius: 4,
                  background: active ? "#dbe6ff" : "#eff2f7",
                  color: active ? "#1f4fd8" : "#77808f",
                  flexShrink: 0,
                }}
              >
                {d.code}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: active ? 650 : 550, color: active ? "#1f4fd8" : "#14181f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 10.5, color: "#96a0b0", marginTop: 1 }}>
                  {classCount} {classCount === 1 ? "class" : "classes"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {onAdd && (
        <div style={{ padding: 10, borderTop: "1px solid #eef1f6" }}>
          <button
            type="button"
            onClick={onAdd}
            style={{
              width: "100%",
              height: 34,
              border: "1px solid #dfe4ec",
              borderRadius: 8,
              background: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#2c3542",
            }}
            className="hover:bg-[#f3f6fb]"
          >
            + Add department
          </button>
        </div>
      )}
    </aside>
  );
}
