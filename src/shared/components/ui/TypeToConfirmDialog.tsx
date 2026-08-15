"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangleIcon } from "@/shared/components/icons";

interface TypeToConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** The exact string the admin must type — twice — to enable the action. */
  confirmValue: string;
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// A stronger confirmation gate than ConfirmDialog's single click, for
// actions with real consequences (revoking a person's access) — the admin
// must type the exact value twice, mirroring a password + confirm-password
// pattern rather than a single "type DELETE" field, before the action
// button even becomes clickable.
export function TypeToConfirmDialog({
  open,
  title,
  message,
  confirmValue,
  confirmLabel,
  isPending = false,
  onConfirm,
  onClose,
}: TypeToConfirmDialogProps) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");

  // Reset the typed values whenever the dialog transitions closed -> open,
  // so a stale match from the last time it was used never carries over.
  // Adjusting state during render (React's documented alternative to an
  // effect for this exact case) instead of useEffect, which would cause an
  // extra render pass just to clear two fields.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFirst("");
      setSecond("");
    }
  }

  const firstMatches = first.trim() === confirmValue;
  const secondMatches = second.trim() === confirmValue;
  const canConfirm = firstMatches && secondMatches;

  return (
    <Modal open={open} onClose={onClose} title={title} widthClassName="max-w-md">
      <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        <AlertTriangleIcon className="h-5 w-5 shrink-0" />
        <p>{message}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Type <span className="font-mono font-semibold text-slate-900">{confirmValue}</span> to confirm
          <input
            type="text"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            autoComplete="off"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              first.length === 0
                ? "border-slate-300 focus:ring-blue-500"
                : firstMatches
                  ? "border-green-300 focus:ring-green-500"
                  : "border-red-300 focus:ring-red-500"
            }`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Re-enter it to confirm
          <input
            type="text"
            value={second}
            onChange={(e) => setSecond(e.target.value)}
            autoComplete="off"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              second.length === 0
                ? "border-slate-300 focus:ring-blue-500"
                : secondMatches
                  ? "border-green-300 focus:ring-green-500"
                  : "border-red-300 focus:ring-red-500"
            }`}
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="dangerSolid" onClick={onConfirm} disabled={!canConfirm} isPending={isPending}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
