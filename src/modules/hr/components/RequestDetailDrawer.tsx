"use client";

import { useToast } from "@/shared/components/ui/ToastProvider";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { XIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useHrRequestDecision } from "../hooks/useHrRequests";
import { durationLabel, formatDate, stageLabel } from "../lib/request-format";
import type { ApprovalStatus, HrUnifiedRequest } from "../types/api";

const STATUS_TONE: Record<ApprovalStatus, PillTone> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

interface RequestDetailDrawerProps {
  request: HrUnifiedRequest | null;
  onClose: () => void;
}

export function RequestDetailDrawer({ request, onClose }: RequestDetailDrawerProps) {
  const { show } = useToast();
  const decision = useHrRequestDecision();

  if (!request) return null;

  const canDecide = request.overall_status === "pending" && request.hod_approval_status === "approved";
  const awaitingHod = request.overall_status === "pending" && request.hod_approval_status !== "approved";

  function decide(action: "approved" | "rejected") {
    if (!request) return;
    decision.mutate(
      { kind: request.kind, sourceId: request.source_id, decision: action },
      {
        onSuccess: () => {
          show(
            `${request.kind === "leave" ? "Leave" : "OD"} request ${action === "approved" ? "approved" : "rejected"}.`,
            action === "approved" ? "success" : "info",
          );
          onClose();
        },
        onError: (error) => show(error instanceof Error ? error.message : "Failed to update.", "error"),
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              ID {request.faculty.id} · {request.faculty.department.name}
            </p>
            <h3 className="text-base font-bold text-slate-900">{fullName(request.faculty)}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {request.kind === "leave" ? "Leave" : "OD"}
            </span>
            <span className="text-sm text-slate-400">•</span>
            <span className="text-sm font-medium text-slate-700">
              {durationLabel(request.from_date, request.to_date)}
            </span>
            <StatusPill tone={STATUS_TONE[request.overall_status]}>{request.overall_status}</StatusPill>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {request.detail ?? "No details provided."}
          </p>

          <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
            {[
              ["Applied on", formatDate(request.created_at)],
              ["From", formatDate(request.from_date)],
              ["To", formatDate(request.to_date)],
              ["Current stage", stageLabel(request.hod_approval_status, request.hr_approval_status)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          {awaitingHod && (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              This request still needs HOD approval before HR can act on it.
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
          {canDecide ? (
            <>
              <button
                onClick={() => decide("rejected")}
                disabled={decision.isPending}
                className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                onClick={() => decide("approved")}
                disabled={decision.isPending}
                className="flex flex-1 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
              >
                Approve
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
