"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useAllocateVersionVenue } from "../../hooks/useSeatingVersionMutations";
import type { SeatingVersionVenue } from "../../types/seating";

interface AllocateVenueModalProps {
  open: boolean;
  versionId: number;
  versionVenue: SeatingVersionVenue | null;
  onClose: () => void;
}

export function AllocateVenueModal({ open, versionId, versionVenue, onClose }: AllocateVenueModalProps) {
  const { show } = useToast();
  const allocate = useAllocateVersionVenue();
  const [entriesText, setEntriesText] = useState("");
  const [specialText, setSpecialText] = useState("");

  const isManual = versionVenue?.allocation_mode === "manual";

  function handleSubmit() {
    if (!versionVenue) return;

    const entries = entriesText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const special = specialText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (isManual && entries.length === 0) {
      show("Enter at least one register number or range.", "error");
      return;
    }

    allocate.mutate(
      {
        versionId,
        venueLinkId: versionVenue.id,
        input: isManual
          ? { entries, special_accommodation_register_numbers: special }
          : {},
      },
      {
        onSuccess: (rows) => {
          show(`${rows.length} student(s) seated in ${versionVenue.venues.name}.`, "success");
          setEntriesText("");
          setSpecialText("");
          onClose();
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={`Allocate seats — ${versionVenue?.venues.name ?? ""}`} widthClassName="max-w-lg">
      <div className="flex flex-col gap-4">
        {isManual ? (
          <>
            <FormField
              label="Register numbers"
              htmlFor="alloc-entries"
              hint='One per line or comma-separated. Ranges allowed, e.g. "22IT101-22IT130".'
              required
            >
              <textarea
                id="alloc-entries"
                rows={5}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={entriesText}
                onChange={(e) => setEntriesText(e.target.value)}
              />
            </FormField>
            <FormField
              label="Special accommodation"
              htmlFor="alloc-special"
              hint="Register numbers from the list above needing special seating (optional)."
            >
              <textarea
                id="alloc-special"
                rows={2}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={specialText}
                onChange={(e) => setSpecialText(e.target.value)}
              />
            </FormField>
          </>
        ) : (
          <p className="text-sm text-slate-600">
            Seats every eligible, not-yet-seated student from this exam&apos;s published timetable for this date/session
            using the <span className="font-medium">{versionVenue?.pattern}</span> pattern.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={allocate.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit} isPending={allocate.isPending}>
            Allocate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
