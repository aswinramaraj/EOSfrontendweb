import type { ComponentType, SVGProps } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex min-h-32.5 flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
      </div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}
