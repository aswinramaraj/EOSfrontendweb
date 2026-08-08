import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";

export interface OdFilterValue {
  department_id?: number;
  from?: string;
  to?: string;
}

interface OdFiltersProps {
  value: OdFilterValue;
  onChange: (value: OdFilterValue) => void;
}

export function OdFilters({ value, onChange }: OdFiltersProps) {
  const { data: departments } = useDepartments();

  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="w-52">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Department</p>
        <SelectInput
          value={value.department_id ?? ""}
          onChange={(e) =>
            onChange({ ...value, department_id: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">All departments</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </SelectInput>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">From</p>
        <input
          type="date"
          value={value.from ?? ""}
          onChange={(e) => onChange({ ...value, from: e.target.value || undefined })}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">To</p>
        <input
          type="date"
          value={value.to ?? ""}
          onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <Button variant="secondary" onClick={() => onChange({})}>
        Reset
      </Button>
    </div>
  );
}
