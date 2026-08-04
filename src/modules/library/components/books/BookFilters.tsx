"use client";

import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useCategories } from "../../hooks/useCategories";
import { useRacks } from "../../hooks/useRacks";

export interface BookFiltersValue {
  category_id?: number;
  department_id?: number;
  rack_id?: number;
  available_only?: boolean;
}

interface BookFiltersProps {
  value: BookFiltersValue;
  onChange: (value: BookFiltersValue) => void;
}

function toId(value: string): number | undefined {
  return value ? Number(value) : undefined;
}

export function BookFilters({ value, onChange }: BookFiltersProps) {
  const { data: categories } = useCategories();
  const { data: departments } = useDepartments();
  const { data: racks } = useRacks({ page_size: 100 });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectInput
        className="w-auto"
        value={value.category_id ?? ""}
        onChange={(e) => onChange({ ...value, category_id: toId(e.target.value) })}
      >
        <option value="">All categories</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </SelectInput>

      <SelectInput
        className="w-auto"
        value={value.department_id ?? ""}
        onChange={(e) => onChange({ ...value, department_id: toId(e.target.value) })}
      >
        <option value="">All departments</option>
        {departments?.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </SelectInput>

      <SelectInput
        className="w-auto"
        value={value.rack_id ?? ""}
        onChange={(e) => onChange({ ...value, rack_id: toId(e.target.value) })}
      >
        <option value="">All racks</option>
        {racks?.data.map((r) => (
          <option key={r.id} value={r.id}>
            {r.rack_code}
          </option>
        ))}
      </SelectInput>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={!!value.available_only}
          onChange={(e) => onChange({ ...value, available_only: e.target.checked || undefined })}
          className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
        />
        Available only
      </label>
    </div>
  );
}
