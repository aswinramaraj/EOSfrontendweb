"use client";

import { useClassAttendance } from "../hooks/dashboard.hooks";
import type { RosterStudent, TimetableCell } from "../types/dashboard.types";
import { ClipboardCheckIcon } from "./icons";
import { AttendanceFooter } from "./AttendanceFooter";
import { AttendanceRow } from "./AttendanceRow";
import { DashboardCard } from "./DashboardCard";
import { DashboardSectionState } from "./DashboardSectionState";
import { StudentRosterUnavailableNotice } from "./StudentRosterUnavailableNotice";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function rosterStudentName(student: RosterStudent): string {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ");
  return fullName || student.studentIdNo;
}

function rosterStudentInitials(student: RosterStudent): string {
  if (student.firstName && student.lastName) return getInitials(student.firstName, student.lastName);
  return student.studentIdNo.slice(0, 2).toUpperCase();
}

function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function NoClassSelectedIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 text-indigo-200" fill="none" aria-hidden="true">
      <rect x="20" y="24" width="80" height="76" rx="8" stroke="currentColor" strokeWidth="3" />
      <path d="M20 44h80" stroke="currentColor" strokeWidth="3" />
      <path d="M40 24v-8M80 24v-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 60h16M40 74h30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="82" cy="70" r="16" fill="white" stroke="currentColor" strokeWidth="3" />
      <path d="M82 62v9l6 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface AttendanceCardProps {
  selectedSlot: TimetableCell | null;
  onAttendanceSubmitted?: () => void;
}

export function AttendanceCard({ selectedSlot, onAttendanceSubmitted }: AttendanceCardProps) {
  const {
    status,
    date,
    isAlreadyMarked,
    markedRecords,
    roster,
    toggles,
    toggleStudent,
    summary,
    rosterAvailable,
    canSubmit,
    isSubmitting,
    submitError,
    submit,
    error,
    retry,
  } = useClassAttendance(selectedSlot, onAttendanceSubmitted);

  return (
    <DashboardCard
      icon={<ClipboardCheckIcon className="h-5 w-5" />}
      title="Class Attendance"
      subtitle="Today's Attendance"
      contentClassName="flex flex-1 flex-col p-0 min-h-0"
      className="h-160"
    >
      {!selectedSlot ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <NoClassSelectedIllustration />
          <p className="max-w-55 text-sm font-medium text-slate-500">
            Select a subject from the timetable to mark attendance.
          </p>
        </div>
      ) : (
        <DashboardSectionState status={status} error={error} onRetry={retry} skeletonRows={7}>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-slate-100 px-5 py-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Subject</p>
                <p className="font-semibold text-slate-800">{selectedSlot.subjectName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Section</p>
                <p className="font-semibold text-slate-800">
                  {selectedSlot.departmentCode} {selectedSlot.classSection}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Period</p>
                <p className="font-semibold text-slate-800">P{selectedSlot.periodNumber}</p>
              </div>
              <div>
                {/* Honest "—" when neither the marked-records nor the roster
                 * fetch succeeded — never a fabricated number. */}
                <p className="text-xs text-slate-400">Students</p>
                <p className="font-semibold text-slate-800">
                  {isAlreadyMarked || rosterAvailable ? summary.total : "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Date</p>
                <p className="font-semibold text-slate-800">{formatDisplayDate(date)}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              {isAlreadyMarked ? (
                <ul className="flex flex-col gap-1">
                  {markedRecords.map((record) => (
                    <AttendanceRow
                      key={record.id}
                      name={`${record.student.first_name} ${record.student.last_name}`}
                      registerNumber={record.student.student_id_no}
                      initials={getInitials(record.student.first_name, record.student.last_name)}
                      status={record.status}
                      readOnly
                    />
                  ))}
                </ul>
              ) : rosterAvailable ? (
                roster.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {roster.map((student) => (
                      <AttendanceRow
                        key={student.id}
                        name={rosterStudentName(student)}
                        registerNumber={student.registerNo ?? student.studentIdNo}
                        initials={rosterStudentInitials(student)}
                        status={toggles[student.id] ?? null}
                        onChange={(next) => toggleStudent(student.id, next)}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-slate-600">No students are enrolled in this class.</p>
                  </div>
                )
              ) : (
                <StudentRosterUnavailableNotice />
              )}
            </div>

            <AttendanceFooter
              presentCount={summary.presentCount}
              absentCount={summary.absentCount}
              lateCount={summary.lateCount}
              total={summary.total}
              onSubmit={submit}
              submitDisabled={!canSubmit}
              submitLabel={isAlreadyMarked ? "Attendance Locked" : isSubmitting ? "Submitting…" : "Submit & Lock"}
              disabledReason={
                isAlreadyMarked
                  ? undefined
                  : !rosterAvailable
                    ? "Unavailable until the student roster can be loaded"
                    : roster.length > 0 && !canSubmit
                      ? "Mark every student Present or Absent before submitting"
                      : undefined
              }
              errorMessage={submitError}
            />
          </div>
        </DashboardSectionState>
      )}
    </DashboardCard>
  );
}
