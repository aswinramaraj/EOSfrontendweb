import type { TimetableCell, TimetableSlot } from "../types/dashboard.types";
import { formatHHMM, isWithinPeriod } from "./time";

export function mapSlotToCell(slot: TimetableSlot, todayDayOfWeek: number, now: Date): TimetableCell {
  const startTime = formatHHMM(slot.start_time);
  const endTime = formatHHMM(slot.end_time);

  return {
    slotId: slot.id,
    subjectId: slot.subject.id,
    subjectName: slot.subject.name,
    classId: slot.class.id,
    classSection: slot.class.section,
    departmentName: slot.class.department.name,
    departmentCode: slot.class.department.code,
    periodNumber: slot.period_number,
    startTime,
    endTime,
    academicYear: slot.academic_year,
    semester: slot.semester,
    isCurrentPeriod: slot.day_of_week === todayDayOfWeek && isWithinPeriod(startTime, endTime, now),
    // Caller (buildWeeklyTimetable) overrides this with the real checked value.
    isAttendanceMarked: false,
  };
}
