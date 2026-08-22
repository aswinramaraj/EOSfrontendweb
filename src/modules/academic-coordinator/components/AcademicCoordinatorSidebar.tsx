"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeftIcon, ChevronsRightIcon } from "@/shared/components/icons";
import { COORDINATOR_NAV } from "../nav";

interface AcademicCoordinatorSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function AcademicCoordinatorSidebar({ collapsed, onToggleCollapsed }: AcademicCoordinatorSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: collapsed ? 76 : 246,
        flex: `0 0 ${collapsed ? 76 : 246}px`,
        background: "#ffffff",
        color: "#46536a",
        borderRight: "1px solid #e6eaf1",
        transition: "flex-basis .18s ease, width .18s ease",
      }}
      className="flex h-full flex-col overflow-y-auto"
    >
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 16 }}>
        {COORDINATOR_NAV.map((group, groupIndex) => (
          <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {(!collapsed || groupIndex === 0) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "space-between",
                  padding: "4px 10px 6px 10px",
                }}
              >
                {!collapsed && (
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "1.1px", color: "#9aa5b8" }}>
                    {group.label}
                  </span>
                )}
                {groupIndex === 0 && (
                  <button
                    type="button"
                    onClick={onToggleCollapsed}
                    aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
                    title={collapsed ? "Expand navigation" : "Collapse navigation"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      color: "#9aa5b8",
                      flexShrink: 0,
                    }}
                    className="hover:bg-[#f3f6fc] hover:text-[#5b6577]"
                  >
                    {collapsed ? (
                      <ChevronsRightIcon style={{ width: 15, height: 15 }} />
                    ) : (
                      <ChevronsLeftIcon style={{ width: 15, height: 15 }} />
                    )}
                  </button>
                )}
              </div>
            )}
            {group.items.map((item) => {
              const active =
                item.href === "/academic-coordinator" ? pathname === "/academic-coordinator" : pathname.startsWith(item.href);
              const Icon = item.icon;

              if (item.soon) {
                return (
                  <button
                    key={item.href}
                    type="button"
                    disabled
                    title={`${item.label} — coming next`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "9px 11px",
                      borderRadius: 9,
                      fontSize: 14,
                      justifyContent: collapsed ? "center" : undefined,
                      color: "#b7bfcc",
                      fontWeight: 500,
                      cursor: "not-allowed",
                    }}
                  >
                    <Icon style={{ width: 19, height: 19, flexShrink: 0, opacity: 0.7 }} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 650,
                            padding: "2px 7px",
                            borderRadius: 20,
                            background: "#eff2f7",
                            color: "#9aa5b8",
                          }}
                        >
                          Soon
                        </span>
                      </>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "9px 11px",
                    borderRadius: 9,
                    fontSize: 14,
                    justifyContent: collapsed ? "center" : undefined,
                    background: active ? "#e8f0fe" : undefined,
                    color: active ? "#1f4fd8" : "#3f4b60",
                    fontWeight: active ? 650 : 500,
                  }}
                  className="hover:bg-[#f3f6fc]"
                >
                  <Icon style={{ width: 19, height: 19, flexShrink: 0, opacity: 0.9 }} />
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div style={{ padding: "14px 18px", borderTop: "1px solid #eef1f6" }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#16224a" }}>Academic Coordinator</div>
          <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 3 }}>Academic Affairs Office</div>
        </div>
      )}
    </aside>
  );
}
