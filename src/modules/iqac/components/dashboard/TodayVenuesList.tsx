import type { TodaySchedule } from "../../types/venue-booking";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";

const STATE_LABEL: Record<TodaySchedule["state"], string> = {
  completed: "Completed",
  in_progress: "In progress",
  scheduled: "Scheduled",
};

const STATE_TONE: Record<TodaySchedule["state"], PillTone> = {
  completed: "slate",
  in_progress: "green",
  scheduled: "blue",
};

function formatTimeRange(from: string, to: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${fmt(from)} – ${fmt(to)}`;
}

export function TodayVenuesList({ schedule, isLoading }: { schedule: TodaySchedule[]; isLoading: boolean }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
        <h2 className="text-base font-bold text-slate-900">Today in the venues</h2>
      </div>
      {isLoading && <div className="px-5 py-8 text-sm text-slate-500">Loading…</div>}
      {!isLoading && schedule.length === 0 && (
        <div className="px-5 py-8 text-sm text-slate-500">No venue activity scheduled for today.</div>
      )}
      {!isLoading &&
        schedule.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b border-slate-100 px-5 py-3.5 last:border-b-0">
            <div className="w-32 shrink-0 text-[13.5px] font-semibold tabular-nums text-slate-700">
              {formatTimeRange(item.from_datetime, item.to_datetime)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-semibold text-slate-900">{item.venue_name}</div>
              <div className="text-xs text-slate-500">{item.purpose}</div>
            </div>
            <StatusPill tone={STATE_TONE[item.state]}>{STATE_LABEL[item.state]}</StatusPill>
          </div>
        ))}
    </section>
  );
}
