"use client";

import { useMemo, useState } from "react";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { ApiError } from "@/shared/lib/api-client";
import { PeopleIcon, PersonIcon, SecretaryCalendarIcon } from "@/shared/components/icons";
import { SecretaryField } from "@/modules/secretary/components/SecretaryField";
import { buildClassLabeler } from "@/modules/secretary/lib/class-label";
import {
  useBatches,
  useClasses,
  useDepartments,
  useFacultyOptionsFromTimetable,
  useTimetableSlots,
} from "../hooks/useTimetable";
import { TimetableGrid } from "./TimetableGrid";

type Mode = "student" | "faculty";

export function TimetableWorkspace() {
  const [mode, setMode] = useState<Mode>("student");
  const [batchId, setBatchId] = useState<number | undefined>(undefined);
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const [facultyId, setFacultyId] = useState<number | undefined>(undefined);

  const { data: classes } = useClasses();
  const { data: departments } = useDepartments();
  const { data: batches } = useBatches();
  const { data: facultyOptions } = useFacultyOptionsFromTimetable();

  const classLabel = useMemo(
    () => buildClassLabeler(departments, batches),
    [departments, batches],
  );

  const classesInBatch = useMemo(
    () => (batchId ? (classes ?? []).filter((c) => c.batch_id === batchId) : classes ?? []),
    [classes, batchId],
  );

  const { data: slotsResult, isLoading, error } = useTimetableSlots({
    class_id: mode === "student" ? classId : undefined,
    faculty_id: mode === "faculty" ? facultyId : undefined,
  });

  const selectedClass = classes?.find((c) => c.id === classId);
  const selectedFaculty = facultyOptions?.find((f) => f.id === facultyId);
  const gridTitle = mode === "student" ? "Class Timetable" : "Faculty Timetable";
  const gridSub =
    mode === "student"
      ? selectedClass
        ? classLabel(selectedClass)
        : ""
      : selectedFaculty
        ? `${selectedFaculty.name} · assigned classes`
        : "";

  return (
    <div>
      <div className="mb-[22px]">
        <div className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">Timetable</div>
        <div className="text-sm text-slate-600">View class and faculty timetables</div>
      </div>

      <div className="mb-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-[616px]">
        <button
          onClick={() => setMode("student")}
          className={`flex items-center gap-3 rounded-[14px] border p-[18px] text-left transition-colors ${
            mode === "student" ? "border-blue-600 bg-blue-50" : "border-[#E3E8EF] bg-white"
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <PeopleIcon className="h-5 w-5 text-blue-600" />
          </span>
          <span>
            <span className="block text-base font-semibold text-slate-900">Student</span>
            <span className="block text-[13px] text-slate-600">Class-wise timetable</span>
          </span>
        </button>
        <button
          onClick={() => setMode("faculty")}
          className={`flex items-center gap-3 rounded-[14px] border p-[18px] text-left transition-colors ${
            mode === "faculty" ? "border-blue-600 bg-blue-50" : "border-[#E3E8EF] bg-white"
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <PersonIcon className="h-5 w-5 text-blue-600" />
          </span>
          <span>
            <span className="block text-base font-semibold text-slate-900">Faculty</span>
            <span className="block text-[13px] text-slate-600">Assigned classes</span>
          </span>
        </button>
      </div>

      <div className="mb-[22px] flex flex-wrap gap-4">
        {mode === "student" ? (
          <>
            <SecretaryField label="Batch Year" className="w-[220px]">
              <SelectInput
                value={batchId ?? ""}
                onChange={(e) => {
                  const nextBatchId = e.target.value ? Number(e.target.value) : undefined;
                  setBatchId(nextBatchId);
                  setClassId(undefined);
                }}
              >
                <option value="">All batches</option>
                {batches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </SelectInput>
            </SecretaryField>
            <SecretaryField label="Class" className="w-[200px]">
              <SelectInput
                value={classId ?? ""}
                onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Select class</option>
                {classesInBatch.map((klass) => (
                  <option key={klass.id} value={klass.id}>
                    {classLabel(klass)}
                  </option>
                ))}
              </SelectInput>
            </SecretaryField>
          </>
        ) : (
          <SecretaryField label="Faculty" className="w-[300px]">
            <SelectInput
              value={facultyId ?? ""}
              onChange={(e) => setFacultyId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Select a faculty member</option>
              {facultyOptions?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} · {f.designation}
                </option>
              ))}
            </SelectInput>
          </SecretaryField>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load the timetable."}
        </p>
      )}

      {isLoading && (
        <div className="h-64 animate-pulse rounded-2xl border border-[#E3E8EF] bg-slate-50" />
      )}

      {!isLoading && !error && (classId || facultyId) && (
        <div className="overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-[10px] border-b border-[#E3E8EF] px-5 py-4">
            <SecretaryCalendarIcon className="h-[17px] w-[17px] text-blue-600" />
            <div className="text-[15.5px] font-semibold text-slate-900">{gridTitle}</div>
            <span className="text-[12.5px] text-slate-400">{gridSub}</span>
          </div>
          <TimetableGrid slots={slotsResult?.data ?? []} mode={mode} />
        </div>
      )}

      {!isLoading && !error && !classId && !facultyId && (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#E3E8EF] bg-white text-sm text-slate-500">
          {mode === "student" ? "Select a class to view its timetable." : "Select a faculty member to view their timetable."}
        </div>
      )}
    </div>
  );
}
