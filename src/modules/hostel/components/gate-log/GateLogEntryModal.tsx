"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ResidentPicker } from "../residents/ResidentPicker";
import { useCreateGateLogEntry } from "../../hooks/useGateLog";
import type { Resident } from "../../types/residents";
import type { GateEntryType } from "../../types/gate-log";

interface GateLogEntryModalProps {
  open: boolean;
  onClose: () => void;
}

export function GateLogEntryModal({ open, onClose }: GateLogEntryModalProps) {
  const { show } = useToast();
  const [resident, setResident] = useState<Resident | null>(null);
  const [entryType, setEntryType] = useState<GateEntryType>("out");
  const createEntry = useCreateGateLogEntry();

  function handleClose() {
    setResident(null);
    setEntryType("out");
    onClose();
  }

  function handleSubmit() {
    if (!resident) return;
    createEntry.mutate(
      { student_id: resident.id, entry_type: entryType },
      {
        onSuccess: () => {
          show(`${entryType === "out" ? "Check-out" : "Check-in"} recorded for ${resident.name}.`, "success");
          handleClose();
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Manual gate entry">
      <div className="flex flex-col gap-4">
        <ResidentPicker value={resident} onChange={setResident} />

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Movement</p>
          <SegmentedControl<GateEntryType>
            options={[
              { value: "out", label: "Check-out" },
              { value: "in", label: "Check-in" },
            ]}
            value={entryType}
            onChange={setEntryType}
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createEntry.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!resident}
            isPending={createEntry.isPending}
            onClick={handleSubmit}
          >
            Record entry
          </Button>
        </div>
      </div>
    </Modal>
  );
}
