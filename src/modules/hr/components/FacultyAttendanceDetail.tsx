"use client";

import { useMemo, useState } from "react";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ChevronDownIcon, PencilIcon, PlusIcon } from "@/shared/components/icons";
import { useFacultyAttendance } from "@/modules/faculty/hooks/useFacultyAttendance";
import { MarkAttendanceModal, type MarkAttendanceInitialValues } from "@/modules/faculty/components/MarkAttendanceModal";
import type { FacultyAttendanceDay, FacultyAttendanceMonth } from "@/modules/faculty/types";
import { PercentStatTile } from "./PercentStatTile";

const STATUS_LABEL: Record<string, string> = {
  full_day: "Full Day",
  half_day: "Half Day",
  absent: "Absent",
  on_duty: "On Duty",
  on_leave: "On Leave",
  on_vacation: "On Vacation",
  weekly_off: "Weekly Off",
  holiday: "Holiday",
  not_marked: "Not Marked",
};

const STATUS_TONE: Record<string, PillTone> = {
  full_day: "green",
  half_day: "amber",
  absent: "red",
  on_duty: "blue",
  on_leave: "amber",
  on_vacation: "blue",
  weekly_off: "slate",
  holiday: "slate",
  not_marked: "slate",
};

function attendanceTone(percent: number): PillTone {
  if (percent >= 86) return "green";
  if (percent >= 70) return "amber";
  return "red";
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function weekdayShort(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

// The backend only returns days that already have a faculty_daily_attendance
// row, so a gap (nobody punched, nobody manually marked it) silently vanishes
// from the list instead of showing up as something HR needs to fill in —
// including, confusingly, today. This fills every day from the 1st up to
// `lastDay` with a "not_marked" placeholder wherever no real row exists.
function fillMonthDays(monthKey: string, existingDays: FacultyAttendanceDay[], lastDay: number): FacultyAttendanceDay[] {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month1 = Number(monthStr);
  const byDate = new Map(existingDays.map((d) => [d.date, d]));
  const filled: FacultyAttendanceDay[] = [];
  for (let day = lastDay; day >= 1; day--) {
    const iso = `${year}-${pad(month1)}-${pad(day)}`;
    filled.push(
      byDate.get(iso) ?? {
        date: iso,
        day: weekdayShort(iso),
        punch_in: null,
        punch_out: null,
        status: "not_marked",
      },
    );
  }
  return filled;
}

interface FacultyAttendanceDetailProps {
  facultyId: number;
  facultyName: string;
}

// Full attendance ledger (stat tiles + month-by-month punch/status table +
// manual marking) — shared between the standalone Faculty Attendance detail
// page and the Faculty Directory profile's Attendance tab so both show the
// exact same data instead of one being a stale summary of the other.
export function FacultyAttendanceDetail({ facultyId, facultyName }: FacultyAttendanceDetailProps) {
  const now = useMemo(() => new Date(), []);
  const currentMonthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const [expandedMonth, setExpandedMonth] = useState<string | null>(currentMonthKey);
  const [markAttendanceValues, setMarkAttendanceValues] = useState<MarkAttendanceInitialValues | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: attendance, isLoading } = useFacultyAttendance(facultyId);

  const displayMonths: FacultyAttendanceMonth[] = useMemo(() => {
    const months = attendance?.months ?? [];
    const hasCurrentMonth = months.some((m) => m.month === currentMonthKey);
    const withCurrentMonth = hasCurrentMonth
      ? months
      : [
          {
            month: currentMonthKey,
            label: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            days: [],
            full_days: 0,
            half_days: 0,
            absent: 0,
            on_leave: 0,
            on_duty: 0,
            on_vacation: 0,
            attendance_percentage: 0,
          },
          ...months,
        ];

    return withCurrentMonth.map((group) => {
      const [yearStr, monthStr] = group.month.split("-");
      const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
      const lastDay = group.month === currentMonthKey ? now.getDate() : daysInMonth;
      return { ...group, days: fillMonthDays(group.month, group.days, lastDay) };
    });
  }, [attendance, currentMonthKey, now]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!attendance) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        No attendance records for this faculty yet.
      </p>
    );
  }

  function openMarkAttendance(initial: MarkAttendanceInitialValues) {
    setMarkAttendanceValues(initial);
    setModalOpen(true);
  }

  const { full_days, half_days, absent, on_leave, on_duty, on_vacation, attendance_percentage } = attendance.overall;
  const total = full_days + half_days + absent + on_leave + on_duty + on_vacation;
  const pct = (count: number) => (total ? (count / total) * 100 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => openMarkAttendance({ date: new Date().toISOString().slice(0, 10) })}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <PlusIcon className="h-4 w-4" />
          Mark Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <PercentStatTile label="Full Days" percent={pct(full_days)} subtitle={`${full_days} of ${total} days`} />
        <PercentStatTile label="Half Days" percent={pct(half_days)} subtitle={`${half_days} of ${total} days`} />
        <PercentStatTile label="Absent" percent={pct(absent)} subtitle={`${absent} of ${total} days`} />
        <PercentStatTile
          label="On Leave"
          percent={pct(on_leave)}
          subtitle={`${on_leave} of ${total} days — counts against %`}
        />
        <PercentStatTile
          label="On Duty"
          percent={pct(on_duty)}
          subtitle={`${on_duty} of ${total} days — excused`}
        />
        <PercentStatTile
          label="On Vacation"
          percent={pct(on_vacation)}
          subtitle={`${on_vacation} of ${total} days — excused`}
        />
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Days</p>
          <p className="mt-1 text-[26px] font-black text-slate-900">{total}</p>
        </div>
        <PercentStatTile
          label="Attendance %"
          percent={attendance_percentage}
          subtitle={attendanceTone(attendance_percentage) === "green" ? "Good" : "Watch"}
        />
      </div>

      <div className="flex flex-col gap-4">
        {displayMonths.map((group) => {
          const isOpen = expandedMonth === group.month;
          return (
            <div key={group.month} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                onClick={() => setExpandedMonth(isOpen ? null : group.month)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-bold text-slate-900">{group.label}</span>
                  <span className="text-xs text-slate-500">
                    {group.full_days} Full · {group.half_days} Half · {group.absent} Absent ·{" "}
                    {group.attendance_percentage}%
                  </span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100">
                  <table className="w-full min-w-[640px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {["Date", "Day", "Punch In", "Punch Out", "Status", ""].map((header) => (
                          <th
                            key={header}
                            className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.days.map((record) => {
                        const isNotMarked = record.status === "not_marked";
                        return (
                          <tr key={record.date} className="border-b border-slate-50 last:border-b-0">
                            <td className="px-5 py-3 text-slate-800">{record.date}</td>
                            <td className="px-5 py-3 text-slate-600">{record.day}</td>
                            <td className="px-5 py-3 text-slate-600">{record.punch_in ?? "—"}</td>
                            <td className="px-5 py-3 text-slate-600">{record.punch_out ?? "—"}</td>
                            <td className="px-5 py-3">
                              <StatusPill tone={STATUS_TONE[record.status] ?? "slate"}>
                                {STATUS_LABEL[record.status] ?? record.status}
                              </StatusPill>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() =>
                                  openMarkAttendance({
                                    date: record.date,
                                    status: isNotMarked
                                      ? undefined
                                      : (record.status as MarkAttendanceInitialValues["status"]),
                                    punch_in: record.punch_in,
                                    punch_out: record.punch_out,
                                  })
                                }
                                className="text-slate-400 hover:text-slate-600"
                                aria-label={isNotMarked ? "Mark attendance" : "Edit"}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MarkAttendanceModal
        open={modalOpen}
        facultyId={facultyId}
        facultyName={facultyName}
        initial={markAttendanceValues}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
