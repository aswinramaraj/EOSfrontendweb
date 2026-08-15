import type { ComponentType, SVGProps } from "react";

// One accent color carries real meaning (blue = primary/neutral count, green =
// success, amber = warning, red = alert); everything without a status meaning
// of its own uses "slate" rather than reaching for another hue just for
// variety — decorative per-card color competes with the one accent that's
// supposed to do all the work.
export type StatCardTone = "blue" | "green" | "amber" | "red" | "slate";

const TONE_CLASSES: Record<StatCardTone, string> = {
  blue: "bg-primary-tint text-primary",
  green: "bg-success-tint text-success",
  amber: "bg-warning-tint text-warning",
  red: "bg-danger-tint text-danger",
  slate: "bg-slate-100 text-slate-500",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: StatCardTone;
  /** Small muted line under the value — e.g. "+11.4% vs last year". */
  caption?: string;
  /** Small bold chip next to the value — e.g. "+142 MTD". Only render when backed by a real historical comparison; never fabricate a delta. */
  delta?: string;
  /** 0-100 — renders a thin progress bar under the value/caption. */
  progressPercent?: number;
}

export function StatCard({ label, value, icon: Icon, tone = "blue", caption, delta, progressPercent }: StatCardProps) {
  return (
    <div className="flex min-h-32.5 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
      </div>
      <div>
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {delta && (
          <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{delta}</span>
        )}
        {caption && <p className="mt-0.5 text-xs text-slate-400">{caption}</p>}
        {progressPercent != null && (
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
