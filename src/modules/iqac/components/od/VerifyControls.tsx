import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import type { VerificationStatus } from "../../types/common";

const OPTIONS: { value: VerificationStatus; label: string }[] = [
  { value: "awaiting_documents", label: "Awaiting documents" },
  { value: "under_review", label: "Under review" },
  { value: "verified", label: "Verified" },
];

interface VerifyControlsProps {
  currentStatus: VerificationStatus;
  currentRemarks: string | null;
  isPending: boolean;
  onSave: (status: VerificationStatus, remarks: string) => void;
}

export function VerifyControls({ currentStatus, currentRemarks, isPending, onSave }: VerifyControlsProps) {
  const [status, setStatus] = useState<VerificationStatus>(currentStatus);
  const [remarks, setRemarks] = useState(currentRemarks ?? "");

  const dirty = status !== currentStatus || remarks !== (currentRemarks ?? "");

  return (
    <div className="rounded-lg border border-slate-200 p-3.5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        IQAC verification
      </div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === opt.value ? "bg-blue-700 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Administrative remarks (optional)"
        rows={2}
        className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      <div className="mt-2 flex justify-end">
        <Button size="sm" variant="primary" disabled={!dirty} isPending={isPending} onClick={() => onSave(status, remarks)}>
          Save
        </Button>
      </div>
    </div>
  );
}
