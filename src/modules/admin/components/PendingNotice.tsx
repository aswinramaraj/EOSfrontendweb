import { AlertTriangleIcon } from "@/shared/components/icons";

/** Marks a chart/table that has no real data source yet — never fabricated. */
export function PendingNotice({ reason, height }: { reason: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-4 text-center"
      style={{ minHeight: height ?? 140 }}
    >
      <AlertTriangleIcon className="h-5 w-5 text-slate-300" />
      <p className="max-w-sm text-xs leading-relaxed text-slate-400">{reason}</p>
    </div>
  );
}
