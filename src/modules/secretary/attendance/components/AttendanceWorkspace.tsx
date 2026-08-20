"use client";

import { useMemo, useState } from "react";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/shared/lib/api-client";
import { SecretaryField } from "@/modules/secretary/components/SecretaryField";
import { buildClassLabeler } from "@/modules/secretary/lib/class-label";
import {
  useBatches,
  useClasses,
  useDepartments,
} from "@/modules/secretary/timetable/hooks/useTimetable";
import { useDayTimetable } from "../hooks/useDayTimetable";
import { SingleDateCalendar } from "./SingleDateCalendar";
import { AttendanceMarkingSheet } from "./AttendanceMarkingSheet";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function academicYearOptions(): string[] {
  const now = new Date();
  // Academic year rolls over in June — before June, "this" AY started last calendar year.
  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return [1, 0, -1].map((offset) => `${startYear + offset}–${startYear + offset + 1}`);
}

export function AttendanceWorkspace() {
  const [step, setStep] = useState<"calendar" | "sheet">("calendar");
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const [date, setDate] = useState(new Date());
  const [academicYear, setAcademicYear] = useState(() => academicYearOptions()[0]);
  const yearOptions = useMemo(() => academicYearOptions(), []);

  const { data: classes } = useClasses();
  const { data: departments } = useDepartments();
  const { data: batches } = useBatches();

  const classLabel = useMemo(() => buildClassLabeler(departments, batches), [departments, batches]);
  const selectedClassLabel = useMemo(() => {
    const klass = classes?.find((c) => c.id === classId);
    return klass ? classLabel(klass) : "";
  }, [classes, classId, classLabel]);

  const dayOfWeek = date.getDay(); // 0 = Sunday ... 6 = Saturday
  const { data: dayResult, isLoading, error } = useDayTimetable(
    classId,
    dayOfWeek === 0 ? undefined : dayOfWeek,
  );
  const daySlots = (dayResult?.data ?? []).slice().sort((a, b) => a.period_number - b.period_number);

  if (step === "sheet" && classId) {
    return (
      <AttendanceMarkingSheet
        // Remounts fresh whenever the class or date changes, so in-progress
        // (unsaved) marks never leak from one sheet into another.
        key={`${classId}-${date.toDateString()}`}
        classId={classId}
        classLabel={selectedClassLabel}
        date={date}
        daySlots={daySlots}
        onBack={() => setStep("calendar")}
      />
    );
  }

  return (
    <div>
      <div className="mb-[22px] text-[26px] font-semibold tracking-[-0.02em] text-slate-900">
        Student Attendance
      </div>

      <div className="mb-6 grid grid-cols-[repeat(2,minmax(0,240px))] gap-5">
        <SecretaryField label="Academic Year">
          <SelectInput value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </SelectInput>
        </SecretaryField>
        <SecretaryField label="Class">
          <SelectInput
            value={classId ?? ""}
            onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Select class</option>
            {classes?.map((klass) => (
              <option key={klass.id} value={klass.id}>
                {classLabel(klass)}
              </option>
            ))}
          </SelectInput>
        </SecretaryField>
      </div>

      <div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <SingleDateCalendar value={date} onChange={setDate} />

        <div className="rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-[#E3E8EF] px-5 py-4">
            <p className="text-[15.5px] font-semibold text-slate-900">
              Classes on {DAY_LABELS[dayOfWeek]}, {date.getDate()}{" "}
              {date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex flex-col px-5 py-2 pb-[18px]">
            {!classId && (
              <p className="py-4 text-sm text-slate-500">Select a class to see its periods.</p>
            )}
            {classId && dayOfWeek === 0 && (
              <p className="py-3 text-[13.5px] text-slate-500">No classes scheduled on this day.</p>
            )}
            {classId && dayOfWeek !== 0 && (
              <>
                {error && (
                  <p className="py-4 text-sm text-red-600">
                    {error instanceof ApiError ? error.message : "Failed to load the timetable."}
                  </p>
                )}
                {isLoading && <p className="py-4 text-sm text-slate-500">Loading…</p>}
                {!isLoading && !error && daySlots.length === 0 && (
                  <p className="py-3 text-[13.5px] text-slate-500">No classes scheduled on this day.</p>
                )}
                {!isLoading &&
                  !error &&
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="grid grid-cols-[34px_minmax(0,1fr)] items-center gap-3 border-b border-slate-100 py-[11px] last:border-b-0"
                    >
                      <span className="text-xs font-semibold text-slate-400">P{slot.period_number}</span>
                      <div className="min-w-0">
                        <p className="block text-[14.5px] font-semibold text-blue-700">{slot.subject.name}</p>
                        <p className="text-xs text-slate-500">
                          {slot.start_time}–{slot.end_time}
                        </p>
                      </div>
                    </div>
                  ))}
              </>
            )}
            <Button
              variant="primary"
              disabled={!classId || dayOfWeek === 0 || daySlots.length === 0}
              onClick={() => setStep("sheet")}
              className="mt-4 w-full justify-center"
            >
              Mark Attendance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
