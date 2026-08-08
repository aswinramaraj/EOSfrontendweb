"use client";

import { DownloadIcon } from "@/shared/components/icons";

interface FacultyBulkActionsBarProps {
  count: number;
  onNotify: () => void;
  onExportSelected: () => void;
  onGenerateIdCards: () => void;
  onClearSelection: () => void;
}

export function FacultyBulkActionsBar({
  count,
  onNotify,
  onExportSelected,
  onGenerateIdCards,
  onClearSelection,
}: FacultyBulkActionsBarProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-2.5 text-sm">
      <span className="font-medium text-slate-700">
        {count} row{count === 1 ? "" : "s"} selected
      </span>
      <span className="h-4 w-px bg-slate-300" />
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onNotify}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Notify
        </button>
        <button
          onClick={onExportSelected}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <DownloadIcon className="h-3.5 w-3.5" /> Export selected
        </button>
        <button
          onClick={onGenerateIdCards}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Generate ID cards
        </button>
      </div>
      <button onClick={onClearSelection} className="ml-auto text-xs font-medium text-blue-700 hover:underline">
        Clear selection
      </button>
    </div>
  );
}
