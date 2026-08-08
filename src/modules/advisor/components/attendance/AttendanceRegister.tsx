"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { TextInput } from "@/shared/components/ui/TextInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useMenteeClasses, useClassResult } from "../../hooks/useStudents";
import { useClassSubjects } from "../../hooks/useSubjects";
import { useMarkClassAttendance } from "../../hooks/useAttendance";
import { NoMenteeClasses } from "../NoMenteeClasses";
import type { AttendanceMark } from "../../types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AttendanceRegister() {
  const { show } = useToast();
  const { data: menteeClasses, isLoading: classesLoading } = useMenteeClasses();
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const activeClassId = classId ?? menteeClasses?.[0]?.class_id;

  const { data: result } = useClassResult(activeClassId);
  const { data: subjectsPage } = useClassSubjects(result?.mentor.id, activeClassId);

  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [date, setDate] = useState(today());
  const [marks, setMarks] = useState<Record<number, AttendanceMark>>({});

  const markClassAttendance = useMarkClassAttendance();

  const activeSubjectId = subjectId ?? subjectsPage?.data[0]?.subject.id;

  const students = useMemo(() => result?.students ?? [], [result]);

  function setMark(studentId: number, mark: AttendanceMark) {
    setMarks((prev) => ({ ...prev, [studentId]: mark }));
  }

  function markAllPresent() {
    const next: Record<number, AttendanceMark> = {};
    for (const s of students) next[s.id] = "present";
    setMarks(next);
  }

  function handleSave() {
    if (!activeClassId || !activeSubjectId) return;
    const records = students.map((s) => ({
      student_id: s.id,
      status: marks[s.id] ?? "present",
    }));

    markClassAttendance
      .mutateAsync({
        classId: activeClassId,
        input: { subject_id: activeSubjectId, attendance_date: date, records },
      })
      .then(() => show("Attendance saved.", "success"))
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  if (classesLoading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!menteeClasses || menteeClasses.length === 0) {
    return (
      <div>
        <PageHeader title="Attendance" />
        <NoMenteeClasses />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Mark daily attendance for your class."
        actions={
          <>
            <Button variant="secondary" onClick={markAllPresent}>
              Mark all present
            </Button>
            <Button variant="primary" isPending={markClassAttendance.isPending} onClick={handleSave}>
              Save attendance
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        {menteeClasses.length > 1 && (
          <SelectInput className="w-auto" value={activeClassId} onChange={(e) => setClassId(Number(e.target.value))}>
            {menteeClasses.map((c, index) => (
              <option key={`${c.class_id}-${c.academic_year ?? index}`} value={c.class_id}>
                {c.label}
              </option>
            ))}
          </SelectInput>
        )}

        <SelectInput
          className="w-auto"
          value={activeSubjectId ?? ""}
          onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Select subject</option>
          {subjectsPage?.data.map((m) => (
            <option key={m.id} value={m.subject.id}>
              {m.subject.name} ({m.subject.subject_code})
            </option>
          ))}
        </SelectInput>

        <TextInput
          type="date"
          className="w-auto"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {!activeSubjectId ? (
        <p className="text-sm text-slate-500">
          Select a subject you teach for this class to mark attendance.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.student_id_no}</p>
                  </td>
                  <td className="px-4 py-3">
                    <SelectInput
                      className="w-32"
                      value={marks[s.id] ?? "present"}
                      onChange={(e) => setMark(s.id, e.target.value as AttendanceMark)}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </SelectInput>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
