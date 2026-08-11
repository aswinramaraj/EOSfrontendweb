import type { ComponentType, SVGProps } from "react";
import { MinusIcon, TrendDownIcon, TrendUpIcon } from "@/shared/components/icons";
import { Sparkline } from "@/shared/components/ui/charts";

// "neutral" (was "purple") — a KPI that's just a count with no inherent
// positive/negative/at-risk meaning (e.g. Admissions this cycle, Faculty on
// roll) gets the neutral treatment rather than a decorative extra hue; color
// here is reserved for tiles that actually carry a status meaning.
type Tone = "info" | "success" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-primary-tint text-primary",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
  neutral: "bg-slate-100 text-slate-500",
};

interface KpiCardProps {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: Tone;
  value?: string | number;
  trend?: { dir: "up" | "down" | "flat"; value: string; note: string };
  spark?: number[];
  /** When set, the card shows this instead of a value — nothing here is fabricated. */
  pendingReason?: string;
}

export function KpiCard({ label, icon: Icon, tone = "info", value, trend, spark, pendingReason }: KpiCardProps) {
  const TrendIcon = trend?.dir === "up" ? TrendUpIcon : trend?.dir === "down" ? TrendDownIcon : MinusIcon;
  const trendColor =
    trend?.dir === "up" ? "text-success" : trend?.dir === "down" ? "text-danger" : "text-slate-400";

  return (
    <div
      className={`flex min-h-36 flex-col justify-between gap-3 rounded-xl border bg-white p-5 ${
        pendingReason ? "border-dashed border-slate-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>

      {pendingReason ? (
        <div>
          <p className="text-lg font-semibold text-slate-300">—</p>
          <p className="mt-1 text-xs leading-snug text-slate-400">{pendingReason}</p>
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          <div className="flex items-center justify-between gap-2">
            {trend && (
              <span className={`flex min-w-0 items-center gap-1 whitespace-nowrap text-xs font-medium ${trendColor}`}>
                <TrendIcon className="h-3.5 w-3.5 shrink-0" />
                {trend.value}
                <span className="truncate font-normal text-slate-400">{trend.note}</span>
              </span>
            )}
            {spark && <Sparkline data={spark} className="h-6 w-14 shrink-0" />}
          </div>
        </>
      )}
    </div>
  );
}
