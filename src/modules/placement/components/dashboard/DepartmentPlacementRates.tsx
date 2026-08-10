interface DepartmentPlacementRatesProps {
  data: { department: string; placed: number; total: number }[];
}

export function DepartmentPlacementRates({ data }: DepartmentPlacementRatesProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-900">Placement rate by department</h3>
      <p className="mt-0.5 text-sm text-slate-500">Share of eligible students placed</p>

      <div className="mt-5 flex flex-col gap-4">
        {data.map((d) => {
          const pct = d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0;
          return (
            <div key={d.department}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{d.department}</p>
                <p className="text-sm text-slate-500">
                  {d.placed} / {d.total} · {pct}%
                </p>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
