import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { formatTime } from "../../lib/format";
import { useVenueHistory } from "../../hooks/useReports";

const KIND_TONE: Record<string, PillTone> = {
  request: "amber",
  approved: "green",
  rejected: "red",
  alternative_offered: "blue",
};

export function VenueHistorySidebar({ date, onDateChange }: { date: string; onDateChange: (value: string) => void }) {
  const { data, isLoading } = useVenueHistory(date);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4.5 py-3">
        <h2 className="text-[15.5px] font-bold text-slate-900">Venue history</h2>
        <div className="flex-1" />
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
        />
      </div>

      {isLoading && <p className="px-4.5 py-6 text-sm text-slate-500">Loading…</p>}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <p className="px-4.5 py-8 text-center text-sm text-slate-500">No venue activity recorded on this date.</p>
      )}

      {!isLoading &&
        data?.map((event, i) => (
          <div key={i} className="grid grid-cols-[56px_1fr] gap-3 border-b border-slate-100 px-4.5 py-3 last:border-b-0">
            <div className="pt-0.5 text-xs font-semibold tabular-nums text-slate-500">{formatTime(event.time)}</div>
            <div>
              <div className="text-[13.5px] font-semibold text-slate-800">{event.venue}</div>
              <div className="mt-0.5 text-xs text-slate-500">{event.what}</div>
              <div className="mt-1.5">
                <StatusPill tone={KIND_TONE[event.kind] ?? "slate"}>{event.kind.replace("_", " ")}</StatusPill>
              </div>
            </div>
          </div>
        ))}
    </section>
  );
}
