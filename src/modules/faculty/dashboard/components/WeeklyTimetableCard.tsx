"use client";

import type { useWeeklyTimetable } from "../hooks/dashboard.hooks";
import type { TimetableCell } from "../types/dashboard.types";
import { CalendarIcon } from "./icons";
import { DashboardCard } from "./DashboardCard";
import { DashboardSectionState } from "./DashboardSectionState";
import { SubjectChip } from "./SubjectChip";

interface WeeklyTimetableCardProps extends ReturnType<typeof useWeeklyTimetable> {
  selectedSlotId: number | null;
  onSelectSlot: (cell: TimetableCell) => void;
}

export function WeeklyTimetableCard({ status, timetable, error, retry, selectedSlotId, onSelectSlot }: WeeklyTimetableCardProps) {
  return (
    <DashboardCard
      icon={<CalendarIcon className="h-5 w-5" />}
      title="Class Timetable"
      subtitle={timetable ? `Weekly Schedule — ${timetable.todayLabel}` : "Weekly Schedule"}
    >
      <DashboardSectionState
        status={status}
        error={error}
        onRetry={retry}
        emptyMessage="No subjects are currently allocated to you."
        skeletonRows={6}
      >
        {timetable && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-28 border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-500">
                    Day
                  </th>
                  {timetable.periodNumbers.map((period) => (
                    <th
                      key={period}
                      className="border-b border-slate-200 px-2 py-3 text-center text-xs font-semibold text-slate-500"
                    >
                      P{period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable.days.map((day) => (
                  <tr key={day.dayOfWeek} className={day.isToday ? "bg-indigo-50/60" : ""}>
                    <td
                      className={`border-b border-slate-100 px-3 py-4 text-sm font-semibold whitespace-nowrap ${
                        day.isToday ? "text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      {day.dayLabel}
                    </td>
                    {timetable.periodNumbers.map((period) => {
                      const cell = day.cellsByPeriod[period];
                      return (
                        <td key={period} className="h-16 border-b border-slate-100 px-1.5 py-2 text-center align-middle">
                          {cell ? (
                            <SubjectChip cell={cell} isSelected={cell.slotId === selectedSlotId} onSelect={onSelectSlot} />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSectionState>
    </DashboardCard>
  );
}
