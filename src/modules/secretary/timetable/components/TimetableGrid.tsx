import type { TimetableSlot } from "../types";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimetableGridProps {
  slots: TimetableSlot[];
  mode: "student" | "faculty";
}

export function TimetableGrid({ slots, mode }: TimetableGridProps) {
  if (slots.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center text-sm text-slate-500">
        No timetable found for this selection.
      </div>
    );
  }

  const periods = Array.from(new Set(slots.map((s) => s.period_number))).sort((a, b) => a - b);
  const byCell = new Map<string, TimetableSlot>();
  for (const slot of slots) {
    byCell.set(`${slot.day_of_week}-${slot.period_number}`, slot);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-blue-600">
            <th className="w-24 px-4 py-[13px] text-left text-[12px] font-semibold uppercase tracking-wide text-white">
              Day
            </th>
            {periods.map((p) => (
              <th key={p} className="px-3 py-[13px] text-center text-[13px] font-semibold text-white">
                P{p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_LABELS.map((label, index) => {
            const dayNumber = index + 1;
            return (
              <tr key={dayNumber} className="border-b border-slate-200 last:border-b-0">
                <td className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
                  {label}
                </td>
                {periods.map((p) => {
                  const slot = byCell.get(`${dayNumber}-${p}`);
                  return (
                    <td key={p} className="border-l border-slate-200 px-1.5 py-[11px] text-center">
                      {slot ? (
                        <div>
                          <p
                            className={`text-[13px] font-medium ${
                              mode === "faculty" ? "text-blue-700" : "text-slate-900"
                            }`}
                          >
                            {slot.subject.name}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-[1.3] text-slate-500">
                            {mode === "student"
                              ? `${slot.faculty.first_name} ${slot.faculty.last_name}`
                              : `${slot.class.department.code} ${slot.class.section}`}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Free</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
