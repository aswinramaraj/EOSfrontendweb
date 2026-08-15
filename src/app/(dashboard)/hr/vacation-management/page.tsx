"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { ApiError } from "@/shared/lib/api-client";
import { AlertTriangleIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { useFacultyAttendanceOverview } from "@/modules/faculty/hooks/useFacultyAttendanceOverview";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useHrRequests } from "@/modules/hr/hooks/useHrRequests";
import { useLeaveTypes } from "@/modules/hr/hooks/useLeaveTypes";
import { VacationScheduleDrawer, type VacationScheduleEntry } from "@/modules/hr/components/VacationScheduleDrawer";
import { LeaveMonitorCard } from "@/modules/hr/components/LeaveMonitorCard";
import type { HrUnifiedRequest } from "@/modules/hr/types/api";

const ALL = "all";
const CONFLICT_THRESHOLD = 4;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KIND_LABEL: Record<HrUnifiedRequest["kind"], string> = { leave: "Leave", od: "On Duty" };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// The API returns from_date/to_date as UTC-midnight timestamps (e.g.
// "2026-08-14T00:00:00.000Z") — read them with the UTC getters so the
// calendar date doesn't shift by a day in timezones behind UTC.
function toUtcIso(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function datesBetween(fromIso: string, toIso_: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(fromIso);
  const end = new Date(toIso_);
  while (cursor <= end) {
    dates.push(toUtcIso(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

interface CalendarDayCell {
  iso: string;
  dayNumber: number;
}

export default function HRVacationManagementPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState(ALL);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const scopedDepartmentId = departmentId !== ALL ? Number(departmentId) : undefined;

  const { data: departments } = useDepartments();
  const { data: facultyData } = useFaculties({ department_id: scopedDepartmentId, limit: 100 });
  // Scoped by the same department filter as the Faculty panel — previously
  // this only filtered who showed up in that list while the calendar and
  // Upcoming Vacations kept showing every department regardless, which read
  // as the filter being broken rather than just not wired up everywhere.
  const {
    data: requestsData,
    isLoading,
    error,
  } = useHrRequests({ status: "approved", department_id: scopedDepartmentId, limit: 100 });
  const { data: attendanceOverview } = useFacultyAttendanceOverview({ department_id: scopedDepartmentId });
  const { data: leaveTypes } = useLeaveTypes();

  const faculty = useMemo(() => facultyData?.data ?? [], [facultyData]);
  const approvedRequests = useMemo(() => requestsData?.data ?? [], [requestsData]);

  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIso(today), [today]);
  const currentYear = useMemo(() => today.getFullYear(), [today]);
  const cursor = new Date(currentYear, today.getMonth() + monthOffset, 1);
  const year = cursor.getFullYear();
  const monthIndex0 = cursor.getMonth();
  const monthLabel = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex0, 1).getDay();

  const eventsByDate = useMemo(() => {
    const map = new Map<string, VacationScheduleEntry[]>();
    for (const request of approvedRequests) {
      for (const date of datesBetween(request.from_date, request.to_date)) {
        const list = map.get(date) ?? [];
        list.push({
          requestId: request.id,
          kind: request.kind,
          sourceId: request.source_id,
          facultyId: request.faculty.id,
          firstName: request.faculty.first_name,
          lastName: request.faculty.last_name,
          name: fullName(request.faculty),
          department: request.faculty.department.name,
          leaveType: request.leave_type,
          profileUrl: request.faculty.profile_url,
        });
        map.set(date, list);
      }
    }
    return map;
  }, [approvedRequests]);

  const cells: (CalendarDayCell | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: `${year}-${pad(monthIndex0 + 1)}-${pad(day)}`, dayNumber: day });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const filteredFaculty = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faculty;
    return faculty.filter((f) => fullName(f).toLowerCase().includes(query));
  }, [faculty, search]);

  const approvedDaysThisYear = useMemo(() => {
    const totals = new Map<number, number>();
    for (const request of approvedRequests) {
      const days = datesBetween(request.from_date, request.to_date).filter((d) => d.startsWith(`${currentYear}`));
      totals.set(request.faculty.id, (totals.get(request.faculty.id) ?? 0) + days.length);
    }
    return totals;
  }, [approvedRequests, currentYear]);

  const upcomingVacations = useMemo(() => {
    return approvedRequests
      .filter((request) => request.from_date >= todayIso)
      .sort((a, b) => a.from_date.localeCompare(b.from_date))
      .slice(0, 8);
  }, [approvedRequests, todayIso]);

  const selectedDateEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  // One monitor per real leave type (Casual/Sick/Earned/etc., as configured
  // in the leave_types table) rather than a single hardcoded type — adapts
  // automatically if types are added or renamed there.
  const leaveTypeMonitors = useMemo(() => {
    return (leaveTypes ?? []).map((lt) => {
      const today = approvedRequests.filter(
        (r) => r.kind === "leave" && r.leave_type?.id === lt.id && datesBetween(r.from_date, r.to_date).includes(todayIso),
      );
      return {
        leaveType: lt,
        percent: faculty.length ? (today.length / faculty.length) * 100 : 0,
        count: today.length,
        names: today.map((r) => fullName(r.faculty)),
      };
    });
  }, [leaveTypes, approvedRequests, todayIso, faculty.length]);

  const unaccountedAbsentToday = useMemo(
    () => (attendanceOverview?.rows ?? []).filter((r) => r.is_unaccounted_absent_today),
    [attendanceOverview],
  );
  const totalFacultyForAbsence = attendanceOverview?.rows.length ?? 0;
  const absentPercent = totalFacultyForAbsence ? (unaccountedAbsentToday.length / totalFacultyForAbsence) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="Vacation Management"
        description="Read-only calendar of approved leave and OD. Click a day to see who's out — to approve or reject a request, use the Requests page."
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load approved requests."}
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {leaveTypeMonitors.map(({ leaveType, percent, count, names }) => (
          <LeaveMonitorCard
            key={leaveType.id}
            icon={CalendarIcon}
            iconClassName="bg-amber-50 text-amber-600"
            label={`${leaveType.name} — Today`}
            percent={percent}
            subtitle={`${count} of ${faculty.length} faculty`}
            names={names}
            emptyLabel={`Nobody on ${leaveType.name.toLowerCase()} today.`}
          />
        ))}
        <LeaveMonitorCard
          icon={AlertTriangleIcon}
          iconClassName="bg-red-50 text-red-600"
          label="Unaccounted Absences — Today"
          percent={absentPercent}
          subtitle={`${unaccountedAbsentToday.length} of ${totalFacultyForAbsence} faculty — no leave/OD on file`}
          names={unaccountedAbsentToday.map((r) => fullName(r))}
          emptyLabel="Nobody unaccounted for today."
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMonthOffset(0)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Today
              </button>
              <button
                onClick={() => setMonthOffset((m) => m - 1)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50"
                aria-label="Previous month"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMonthOffset((m) => m + 1)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50"
                aria-label="Next month"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              <span className="text-base font-bold text-slate-900">{monthLabel}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                On leave / OD
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Conflict
              </span>
            </div>
          </div>

          {isLoading && <p className="py-10 text-center text-sm text-slate-500">Loading…</p>}

          {!isLoading && (
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-slate-100 bg-slate-100 text-xs">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="bg-slate-50 px-2 py-2 text-center font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </div>
              ))}

              {cells.map((cell, index) => {
                if (!cell) return <div key={index} className="min-h-[92px] bg-white" />;
                const events = eventsByDate.get(cell.iso) ?? [];
                const isToday = cell.iso === todayIso;
                const isConflict = events.length >= CONFLICT_THRESHOLD;
                const isSelected = cell.iso === selectedDate;
                const visible = events.slice(0, 2);
                const overflow = events.length - visible.length;

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setSelectedDate((prev) => (prev === cell.iso ? null : cell.iso))}
                    className={`min-h-[92px] cursor-pointer p-1.5 text-left hover:bg-slate-50 ${
                      isSelected ? "bg-blue-50 ring-2 ring-inset ring-blue-400" : isConflict ? "bg-amber-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday ? "bg-blue-600 text-white" : "text-slate-700"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {isConflict && <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-500" />}
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {visible.map((event, i) => (
                        <span
                          key={i}
                          className="truncate rounded-full bg-blue-50 px-1.5 py-0.5 text-[10.5px] font-medium text-blue-700"
                          title={`${event.name} · ${KIND_LABEL[event.kind]}`}
                        >
                          {event.name}
                        </span>
                      ))}
                      {overflow > 0 && <span className="px-1.5 text-[10.5px] text-slate-400">+{overflow} more</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-80 lg:shrink-0">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-base font-bold text-slate-900">Faculty</h3>

            <div className="mt-4 flex flex-col gap-3">
              <SearchInput
                placeholder="Search faculty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <SelectInput value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value={ALL}>All departments</option>
                {departments?.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="mt-4 flex max-h-96 flex-col divide-y divide-slate-100 overflow-y-auto">
              {filteredFaculty.map((member) => (
                <div key={member.id} className="flex items-center gap-3 py-3">
                  <FacultyAvatar faculty={member} className="h-9 w-9 rounded-full text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{fullName(member)}</p>
                    <p className="text-xs text-slate-500">{member.department?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">
                      {approvedDaysThisYear.get(member.id) ?? 0} approved leave/OD day
                      {(approvedDaysThisYear.get(member.id) ?? 0) === 1 ? "" : "s"} this year
                    </p>
                  </div>
                </div>
              ))}

              {filteredFaculty.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">No faculty match these filters.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-base font-bold text-slate-900">Upcoming Vacations</h3>
            <div className="mt-4 flex flex-col gap-3">
              {upcomingVacations.map((request) => {
                const fromDate = new Date(request.from_date);
                const monthLabelShort = fromDate.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
                return (
                  <div key={request.id} className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <span className="text-[9px] font-bold uppercase leading-none">{monthLabelShort}</span>
                      <span className="text-sm font-bold leading-tight">{fromDate.getUTCDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{fullName(request.faculty)}</p>
                      <p className="text-xs text-slate-500">
                        {request.faculty.department.name} · {KIND_LABEL[request.kind]}
                      </p>
                    </div>
                  </div>
                );
              })}

              {upcomingVacations.length === 0 && (
                <p className="text-sm text-slate-500">No upcoming vacations scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <VacationScheduleDrawer
        date={selectedDate}
        entries={selectedDateEvents}
        isPastDate={selectedDate !== null && selectedDate < todayIso}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
