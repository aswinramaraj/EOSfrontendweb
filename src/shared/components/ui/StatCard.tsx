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
}

export function StatCard({ label, value, icon: Icon, tone = "blue" }: StatCardProps) {
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
      <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
    </div>
  );
}
