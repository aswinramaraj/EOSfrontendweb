"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ChevronLeftIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { formatDate } from "@/modules/hr/lib/request-format";
import { HRCard } from "@/modules/hr/components/ui/HRCard";
import { HRPageSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import {
  useAppraisalRequestById,
  useApproveAppraisalRequest,
  useRejectAppraisalRequest,
  useScoreAppraisalRequest,
} from "@/modules/hr/hooks/useAppraisalRequests";
import type { AppraisalRequest, AppraisalRequestStatus } from "@/modules/hr/types/api";

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

export default function EmployeeReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const requestId = Number(id);
  const { data: request, isLoading, error } = useAppraisalRequestById(Number.isFinite(requestId) ? requestId : null);

  if (isLoading) {
    return <HRPageSkeleton statCount={0} cardCount={2} cardContentClassName="h-72" blockCount={0} />;
  }

  if (error || !request) {
    return (
      <div>
        <p className="text-sm text-slate-500">
          {error instanceof ApiError ? error.message : "This appraisal request couldn't be found."}
        </p>
        <Link href="/hr/employee-reviews" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          ← Back to reviews
        </Link>
      </div>
    );
  }

  // Keyed by request.id so `scores` (below) starts fresh whenever a
  // different request is opened, instead of syncing via an effect.
  return <EmployeeReviewDetailContent key={request.id} request={request} />;
}

function EmployeeReviewDetailContent({ request }: { request: AppraisalRequest }) {
  const router = useRouter();
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
  const isPending = scoreRequest.isPending || approveRequest.isPending || rejectRequest.isPending;

  const totalMax = request.entries.reduce((sum, entry) => sum + entry.criteria.max_score, 0);
  const totalScore = request.entries.reduce((sum, entry) => sum + (entry.score ?? (Number(scores[entry.id]) || 0)), 0);
  const completionPercent = request.entries.length
    ? Math.round((request.entries.filter((e) => e.score !== null).length / request.entries.length) * 100)
    : 0;

  function handleSubmitScores() {
    const entries = request.entries.map((entry) => ({
      entry_id: entry.id,
      score: Number(scores[entry.id]),
    }));
    scoreRequest.mutate(
      { id: request.id, entries },
      {
        onSuccess: () => show("Scores submitted.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to submit scores.", "error"),
      },
    );
  }

  function handleDecision(action: "approve" | "reject") {
    const mutation = action === "approve" ? approveRequest : rejectRequest;
    mutation.mutate(request.id, {
      onSuccess: () => {
        show(action === "approve" ? "Review approved." : "Review rejected.", action === "approve" ? "success" : "info");
        router.push("/hr/employee-reviews");
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to update.", "error"),
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/hr/employee-reviews" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
            <ChevronLeftIcon className="h-4 w-4" />
            Back to reviews
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Appraisal {request.academic_year}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{fullName(request.faculty)}</h1>
        </div>
        {canDecide && (
          <Button variant="primary" isPending={isPending} onClick={() => handleDecision("approve")}>
            Approve Appraisal
          </Button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <HRCard>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total Score</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{totalScore} / {totalMax || "—"}</p>
        </HRCard>
        <HRCard>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
          <div className="mt-1.5">
            <StatusPill tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</StatusPill>
          </div>
        </HRCard>
        <HRCard>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Completion</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{completionPercent}%</p>
        </HRCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HRCard title="Score breakdown">
          <div className="flex flex-col divide-y divide-slate-100">
            {request.entries.map((entry) => (
              <div key={entry.id} className="py-3">
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
        </HRCard>

        <HRCard title="Review notes">
          <dl className="divide-y divide-slate-100">
            {[
              ["Designation", request.faculty.designation],
              ["Cycle", request.academic_year],
              ["HOD reviewer", request.hod_reviewer?.email ?? "—"],
              ["HOD reviewed on", request.hod_reviewed_at ? formatDate(request.hod_reviewed_at) : "—"],
              ["Approved by", request.management_approver?.email ?? "—"],
              ["Approved on", request.management_approved_at ? formatDate(request.management_approved_at) : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </HRCard>
      </div>

      <div className="mt-6">
        <HRCard title="Workflow">
          <div className="flex flex-col">
            {[
              { label: "Self-appraisal submitted", date: request.created_at },
              ...(request.hod_reviewed_at ? [{ label: "HOD reviewed", date: request.hod_reviewed_at }] : []),
              ...(request.management_approved_at
                ? [{ label: request.status === "rejected" ? "Rejected" : "Approved", date: request.management_approved_at }]
                : []),
            ].map((step, index, arr) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                  {index < arr.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-100" />}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatDate(step.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </HRCard>
      </div>

      {(canScore || canDecide) && (
        <div className="mt-6 flex justify-end gap-2">
          {canScore && (
            <Button variant="primary" disabled={!allScored} isPending={isPending} onClick={handleSubmitScores}>
              Submit Scores
            </Button>
          )}
          {canDecide && (
            <>
              <Button variant="secondary" disabled={isPending} onClick={() => handleDecision("reject")}>
                Reject
              </Button>
              <Button variant="primary" isPending={isPending} onClick={() => handleDecision("approve")}>
                Approve &amp; Finalize
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
