"use client";

import Link from "next/link";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { XIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useHrRequestDecision } from "../hooks/useHrRequests";
import type { AppraisalRequest, HrUnifiedRequest } from "../types/api";

const APPRAISAL_STATUS_LABEL: Record<string, string> = {
  hod_reviewed: "HOD Reviewed, awaiting HR",
  hr_scored: "Scored, awaiting final approval",
};

interface PendingActionsDrawerProps {
  open: boolean;
  requests: HrUnifiedRequest[];
  appraisals: AppraisalRequest[];
  onClose: () => void;
}

// Only ever shows what HR can actually act on right now — a leave/OD request
// still waiting on HOD isn't an HR task yet (it stays visible on the
// Requests page instead), and an appraisal only lands here once HOD has
// reviewed it. Anything narrower would hide real work; anything broader
// would make "urgent" mean nothing.
export function PendingActionsDrawer({ open, requests, appraisals, onClose }: PendingActionsDrawerProps) {
  const { show } = useToast();
  const decision = useHrRequestDecision();

  if (!open) return null;

  function approve(request: HrUnifiedRequest) {
    decision.mutate(
      { kind: request.kind, sourceId: request.source_id, decision: "approved" },
      {
        onSuccess: () =>
          show(`${request.kind === "leave" ? "Leave" : "OD"} request for ${fullName(request.faculty)} approved.`, "success"),
        onError: (error) => show(error instanceof Error ? error.message : "Failed to approve.", "error"),
      },
    );
  }

  const totalCount = requests.length + appraisals.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Urgent tasks</p>
            <h3 className="text-base font-bold text-slate-900">Pending Actions</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 divide-y divide-slate-100 px-5">
          {requests.map((request) => (
            <div key={request.id} className="flex flex-col gap-2 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{fullName(request.faculty)}</p>
                  <StatusPill tone="slate">{request.faculty.department.name}</StatusPill>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {request.kind === "leave" ? "Leave" : "OD"} • {request.detail ?? "No details provided"}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/hr/faculty-directory/${request.faculty.id}?tab=${request.kind === "leave" ? "attendance" : "od"}`}
                  onClick={onClose}
                  className="shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View {request.kind === "leave" ? "Attendance" : "OD History"}
                </Link>
                <button
                  onClick={() => approve(request)}
                  disabled={decision.isPending}
                  className="shrink-0 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}

          {appraisals.map((appraisal) => (
            <div key={appraisal.id} className="flex flex-col gap-2 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{fullName(appraisal.faculty)}</p>
                  <StatusPill tone="slate">{appraisal.academic_year}</StatusPill>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Appraisal • {APPRAISAL_STATUS_LABEL[appraisal.status] ?? appraisal.status}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Link
                  href="/hr/employee-reviews"
                  onClick={onClose}
                  className="shrink-0 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}

          {totalCount === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No pending actions right now.</p>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <Link
            href="/hr/requests?tab=pending"
            onClick={onClose}
            className="flex flex-1 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            View All Requests
          </Link>
        </div>
      </aside>
    </div>
  );
}
