"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CheckIcon } from "@/shared/components/icons";

export interface ColumnOption {
  key: string;
  label: string;
  /** Always visible, not offered as a toggle (e.g. the identity column). */
  locked?: boolean;
}

interface ColumnsMenuProps {
  columns: ColumnOption[];
  visible: Set<string>;
  onToggle: (key: string) => void;
}

const PANEL_WIDTH = 224; // w-56

export function ColumnsMenu({ columns, visible, onToggle }: ColumnsMenuProps) {
  const [open, setOpen] = useState(false);
  // Which side the panel's own edge anchors to. Decided at open time from the
  // button's actual position — this button sits at the end of a flex-wrap
  // toolbar, so whether it lands near the left or right edge of the viewport
  // varies with viewport width and how many filters fit per row. A fixed
  // side overflows the window on one side or the other; "right" only overran
  // the sidebar with room to spare, "left" only overran the browser edge —
  // so pick whichever one the current position actually has room for.
  const [align, setAlign] = useState<"left" | "right">("right");
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const roomOnRight = window.innerWidth - rect.left;
    setAlign(roomOnRight >= PANEL_WIDTH ? "left" : "right");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 4v16M15 4v16" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        Columns
      </button>

      {open && (
        <div
          className={`absolute z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Visible columns
          </p>
          {columns.map((col) => {
            const isVisible = col.locked || visible.has(col.key);
            return (
              <button
                key={col.key}
                type="button"
                disabled={col.locked}
                onClick={() => onToggle(col.key)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                  col.locked ? "cursor-default text-slate-400" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {col.label}
                {isVisible && <CheckIcon className="h-4 w-4 text-blue-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
