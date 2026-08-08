import Link from "next/link";
import type { UpcomingDrive } from "../../types";

interface UpcomingDrivesCardProps {
  drives: UpcomingDrive[];
}

export function UpcomingDrivesCard({ drives }: UpcomingDrivesCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Upcoming drives</h3>
          <p className="mt-0.5 text-sm text-slate-500">Next four weeks</p>
        </div>
        <Link
          href="/placement/drives"
          className="shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          View all
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {drives.map((d) => (
          <div key={d.id} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-blue-700 text-white">
              <span className="text-sm font-bold leading-none">{d.day}</span>
              <span className="text-[9px] font-semibold uppercase leading-none">{d.month}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{d.company}</p>
              {(d.role || d.venue) && (
                <p className="text-xs text-slate-500">{[d.role, d.venue].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          </div>
        ))}
        {drives.length === 0 && <p className="text-sm text-slate-500">No drives scheduled yet.</p>}
      </div>
    </div>
  );
}
