import type { ComponentType, SVGProps } from "react";

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
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{percent.toFixed(1)}%</p>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${clamped}%` }} />
      </div>
      {names.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {names.map((name) => (
            <span key={name} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
              {name}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">{emptyLabel}</p>
      )}
    </div>
  );
}
