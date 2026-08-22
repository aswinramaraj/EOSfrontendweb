"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeftIcon, ChevronsRightIcon } from "@/shared/components/icons";
import { PLACEMENT_NAV, type PlacementNavItem } from "../nav";
import { useCompanies } from "../hooks/useCompanies";
import { useDrives } from "../hooks/useDrives";
import { useEligibleStudents } from "../hooks/useEligibleStudents";

interface PlacementSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function PlacementSidebar({ collapsed, onToggleCollapsed }: PlacementSidebarProps) {
  const pathname = usePathname();
  const students = useEligibleStudents();
  const companies = useCompanies({ page_size: 1 });
  const drives = useDrives();

  const badgeValues: Partial<Record<PlacementNavItem["badgeKey"] & string, number>> = {
    students: students.data?.length,
    companies: companies.data?.total,
    drives: drives.data?.length,
  };

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
        {PLACEMENT_NAV.map((group, groupIndex) => (
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
              const active = item.href === "/placement" ? pathname === "/placement" : pathname.startsWith(item.href);
              const Icon = item.icon;
              const badge = item.badgeKey ? badgeValues[item.badgeKey] : undefined;
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
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {badge != null && (
                        <span
                          style={{
                            fontFamily: "var(--font-ibm-plex-mono)",
                            fontSize: 10.5,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: active ? "#dbe6ff" : "#eff2f7",
                            color: active ? "#1f4fd8" : "#77808f",
                          }}
                        >
                          {badge.toLocaleString("en-IN")}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div style={{ padding: "14px 18px", borderTop: "1px solid #eef1f6" }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "#16224a" }}>Placement Cell Helpdesk</div>
          <div style={{ fontSize: 11, color: "#8b95a6", marginTop: 3 }}>Block B, Ground Floor · ext. 2043</div>
        </div>
      )}
    </aside>
  );
}
