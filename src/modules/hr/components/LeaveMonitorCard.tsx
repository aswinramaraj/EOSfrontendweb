import type { ComponentType, SVGProps } from "react";
import { HOVERABLE } from "./ui/hoverable";

interface LeaveMonitorCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName: string;
  label: string;
  percent: number;
  subtitle: string;
  names: string[];
  emptyLabel: string;
}

// Same anatomy as the percentage tiles used across HR (icon, label, big %,
// subtitle, universal blue bar) plus a names list — the tiles elsewhere only
// ever needed the number, but "who specifically" is the actual point of a
// leave-type or absence monitor, so it's shown directly rather than requiring
// a click-through.
export function LeaveMonitorCard({ icon: Icon, iconClassName, label, percent, subtitle, names, emptyLabel }: LeaveMonitorCardProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3.5 ${HOVERABLE}`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="mt-2 truncate text-xs font-semibold text-slate-700" title={label}>
        {label}
      </p>
      <p className="mt-0.5 text-lg font-black tracking-tight text-slate-900">{percent.toFixed(1)}%</p>
      <p className="mt-0.5 truncate text-[11px] text-slate-500" title={subtitle}>
        {subtitle}
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${clamped}%` }} />
      </div>
      {names.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1 border-t border-slate-100 pt-2">
          {names.slice(0, 3).map((name) => (
            <span key={name} className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
              {name}
            </span>
          ))}
          {names.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+{names.length - 3} more</span>
          )}
        </div>
      ) : (
        <p className="mt-2 truncate border-t border-slate-100 pt-2 text-[11px] text-slate-400" title={emptyLabel}>
          {emptyLabel}
        </p>
      )}
    </div>
  );
}
