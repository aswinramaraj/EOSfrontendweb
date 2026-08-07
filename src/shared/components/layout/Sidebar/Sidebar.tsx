"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { XIcon } from "@/shared/components/icons";
import { Icon } from "../Icon";
import { isActiveRoute } from "../Navigation/isActiveRoute";
import { NAV, type NavItem } from "./nav-data";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

// Visually mirrors LibrarySidebar/HostelSidebar — plain white list, grouped
// section labels, bg-blue-50/text-blue-700 active state, mobile overlay —
// so every module's sidebar looks the same. Fees & Finance keeps its own
// nav-data (with indented sub-rows for each tab), rendered in that shared
// visual style.
export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // A child's href always looks like "/fees?tab=xyz" — active means we're on
  // that path AND the current `tab` query param matches, so only one tab
  // row is ever highlighted at a time.
  function isChildActive(item: NavItem): boolean {
    if (!item.href) return false;
    const [itemPath, itemQuery] = item.href.split("?");
    if (pathname !== itemPath) return false;
    const itemTab = new URLSearchParams(itemQuery).get("tab");
    return itemTab !== null && searchParams.get("tab") === itemTab;
  }

  function renderRow(item: NavItem, indented: boolean, isActive: boolean) {
    const content = (
      <>
        <Icon name={item.icon} size={indented ? 16 : 18} className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.soon && (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-400">
            Soon
          </span>
        )}
        {item.badge && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
              item.badgeTone === "alert" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            {item.badge}
          </span>
        )}
      </>
    );

    const className = `flex items-center gap-3 rounded-md py-2.5 text-[14.5px] font-medium transition-colors ${
      indented ? "pl-9 pr-3 text-[13.5px]" : "px-3"
    } ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : item.soon
          ? "cursor-default text-slate-400"
          : "text-slate-600 hover:bg-slate-50"
    }`;

    return item.href && !item.soon ? (
      <Link key={item.id} href={item.href} onClick={onCloseMobile} className={className} title={item.label}>
        {content}
      </Link>
    ) : (
      <button key={item.id} type="button" disabled={item.soon} className={className} title={item.label}>
        {content}
      </button>
    );
  }

  const content = (
    <>
      <div className="flex items-center justify-end px-4 py-3 lg:hidden">
        <button
          onClick={onCloseMobile}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close menu"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto px-4 py-4">
        {NAV.map((group) => (
          <div key={group.label || "default"} className="mb-3 flex flex-col gap-0.5">
            {group.label && (
              <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const hasChildren = !!item.children?.length;
              const childActive = hasChildren && item.children!.some((child) => isChildActive(child));
              const isActive = childActive || isActiveRoute(pathname, item.href);

              return (
                <div key={item.id}>
                  {renderRow(item, false, isActive)}
                  {hasChildren && (
                    <div className="mt-0.5 flex flex-col gap-0.5">
                      {item.children!.map((child) => renderRow(child, true, isChildActive(child)))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden h-full w-65 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white lg:flex">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-65 flex-col overflow-y-auto bg-white shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
