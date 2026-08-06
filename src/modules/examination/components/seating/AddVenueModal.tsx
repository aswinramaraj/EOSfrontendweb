"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useAllVenues } from "@/modules/venues/hooks/useVenues";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useAddVersionVenue } from "../../hooks/useSeatingVersionMutations";
import type { SeatingAllocationMode, SeatingPattern } from "../../types/seating";

const PATTERNS: { value: SeatingPattern; label: string }[] = [
  { value: "sequential", label: "Sequential" },
  { value: "alternate_seat", label: "Alternate seat" },
  { value: "rowwise_mixed", label: "Row-wise mixed" },
  { value: "columnwise_mixed", label: "Column-wise mixed" },
  { value: "checkerboard", label: "Checkerboard" },
  { value: "snake_order", label: "Snake order" },
];

interface AddVenueModalProps {
  open: boolean;
  versionId: number;
  excludeVenueIds: number[];
  onClose: () => void;
}

export function AddVenueModal({ open, versionId, excludeVenueIds, onClose }: AddVenueModalProps) {
  const { show } = useToast();
  const { data: venuePage } = useAllVenues();
  const { data: departments } = useDepartments();
  const addVenue = useAddVersionVenue();

  const [venueId, setVenueId] = useState<number | "">("");
  const [mode, setMode] = useState<SeatingAllocationMode>("automatic");
  const [pattern, setPattern] = useState<SeatingPattern>("sequential");
  const [deptIds, setDeptIds] = useState<number[]>([]);

  const availableVenues = (venuePage?.data ?? []).filter((v) => !excludeVenueIds.includes(v.id));

  function toggleDept(id: number) {
    setDeptIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  function handleSubmit() {
    if (!venueId) return;
    addVenue.mutate(
      {
        versionId,
        input: { venue_id: venueId, allocation_mode: mode, pattern, department_ids: deptIds },
      },
      {
        onSuccess: () => {
          show("Venue added.", "success");
          setVenueId("");
          setDeptIds([]);
          onClose();
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Add venue" widthClassName="max-w-lg">
      <div className="flex flex-col gap-4">
        <FormField label="Venue" htmlFor="venue-picker" required>
          <SelectInput id="venue-picker" value={venueId} onChange={(e) => setVenueId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Select a venue</option>
            {availableVenues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.capacity ? `(cap. ${v.capacity})` : ""}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Allocation mode" htmlFor="alloc-mode">
          <SelectInput id="alloc-mode" value={mode} onChange={(e) => setMode(e.target.value as SeatingAllocationMode)}>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual (register number list)</option>
          </SelectInput>
        </FormField>

        {mode === "automatic" && (
          <FormField label="Seating pattern" htmlFor="pattern-picker">
            <SelectInput id="pattern-picker" value={pattern} onChange={(e) => setPattern(e.target.value as SeatingPattern)}>
              {PATTERNS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </SelectInput>
          </FormField>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Allowed departments</p>
          <p className="mb-2 text-xs text-slate-500">Leave all unticked for no restriction.</p>
          <div className="flex flex-wrap gap-2">
            {departments?.map((d) => (
              <label
                key={d.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                  deptIds.includes(d.id) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5"
                  checked={deptIds.includes(d.id)}
                  onChange={() => toggleDept(d.id)}
                />
                {d.code}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={addVenue.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit} disabled={!venueId} isPending={addVenue.isPending}>
            Add venue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
