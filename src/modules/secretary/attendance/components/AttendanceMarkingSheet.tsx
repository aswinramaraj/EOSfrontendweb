"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ChevronLeftIcon } from "@/shared/components/icons";
import { useRoster } from "../hooks/useRoster";
import { useExistingAttendance } from "../hooks/useExistingAttendance";
import { useSaveAttendance } from "../hooks/useSaveAttendance";
import type { AttendanceMarkStatus } from "../types";
import type { TimetableSlot } from "@/modules/secretary/timetable/types";

interface AttendanceMarkingSheetProps {
  classId: number;
  classLabel: string;
  date: Date;
  daySlots: TimetableSlot[];
  onBack: () => void;
}

interface Column {
  subjectId: number;
  subjectName: string;
  periods: number[];
}

const STATUS_STYLE: Record<AttendanceMarkStatus | "", { bg: string; fg: string; border: string }> = {
  "": { bg: "#FFFFFF", fg: "#94A3B8", border: "#E2E8F0" },
  present: { bg: "#ECFDF5", fg: "#047857", border: "#A7F3D0" },
  absent: { bg: "#FEF2F2", fg: "#B91C1C", border: "#FECACA" },
  on_duty: { bg: "#FFFBEB", fg: "#B45309", border: "#FDE68A" },
};

const cellKey = (studentId: number, subjectId: number) => `${studentId}:${subjectId}`;

function dateToIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AttendanceMarkingSheet({
  classId,
  classLabel,
  date,
  daySlots,
  onBack,
}: AttendanceMarkingSheetProps) {
  const { show } = useToast();
  const dateIso = dateToIso(date);

  const { data: roster, isLoading: rosterLoading, error: rosterError } = useRoster(classId);
  const { data: existingResult, isLoading: existingLoading } = useExistingAttendance(
    classId,
    dateIso,
  );
  const saveAttendance = useSaveAttendance();

  const columns: Column[] = useMemo(() => {
    const bySubject = new Map<number, Column>();
    for (const slot of daySlots) {
      const existing = bySubject.get(slot.subject.id);
      if (existing) {
        existing.periods.push(slot.period_number);
      } else {
        bySubject.set(slot.subject.id, {
          subjectId: slot.subject.id,
          subjectName: slot.subject.name,
          periods: [slot.period_number],
        });
      }
    }
    return Array.from(bySubject.values()).sort((a, b) => a.periods[0] - b.periods[0]);
  }, [daySlots]);

  // Already-saved marks for this class+date — read-only (re-posting a
  // subject that already has attendance for this date would 409, since
  // attendance_records is unique on student+class+subject+date).
  const existingMap = useMemo(() => {
    const map = new Map<string, AttendanceMarkStatus>();
    const locked = new Set<number>();
    for (const record of existingResult?.data ?? []) {
      if (record.subject) {
        map.set(cellKey(record.student.id, record.subject.id), record.status);
        locked.add(record.subject.id);
      }
    }
    return { map, locked };
  }, [existingResult]);
  const lockedSubjectIds = existingMap.locked;

  // Not-yet-saved edits for unlocked columns only — the only state the user
  // actually drives; existing (locked) marks come straight from the query
  // above rather than being copied into local state.
  const [pendingMarks, setPendingMarks] = useState<Record<string, AttendanceMarkStatus>>({});

  function displayValue(studentId: number, subjectId: number): AttendanceMarkStatus | "" {
    if (lockedSubjectIds.has(subjectId)) {
      return existingMap.map.get(cellKey(studentId, subjectId)) ?? "";
    }
    return pendingMarks[cellKey(studentId, subjectId)] ?? "";
  }

  function setMark(studentId: number, subjectId: number, status: AttendanceMarkStatus | "") {
    setPendingMarks((prev) => {
      const next = { ...prev };
      const k = cellKey(studentId, subjectId);
      if (status === "") delete next[k];
      else next[k] = status;
      return next;
    });
  }

  function markAllPresent() {
    if (!roster) return;
    setPendingMarks((prev) => {
      const next = { ...prev };
      for (const student of roster) {
        for (const col of columns) {
          if (lockedSubjectIds.has(col.subjectId)) continue;
          next[cellKey(student.id, col.subjectId)] = "present";
        }
      }
      return next;
    });
  }

  function clearAll() {
    setPendingMarks({});
  }

  const counts = useMemo(() => {
    const values = [...existingMap.map.values(), ...Object.values(pendingMarks)];
    return {
      present: values.filter((v) => v === "present").length,
      absent: values.filter((v) => v === "absent").length,
      onDuty: values.filter((v) => v === "on_duty").length,
    };
  }, [existingMap, pendingMarks]);

  const totalCells = (roster?.length ?? 0) * columns.length;
  const markedCells = existingMap.map.size + Object.keys(pendingMarks).length;
  const unmarked = totalCells - markedCells;

  async function handleSave() {
    const unlockedColumns = columns.filter((c) => !lockedSubjectIds.has(c.subjectId));
    const jobs = unlockedColumns
      .map((col) => {
        const records = (roster ?? [])
          .map((student) => {
            const status = pendingMarks[cellKey(student.id, col.subjectId)];
            return status ? { student_id: student.id, status } : null;
          })
          .filter((r): r is { student_id: number; status: AttendanceMarkStatus } => r !== null);
        return { col, records };
      })
      .filter((job) => job.records.length > 0);

    if (jobs.length === 0) {
      show("Mark at least one student before saving.", "error");
      return;
    }

    const results = await Promise.allSettled(
      jobs.map((job) =>
        saveAttendance.mutateAsync({
          class_id: classId,
          subject_id: job.col.subjectId,
          date: dateIso,
          records: job.records,
        }),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length === 0) {
      setPendingMarks({});
      show(
        `Attendance saved for ${date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.`,
        "success",
      );
    } else if (failed.length === jobs.length) {
      const reason = failed[0] as PromiseRejectedResult;
      show(
        reason.reason instanceof ApiError ? reason.reason.message : "Failed to save attendance.",
        "error",
      );
    } else {
      show(
        `Saved ${jobs.length - failed.length} of ${jobs.length} period(s). Some periods failed — they may already be marked.`,
        "error",
      );
    }
  }

  if (rosterLoading || existingLoading) {
    return <div className="h-64 animate-pulse rounded-2xl border border-[#E3E8EF] bg-slate-50" />;
  }

  if (rosterError) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {rosterError instanceof ApiError ? rosterError.message : "Failed to load the class roster."}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Back
          </button>
          <p className="text-[19px] font-semibold text-slate-900">Student List</p>
          <p className="text-sm text-slate-500">
            {classLabel} · {date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={clearAll}>
            Clear
          </Button>
          <Button variant="primary" onClick={markAllPresent}>
            Mark All as Present
          </Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-4 sm:max-w-md">
        <div className="rounded-[14px] border border-blue-200 bg-blue-50 px-[18px] py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-800">Present</p>
          <p className="text-2xl font-bold text-blue-800">{counts.present}</p>
        </div>
        <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-[18px] py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Absent</p>
          <p className="text-2xl font-bold text-slate-900">{counts.absent}</p>
        </div>
        <div className="rounded-[14px] border border-slate-200 bg-slate-50 px-[18px] py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">On Duty</p>
          <p className="text-2xl font-bold text-slate-900">{counts.onDuty}</p>
        </div>
      </div>

      {columns.length === 0 ? (
        <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-[#E3E8EF] bg-white text-sm text-slate-500">
          No periods scheduled for this class on this day.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-blue-600">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-white">
                  Name
                </th>
                {columns.map((col) => (
                  <th key={col.subjectId} className="px-3 py-3 text-center text-[13px] font-semibold text-white">
                    {col.subjectName}
                    {lockedSubjectIds.has(col.subjectId) && (
                      <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">saved</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(roster ?? []).map((student) => (
                <tr key={student.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-2.5">
                    <p className="text-[14.5px] font-medium text-slate-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-[11.5px] text-slate-500">{student.roll_no ?? student.student_id_no}</p>
                  </td>
                  {columns.map((col) => {
                    const locked = lockedSubjectIds.has(col.subjectId);
                    const value = displayValue(student.id, col.subjectId);
                    const style = STATUS_STYLE[value];
                    return (
                      <td key={col.subjectId} className="p-1.5 text-center">
                        <select
                          value={value}
                          disabled={locked}
                          onChange={(e) =>
                            setMark(student.id, col.subjectId, e.target.value as AttendanceMarkStatus | "")
                          }
                          style={{ background: style.bg, color: style.fg, borderColor: style.border }}
                          className="h-8 w-full cursor-pointer rounded-md border text-center text-xs font-semibold outline-none disabled:cursor-not-allowed"
                        >
                          <option value="">—</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="on_duty">On-Duty</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {(roster ?? []).length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-sm text-slate-500">
                    No active students found in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Unmarked <strong className="text-slate-900">{Math.max(unmarked, 0)}</strong>
        </p>
        <Button variant="primary" onClick={handleSave} isPending={saveAttendance.isPending}>
          Save Attendance
        </Button>
      </div>
    </div>
  );
}
