"use client";

import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";

export interface FacultyFiltersValue {
  department_id?: number;
  designation?: string;
  status?: "active" | "inactive";
  year?: number;
}

interface FacultyFiltersBarProps {
  value: FacultyFiltersValue;
  onChange: (value: FacultyFiltersValue) => void;
  designationOptions: string[];
  yearOptions: number[];
}

function toId(value: string): number | undefined {
  return value ? Number(value) : undefined;
}

const hasAnyFilter = (value: FacultyFiltersValue) =>
  value.department_id !== undefined ||
  value.designation !== undefined ||
  value.status !== undefined ||
  value.year !== undefined;

export function FacultyFiltersBar({
  value,
  onChange,
  designationOptions,
  yearOptions,
}: FacultyFiltersBarProps) {
  const { data: departments } = useDepartments();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-slate-500">Filters</span>

      {/* SelectInput hardcodes w-full internally — a plain `className="w-auto"`
          on the element itself doesn't reliably beat that in the generated
          stylesheet (both are same-specificity utilities; whichever Tailwind
          happens to emit later wins, not whichever is listed later in the
          className string). Constraining a wrapper instead sidesteps that
          entirely: the select's own w-full just fills the wrapper's width. */}
      <div className="w-44">
        <SelectInput
          value={value.department_id ?? ""}
          onChange={(e) => onChange({ ...value, department_id: toId(e.target.value) })}
        >
          <option value="">Department: All</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="w-44">
        <SelectInput
          value={value.designation ?? ""}
          onChange={(e) => onChange({ ...value, designation: e.target.value || undefined })}
        >
          <option value="">Designation: All</option>
          {designationOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="w-36">
        <SelectInput
          value={value.status ?? ""}
          onChange={(e) =>
            onChange({ ...value, status: (e.target.value || undefined) as "active" | "inactive" | undefined })
          }
        >
          <option value="">Status: All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectInput>
      </div>

      <div className="w-48">
        <SelectInput
          value={value.year ?? ""}
          onChange={(e) => onChange({ ...value, year: toId(e.target.value) })}
        >
          <option value="">Date of joining: All</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </SelectInput>
      </div>

      {hasAnyFilter(value) && (
        <button onClick={() => onChange({})} className="ml-auto text-sm font-medium text-blue-700 hover:underline">
          Clear all
        </button>
      )}
    </div>
  );
}
