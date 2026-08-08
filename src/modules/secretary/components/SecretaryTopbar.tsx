"use client";

import { MenuIcon } from "@/shared/components/icons";
import type { AuthUser } from "@/modules/auth/types";

interface SecretaryTopbarProps {
  user: AuthUser;
  title: string;
  onToggleSidebar: () => void;
}

export function SecretaryTopbar({ user, title, onToggleSidebar }: SecretaryTopbarProps) {
  return (
    <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-[22px]">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="text-slate-500 hover:text-slate-700"
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="h-[18px] w-[18px]" />
        </button>
        <span className="text-lg font-semibold text-slate-900">{title}</span>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[13px] font-semibold text-white">
        {user.email.slice(0, 2).toUpperCase()}
      </span>
    </header>
  );
}
