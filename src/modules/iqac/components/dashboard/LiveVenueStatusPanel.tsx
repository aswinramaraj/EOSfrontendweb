import type { LiveVenueStatus } from "../../types/venue-booking";

export function LiveVenueStatusPanel({ venues, isLoading }: { venues: LiveVenueStatus[]; isLoading: boolean }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5">
        <h2 className="text-[15.5px] font-bold text-slate-900">Live venue status</h2>
      </div>
      {isLoading && <div className="px-5 py-6 text-sm text-slate-500">Loading…</div>}
      {!isLoading &&
        venues.map((v) => (
          <div key={v.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 last:border-b-0">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${v.state === "in_use" ? "bg-red-500" : "bg-green-500"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-slate-800">{v.name}</div>
              <div className="text-xs text-slate-400">{v.note}</div>
            </div>
            <span className={`text-xs font-semibold ${v.state === "in_use" ? "text-red-600" : "text-green-600"}`}>
              {v.state === "in_use" ? "In use" : "Free"}
            </span>
          </div>
        ))}
    </section>
  );
}
