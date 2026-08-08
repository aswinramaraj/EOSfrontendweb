"use client";

import { useState } from "react";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { XIcon } from "@/shared/components/icons";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useResidents } from "../../hooks/useResidents";
import type { Resident } from "../../types/residents";

interface ResidentPickerProps {
  value: Resident | null;
  onChange: (resident: Resident | null) => void;
  label?: string;
}

// Complaints/mess-feedback/gate-log are all staff-created on a resident's
// behalf — the backend only accepts a real student_id, so this picks from
// the actual residents list rather than offering a free-text student field.
export function ResidentPicker({ value, onChange, label = "Resident" }: ResidentPickerProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const { data, isFetching } = useResidents({ q: debouncedQuery || undefined, page_size: 8 });

  if (value) {
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
        <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-slate-900">{value.name}</p>
            <p className="text-xs text-slate-500">
              {value.student_id_no}
              {value.room ? ` · ${value.room.room_number}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Change resident"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      <SearchInput
        placeholder="Search by name, roll or student ID"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isFetching && <p className="mt-2 text-xs text-slate-400">Searching…</p>}
      <div className="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto">
        {data?.data.map((resident) => (
          <button
            key={resident.id}
            type="button"
            onClick={() => onChange(resident)}
            className="flex flex-col items-start rounded-md border border-slate-200 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50"
          >
            <span className="text-sm font-medium text-slate-900">{resident.name}</span>
            <span className="text-xs text-slate-500">
              {resident.student_id_no}
              {resident.room ? ` · ${resident.room.room_number}` : ""}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
