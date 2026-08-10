"use client";

import { useEffect } from "react";
import { XIcon } from "@/shared/components/icons";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  headActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Right-hand slide-in panel — mirrors the reference's `ERP.drawer.open()` (aside.drawer / .drawer-head / .drawer-body / .drawer-foot). */
export function Drawer({ open, onClose, eyebrow, title, headActions, footer, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/45" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{eyebrow}</div>
            )}
            <h2 className="truncate text-base font-bold text-slate-900">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <XIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</div>}
      </aside>
    </>
  );
}
