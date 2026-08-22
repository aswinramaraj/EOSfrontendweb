import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
function firstWeekday(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

interface HRMonthCalendarProps {
  year: number;
  month: number; // 1-12
  daysWithEvents: Set<number>;
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function HRMonthCalendar({
  year,
  month,
  daysWithEvents,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: HRMonthCalendarProps) {
  const total = daysInMonth(year, month);
  const offset = firstWeekday(year, month);
  const cells: (number | null)[] = [...Array.from({ length: offset }, () => null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onPrevMonth} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600" aria-label="Previous month">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-lg font-extrabold text-slate-900">{monthLabel}</p>
          <p className="text-xs text-slate-400">{daysWithEvents.size} calendar events</p>
        </div>
        <button onClick={onNextMonth} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600" aria-label="Next month">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-400">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const hasEvent = daysWithEvents.has(day);
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = day === selectedDay;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDay(isSelected ? null : day)}
              className={`aspect-square rounded-lg text-sm font-semibold transition-colors ${
                isSelected
                  ? "bg-blue-700 text-white"
                  : hasEvent
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : isToday
                      ? "border border-blue-300 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
