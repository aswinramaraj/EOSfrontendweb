interface DashboardCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}

export function DashboardCard({ title, subtitle, actions, children, bodyClassName }: DashboardCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className={bodyClassName ?? "p-5"}>{children}</div>
    </div>
  );
}
