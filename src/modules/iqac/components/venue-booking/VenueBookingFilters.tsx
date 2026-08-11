import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import type { VenueBookingListParams } from "../../types/venue-booking";

interface VenueBookingFiltersProps {
  value: VenueBookingListParams;
  onChange: (value: VenueBookingListParams) => void;
}

export function VenueBookingFilters({ value, onChange }: VenueBookingFiltersProps) {
  const { data: departments } = useDepartments();

  function reset() {
    onChange({ status: value.status });
  }

  return (
    <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Filter requests
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.6fr_1.2fr_1.2fr_auto]">
        <SearchInput
          placeholder="Search faculty…"
          value={value.search ?? ""}
          onChange={(e) => onChange({ ...value, search: e.target.value || undefined })}
        />
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
        <input
          type="date"
          value={value.date ?? ""}
          onChange={(e) => onChange({ ...value, date: e.target.value || undefined })}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
