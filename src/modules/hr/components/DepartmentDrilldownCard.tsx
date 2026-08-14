import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ChevronRightIcon } from "@/shared/components/icons";
import { HOVERABLE } from "@/modules/hr/components/ui/hoverable";

export interface DepartmentDrilldownMetric {
  label: string;
  value: ReactNode;
  sublabel?: string;
  highlight?: boolean;
}

interface DepartmentDrilldownCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  code: string;
  badge?: ReactNode;
  alert?: boolean;
  metrics: DepartmentDrilldownMetric[];
  href: string;
  linkLabel: string;
}

// Shared shell for every "department drill-down" card in HR — Departments
// and Faculty Attendance both show a grid of per-department cards with the
// same anatomy (icon, name/code, a status badge, a metric grid, a "View X"
// link) and only differ in which metrics/badge/link they carry. Keeping one
// component means both pages read as the same pattern to HR instead of two
// similar-but-not-quite-matching designs.
export function DepartmentDrilldownCard({
  icon: Icon,
  name,
  code,
  badge,
  alert,
  metrics,
  href,
  linkLabel,
}: DepartmentDrilldownCardProps) {
  return (
    <div className={`relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 ${HOVERABLE}`}>
      {alert && <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-red-500" />}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">Code: {code}</p>
          </div>
        </div>
        {badge}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{metric.label}</p>
            <p className={`mt-0.5 text-lg font-bold ${metric.highlight ? "text-red-600" : "text-slate-900"}`}>
              {metric.value}
            </p>
            {metric.sublabel && <p className="mt-0.5 text-[11px] text-slate-400">{metric.sublabel}</p>}
          </div>
        ))}
      </div>

      <Link
        href={href}
        className="flex items-center gap-1 border-t border-slate-100 pt-3 text-sm font-medium text-blue-700 hover:text-blue-800"
      >
        {linkLabel}
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
