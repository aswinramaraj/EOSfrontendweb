import type { EducationLoanDD } from "./types";

interface DeleteEducationLoanDDDialogProps {
  dd: EducationLoanDD;
  error?: string | null;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteEducationLoanDDDialog({
  dd,
  error,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteEducationLoanDDDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-zinc-900">Delete Education Loan DD</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Are you sure you want to delete DD{" "}
          <span className="font-medium text-zinc-700">{dd.ddReferenceNumber}</span>? This action cannot be undone.
        </p>

        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
