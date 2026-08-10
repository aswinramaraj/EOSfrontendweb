interface PercentStatTileProps {
  label: string;
  percent: number;
  subtitle: string;
}

// Shared "percentage first" tile for attendance-style metrics across HR —
// leads with the percentage (the number that actually answers "is this OK?"),
// keeps the raw count as supporting context, and uses a thin bar so several
// tiles read at a glance in a row instead of requiring per-tile arithmetic.
// One universal color throughout (dark text, blue bar) rather than tone
// coding per metric — a red "Absent" tile next to a green "Full Day" tile
// read as inconsistent/alarming rather than as a single coherent dashboard.
export function PercentStatTile({ label, percent, subtitle }: PercentStatTileProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{percent.toFixed(1)}%</p>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
