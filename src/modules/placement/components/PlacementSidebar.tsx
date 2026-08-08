"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XIcon } from "@/shared/components/icons";
import { PLACEMENT_NAV } from "../nav";
import { useUnreadNotificationsCount } from "../hooks/useNotifications";

interface PlacementSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function PlacementSidebar({ mobileOpen, onCloseMobile }: PlacementSidebarProps) {
  const pathname = usePathname();
  const unreadCount = useUnreadNotificationsCount();

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

      <nav className="flex flex-col gap-1.5 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Placement Cell
        </p>
        {PLACEMENT_NAV.map((item) => {
          const active = item.href === "/placement" ? pathname === "/placement" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const showBadge = item.href === "/placement/notifications" && unreadCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
                active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  active ? "bg-blue-100" : "bg-slate-100"
                }`}
              >
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
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
