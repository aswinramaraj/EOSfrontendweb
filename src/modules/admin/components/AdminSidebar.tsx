"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XIcon } from "@/shared/components/icons";
import { ADMIN_NAV } from "../nav";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

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
        {ADMIN_NAV.map((group) => (
          <div key={group.label} className="mb-3 flex flex-col gap-0.5">
            <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
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
