"use client";

import { Icon } from "../Icon";
import { SESSION } from "../Sidebar/nav-data";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  return (
    <header
      className="sticky top-0 z-[50] flex h-[var(--topbar-h)] items-center gap-3 border-b bg-white px-4"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <button
        type="button"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        onClick={onToggleSidebar}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--r-md)] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-100)]"
      >
        <Icon name="sidebar" size={18} />
      </button>

      <button
        type="button"
        className="flex h-9 flex-1 max-w-md items-center gap-2 rounded-[var(--r-md)] border px-3 text-left text-[13px] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-50)]"
        style={{ borderColor: "var(--border-default)" }}
      >
        <Icon name="search" size={16} />
        <span className="flex-1 truncate">Search students, courses, actions...</span>
        <span
          className="rounded-[6px] border px-1.5 py-0.5 text-[11px] font-medium"
          style={{ borderColor: "var(--border-default)", color: "var(--text-tertiary)" }}
        >
          Ctrl K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span
          className="hidden items-center rounded-[6px] px-2 py-1 text-[12px] font-medium sm:inline-flex"
          style={{ background: "var(--c-gray-100)", color: "var(--text-secondary)" }}
        >
          {SESSION.academicYear}
        </span>
        <span
          className="hidden items-center rounded-[6px] px-2 py-1 text-[12px] font-medium sm:inline-flex"
          style={{ background: "var(--c-primary-50)", color: "var(--c-primary-700)" }}
        >
          {SESSION.term}
        </span>

        <span className="mx-1 h-5 w-px" style={{ background: "var(--border-subtle)" }} />

        <button
          type="button"
          aria-label="Quick create"
          title="Quick create"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--r-md)] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-100)]"
        >
          <Icon name="plus" size={18} />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-[var(--r-md)] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-100)]"
        >
          <Icon name="bell" size={18} />
          <span
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--c-danger-600)" }}
          />
        </button>
        <button
          type="button"
          aria-label="Help"
          title="Help & documentation"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--r-md)] text-[var(--text-tertiary)] hover:bg-[var(--c-gray-100)]"
        >
          <Icon name="help" size={18} />
        </button>
      </div>
    </header>
  );
}
