"use client";

import Image from "next/image";
import { LogOutIcon, MenuIcon } from "@/shared/components/icons";
import type { AuthUser } from "@/modules/auth/types";

interface PlacementTopbarProps {
  user: AuthUser;
  onOpenMobileNav: () => void;
  onLogout: () => void;
}

export function PlacementTopbar({ user, onOpenMobileNav, onLogout }: PlacementTopbarProps) {
  return (
    <header className="relative isolate z-10 overflow-hidden bg-linear-to-r from-blue-800 via-blue-700 to-blue-500 px-6 py-4">
      <div className="animate-header-glow absolute inset-y-0 left-0 z-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
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
              Placement Cell
            </h1>
            <p className="text-xs font-medium tracking-wide text-blue-100">
              Sri Eshwar College of Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user.email}</p>
            <p className="text-xs capitalize text-blue-100">{user.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-md border border-white/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            <LogOutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
