"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../Icon";
import { isActiveRoute } from "../Navigation/isActiveRoute";
import { NAV, SESSION } from "./nav-data";

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 flex h-screen shrink-0 flex-col border-r bg-white transition-[width] duration-[180ms]"
      style={{
        width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="flex h-[var(--topbar-h)] items-center gap-2 border-b px-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <img src="/assest/secelogo.png" alt="Sri Eshwar College of Engineering" className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-bold text-[var(--text-primary)]">Sri Eshwar</p>
            <p className="truncate text-[10px] text-[var(--text-tertiary)]">College of Engineering</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = isActiveRoute(pathname, item.href);
              const content = (
                <>
                  <Icon name={item.icon} size={18} className="shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.soon && (
                    <span
                      className="rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium"
                      style={{ background: "var(--c-gray-100)", color: "var(--text-tertiary)" }}
                    >
                      Soon
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className="rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium"
                      style={
                        item.badgeTone === "alert"
                          ? { background: "var(--c-danger-50)", color: "var(--c-danger-700)" }
                          : { background: "var(--c-primary-50)", color: "var(--c-primary-700)" }
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              );

              const className = `relative flex items-center gap-2.5 rounded-[var(--r-md)] px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-[var(--c-primary-50)] text-[var(--c-primary-700)]"
                  : item.soon
                    ? "cursor-default text-[var(--text-tertiary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--c-gray-50)]"
              }`;

              const indicator = isActive && (
                <span
                  className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full"
                  style={{ background: "var(--c-primary-600)" }}
                />
              );

              return item.href && !item.soon ? (
                <Link key={item.id} href={item.href} className={className} title={item.label}>
                  {indicator}
                  {content}
                </Link>
              ) : (
                <button key={item.id} type="button" disabled={item.soon} className={className} title={item.label}>
                  {indicator}
                  {content}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t p-3" style={{ borderColor: "var(--border-subtle)" }}>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-[var(--r-md)] p-2 text-left hover:bg-[var(--c-gray-50)]"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{ background: "var(--c-primary-100)", color: "var(--c-primary-700)" }}
          >
            {SESSION.initials}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[13px] font-medium text-[var(--text-primary)]">
                  {SESSION.name}
                </span>
                <span className="block truncate text-[12px] text-[var(--text-tertiary)]">{SESSION.role}</span>
              </span>
              <Icon name="chevronDown" size={14} className="shrink-0 text-[var(--text-tertiary)]" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
