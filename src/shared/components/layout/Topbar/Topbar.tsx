"use client";

import Image from "next/image";
import { MenuIcon } from "@/shared/components/icons";
import { Icon } from "../Icon";
import { SESSION } from "../Sidebar/nav-data";

interface TopbarProps {
  onOpenMobileNav: () => void;
}

// Visually mirrors the other modules' header (LibraryTopbar/HostelTopbar) —
// same gradient, logo, title block and glow sweep — so all modules share one
// look. Only the right-side controls differ, since Fees & Finance keeps its
// own quick-create/notifications/help affordances instead of a logout button
// (the outer app chrome owns that).
export function Topbar({ onOpenMobileNav }: TopbarProps) {
  return (
    <header className="relative isolate z-10 overflow-hidden bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 px-6 py-4">
      <div className="animate-header-glow absolute inset-y-0 left-0 z-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="text-white/80 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <Image
            src="/assest/secelogo.png"
            alt="Sri Eshwar College of Engineering logo"
            width={148}
            height={148}
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold leading-tight text-white sm:text-xl">
              Fees &amp; Finance Module
            </h1>
            <p className="text-xs font-medium tracking-wide text-blue-100">
              Sri Eshwar College of Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center rounded-md bg-white/15 px-2 py-1 text-[12px] font-medium text-white sm:inline-flex">
            {SESSION.academicYear}
          </span>
          <span className="hidden items-center rounded-md bg-white/15 px-2 py-1 text-[12px] font-medium text-white sm:inline-flex">
            {SESSION.term}
          </span>

          <span className="mx-1 hidden h-5 w-px bg-white/25 sm:inline-block" />

          <button
            type="button"
            aria-label="Quick create"
            title="Quick create"
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Icon name="plus" size={18} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Icon name="bell" size={18} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-400" />
          </button>
          <button
            type="button"
            aria-label="Help"
            title="Help & documentation"
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Icon name="help" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
