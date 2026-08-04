import type { TimetableCell } from "../types/dashboard.types";
import { CheckBadgeIcon } from "./icons";

interface SubjectChipProps {
  cell: TimetableCell;
  isSelected: boolean;
  onSelect: (cell: TimetableCell) => void;
}

/** Subject name only, matching the reference design exactly — no room/venue
 * (that field doesn't exist anywhere in this backend's timetable_slots table,
 * confirmed absent from the schema) and no section line. Clicking loads this
 * class into the Attendance panel; it never navigates. The check badge is a
 * real, backend-confirmed "attendance already recorded today" indicator, not
 * decorative — see loadTodaysMarkedKeys in dashboard.hooks.ts. */
export function SubjectChip({ cell, isSelected, onSelect }: SubjectChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(cell)}
      title={`${cell.subjectName} · Section ${cell.classSection}${cell.isAttendanceMarked ? " · Attendance recorded" : ""}`}
      aria-pressed={isSelected}
      className={`relative flex h-full w-full items-center justify-center rounded-md px-2 py-2.5 text-center text-xs font-semibold transition-all duration-150 hover:scale-[1.03] ${
        isSelected
          ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300"
          : cell.isCurrentPeriod
            ? "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-300"
            : "bg-indigo-50 text-indigo-600"
      }`}
    >
      {cell.isAttendanceMarked && (
        <CheckBadgeIcon className={`absolute -top-1.5 -right-1.5 h-4 w-4 ${isSelected ? "text-emerald-300" : "text-emerald-500"}`} />
      )}
      {cell.subjectName}
    </button>
  );
}
