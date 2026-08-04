"use client";

import { useState } from "react";
import { useWeeklyTimetable } from "../hooks/dashboard.hooks";
import type { TimetableCell } from "../types/dashboard.types";
import { AttendanceCard } from "./AttendanceCard";
import { WeeklyTimetableCard } from "./WeeklyTimetableCard";

/** Sidebar/TopHeader/profile fetch now live in the shared
 * src/app/(dashboard)/faculty/layout.tsx shell — this is just the Dashboard
 * page's own content (Class Timetable + Class Attendance). */
export function FacultyDashboard() {
  const timetable = useWeeklyTimetable();
  const [selectedSlot, setSelectedSlot] = useState<TimetableCell | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[60fr_40fr] lg:grid-cols-[70fr_30fr]">
      <WeeklyTimetableCard {...timetable} selectedSlotId={selectedSlot?.slotId ?? null} onSelectSlot={setSelectedSlot} />
      <AttendanceCard selectedSlot={selectedSlot} onAttendanceSubmitted={timetable.retry} />
    </div>
  );
}
