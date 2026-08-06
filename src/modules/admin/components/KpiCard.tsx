import type { ComponentType, SVGProps } from "react";
import { MinusIcon, TrendDownIcon, TrendUpIcon } from "@/shared/components/icons";
import { Sparkline } from "@/shared/components/ui/charts";

type Tone = "info" | "success" | "warning" | "purple" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-blue-50 text-blue-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  purple: "bg-violet-50 text-violet-600",
  danger: "bg-red-50 text-red-600",
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
    trend?.dir === "up" ? "text-emerald-600" : trend?.dir === "down" ? "text-red-600" : "text-slate-400";

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
