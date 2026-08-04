import type { ReactNode } from "react";

interface DashboardCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function DashboardCard({
  icon,
  title,
  subtitle,
  action,
  className = "",
  contentClassName = "p-5",
  children,
}: DashboardCardProps) {
  return (
    <section className={`flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-2.5">
          {icon && <span className="mt-0.5 text-indigo-600">{icon}</span>}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className={`flex-1 ${contentClassName}`}>{children}</div>
    </section>
  );
}
