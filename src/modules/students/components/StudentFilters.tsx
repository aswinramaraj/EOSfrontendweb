"use client";

import { FilterIcon } from "@/shared/components/icons";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useBatches } from "@/modules/batches/hooks/useBatches";
import { useCourses } from "@/modules/courses/hooks/useCourses";
import { useQuotas } from "@/modules/quotas/hooks/useQuotas";
import type { ListStudentsParams } from "../types";

export type StudentFiltersValue = Pick<
  ListStudentsParams,
  "status" | "department_id" | "batch_id" | "course_id" | "quota_id" | "student_type"
>;

interface StudentFiltersProps {
  value: StudentFiltersValue;
  onChange: (value: StudentFiltersValue) => void;
  onClearAll: () => void;
}

function toId(value: string): number | undefined {
  return value ? Number(value) : undefined;
}

/** Reason shown on every filter the schema can't back yet — same wording pattern as the rest of this page. */
const NOT_REAL = "Needs data that doesn't exist as a queryable field yet";

const hasAnyFilter = (value: StudentFiltersValue) => Object.values(value).some((v) => v !== undefined);

export function StudentFilters({ value, onChange, onClearAll }: StudentFiltersProps) {
  const { data: departments } = useDepartments();
  const { data: batches } = useBatches();
  const { data: courses } = useCourses();
  const { data: quotas } = useQuotas();

  return (
    <div className="flex flex-col gap-3">
      {/* Row matches the reference's exact 6 filters, in its exact order. */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <FilterIcon className="h-4 w-4" />
          Filters
        </span>

        {/* SelectInput's own <select> is w-full — each wrapper below constrains
            that to its content width, otherwise every dropdown would stretch
            to fill this flex row and stack one per line. */}
        <div className="w-fit">
          <SelectInput
            name="status"
            value={value.status ?? ""}
            onChange={(e) => onChange({ ...value, status: (e.target.value || undefined) as never })}
          >
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            {/* Real values in the reference this page follows — not real in this
                schema (students.status is active/inactive only) — shown, disabled. */}
            <option disabled title={NOT_REAL}>
              Graduated — not tracked
            </option>
            <option disabled title={NOT_REAL}>
              Alumni — not tracked
            </option>
            <option disabled title={NOT_REAL}>
              Suspended — not tracked
            </option>
            <option disabled title={NOT_REAL}>
              Transferred — not tracked
            </option>
          </SelectInput>
        </div>

        <div className="w-fit">
          <SelectInput
            name="department_id"
            value={value.department_id ?? ""}
            onChange={(e) => onChange({ ...value, department_id: toId(e.target.value) })}
          >
            <option value="">Dept: All</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id} title={d.name}>
                {d.code}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="w-fit">
          <SelectInput name="year" disabled defaultValue="" title={`Year — ${NOT_REAL} (no per-student study-year field)`}>
            <option value="">Year: All</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </SelectInput>
        </div>

        <div className="w-fit">
          <SelectInput name="fees" disabled defaultValue="" title={`Fees — ${NOT_REAL} (no per-student fee-status endpoint)`}>
            <option value="">Fees: All</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
            <option value="due">Any dues</option>
          </SelectInput>
        </div>

        <div className="w-fit">
          <SelectInput
            name="attendance"
            disabled
            defaultValue=""
            title={`Attendance — ${NOT_REAL} (no attendance-summary endpoint)`}
          >
            <option value="">Attendance: All</option>
            <option value="high">85% and above</option>
            <option value="mid">75–84%</option>
            <option value="low">Below 75%</option>
          </SelectInput>
        </div>

        <div className="w-fit">
          <SelectInput
            name="quota_id"
            value={value.quota_id ?? ""}
            onChange={(e) => onChange({ ...value, quota_id: toId(e.target.value) })}
          >
            <option value="">Quota: All</option>
            {quotas?.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </SelectInput>
        </div>

        {hasAnyFilter(value) && (
          <button type="button" onClick={onClearAll} className="ml-auto text-sm font-medium text-blue-700 hover:text-blue-800">
            Clear all
          </button>
        )}
      </div>

      {/* Beyond the reference's own 6: real, additional facets this schema
          actually supports. Kept on their own row so the primary row above
          stays pixel-matched to the reference. */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">More filters</span>

        <div className="w-fit">
          <SelectInput
            name="batch_id"
            value={value.batch_id ?? ""}
            onChange={(e) => onChange({ ...value, batch_id: toId(e.target.value) })}
          >
            <option value="">Batch: All</option>
            {batches?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="w-fit">
          <SelectInput
            name="course_id"
            value={value.course_id ?? ""}
            onChange={(e) => onChange({ ...value, course_id: toId(e.target.value) })}
          >
            <option value="">Course: All</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="w-fit">
          <SelectInput
            name="student_type"
            value={value.student_type ?? ""}
            onChange={(e) => onChange({ ...value, student_type: (e.target.value || undefined) as never })}
          >
            <option value="">Type: All</option>
            <option value="hosteller">Hosteller</option>
            <option value="dayscholar">Day scholar</option>
          </SelectInput>
        </div>
      </div>
    </div>
  );
}
