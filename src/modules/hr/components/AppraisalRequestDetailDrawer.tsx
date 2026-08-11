"use client";

import { useState } from "react";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { XIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { formatDate } from "../lib/request-format";
import {
  useApproveAppraisalRequest,
  useRejectAppraisalRequest,
  useScoreAppraisalRequest,
} from "../hooks/useAppraisalRequests";
import type { AppraisalRequest, AppraisalRequestStatus } from "../types/api";

const STATUS_LABEL: Record<AppraisalRequestStatus, string> = {
  submitted: "Submitted",
  hod_reviewed: "HOD Reviewed",
  hr_scored: "HR Scored",
  management_approved: "Approved",
  rejected: "Rejected",
};

const STATUS_TONE: Record<AppraisalRequestStatus, PillTone> = {
  submitted: "slate",
  hod_reviewed: "blue",
  hr_scored: "amber",
  management_approved: "green",
  rejected: "red",
};

interface AppraisalRequestDetailDrawerProps {
  request: AppraisalRequest | null;
  onClose: () => void;
}

export function AppraisalRequestDetailDrawer({ request, onClose }: AppraisalRequestDetailDrawerProps) {
  if (!request) return null;
  // Keyed by request.id so the content below remounts (fresh `scores` state)
  // whenever a different request is opened, instead of syncing via effect.
  return <AppraisalRequestDetailDrawerContent key={request.id} request={request} onClose={onClose} />;
}

interface AppraisalRequestDetailDrawerContentProps {
  request: AppraisalRequest;
  onClose: () => void;
}

function AppraisalRequestDetailDrawerContent({ request, onClose }: AppraisalRequestDetailDrawerContentProps) {
  const { show } = useToast();
  const scoreRequest = useScoreAppraisalRequest();
  const approveRequest = useApproveAppraisalRequest();
  const rejectRequest = useRejectAppraisalRequest();
  const [scores, setScores] = useState<Record<number, string>>(() =>
    Object.fromEntries(request.entries.map((entry) => [entry.id, entry.score?.toString() ?? ""])),
  );

  const canScore = request.status === "submitted" || request.status === "hod_reviewed";
  const canDecide = request.status === "hr_scored";
  const allScored = request.entries.every((entry) => scores[entry.id]?.trim());

  function handleSubmitScores() {
    const entries = request.entries.map((entry) => ({
      entry_id: entry.id,
      score: Number(scores[entry.id]),
    }));
    scoreRequest.mutate(
      { id: request.id, entries },
      {
        onSuccess: () => {
          show("Scores submitted.", "success");
          onClose();
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to submit scores.", "error"),
      },
    );
  }

  function handleDecision(action: "approve" | "reject") {
    const mutation = action === "approve" ? approveRequest : rejectRequest;
    mutation.mutate(request.id, {
      onSuccess: () => {
        show(action === "approve" ? "Review approved." : "Review rejected.", action === "approve" ? "success" : "info");
        onClose();
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to update.", "error"),
    });
  }

  const isPending = scoreRequest.isPending || approveRequest.isPending || rejectRequest.isPending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {request.faculty.designation} · AY {request.academic_year}
            </p>
            <h3 className="text-base font-bold text-slate-900">{fullName(request.faculty)}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5">
          <div className="flex items-center gap-2">
            <StatusPill tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</StatusPill>
            <span className="text-sm text-slate-500">Submitted {formatDate(request.created_at)}</span>
          </div>

          <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Criteria & Scores</h4>
          <div className="mt-2 flex flex-col divide-y divide-slate-100 border-t border-b border-slate-100">
            {request.entries.map((entry) => (
              <div key={entry.id} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{entry.criteria.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {entry.criteria.division.name} · Max {entry.criteria.max_score}
                    </p>
                  </div>
                  {!canScore && (
                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {entry.score ?? "—"} / {entry.criteria.max_score}
                    </span>
                  )}
                </div>
                {entry.description && <p className="mt-2 text-xs text-slate-600">{entry.description}</p>}
                {canScore && (
                  <div className="mt-3 flex items-center gap-2">
                    <label htmlFor={`score-${entry.id}`} className="text-xs font-medium text-slate-600">
                      Score
                    </label>
                    <NumberInput
                      id={`score-${entry.id}`}
                      className="w-20"
                      min={0}
                      max={entry.criteria.max_score}
                      value={scores[entry.id] ?? ""}
                      onChange={(e) => setScores((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                    />
                    <span className="text-xs text-slate-400">/ {entry.criteria.max_score}</span>
                  </div>
                )}
              </div>
            ))}
            {request.entries.length === 0 && (
              <p className="py-4 text-sm text-slate-500">No criteria entries on this submission.</p>
            )}
          </div>

          <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
            {[
              ["HOD reviewer", request.hod_reviewer?.email ?? "—"],
              ["HOD reviewed on", request.hod_reviewed_at ? formatDate(request.hod_reviewed_at) : "—"],
              ["Approved by", request.management_approver?.email ?? "—"],
              [
                "Approved on",
                request.management_approved_at ? formatDate(request.management_approved_at) : "—",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4">
          {canDecide && (
            <p className="text-xs text-slate-500">
              Scores are in — as HR, you finalize this appraisal by approving or rejecting it below.
            </p>
          )}
          <div className="flex gap-2">
            {canScore && (
              <Button
                variant="primary"
                className="flex-1"
                disabled={!allScored}
                isPending={isPending}
                onClick={handleSubmitScores}
              >
                Submit Scores
              </Button>
            )}
            {canDecide && (
              <>
                <Button variant="secondary" className="flex-1" disabled={isPending} onClick={() => handleDecision("reject")}>
                  Reject
                </Button>
                <Button variant="primary" className="flex-1" isPending={isPending} onClick={() => handleDecision("approve")}>
                  Approve &amp; Finalize
                </Button>
              </>
            )}
            {!canScore && !canDecide && (
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
