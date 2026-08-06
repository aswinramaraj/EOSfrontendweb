"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ExamPicker } from "@/modules/examination/components/ExamPicker";
import { AddVenueModal } from "@/modules/examination/components/seating/AddVenueModal";
import { AllocateVenueModal } from "@/modules/examination/components/seating/AllocateVenueModal";
import { useSortedExams } from "@/modules/examination/hooks/useSortedExams";
import { useIsSeniorCoe } from "@/modules/examination/hooks/useIsSeniorCoe";
import { useSeatingVersions, useSeatingVersion } from "@/modules/examination/hooks/useSeatingVersions";
import {
  useCreateSeatingVersion,
  useReadyToPublishSeatingVersion,
  useReturnSeatingVersionToDrafts,
  usePublishSeatingVersion,
  useWithdrawSeatingVersion,
  useDeleteSeatingVersion,
  useRemoveVersionVenue,
  useClearVenueAllocation,
} from "@/modules/examination/hooks/useSeatingVersionMutations";
import type { ExamSession } from "@/modules/examination/types";
import type { SeatingVersionStatus, SeatingVersionVenue } from "@/modules/examination/types/seating";

const STATUS_TONE: Record<SeatingVersionStatus, PillTone> = {
  draft: "slate",
  ready_to_publish: "amber",
  published: "green",
  superseded: "slate",
  withdrawn: "red",
};

const STATUS_LABEL: Record<SeatingVersionStatus, string> = {
  draft: "Draft",
  ready_to_publish: "Ready to publish",
  published: "Published",
  superseded: "Superseded",
  withdrawn: "Withdrawn",
};

export default function SeatingPage() {
  const { show } = useToast();
  const isSeniorCoe = useIsSeniorCoe();

  const { data: sortedExams } = useSortedExams();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const examId = selectedExamId ?? sortedExams[0]?.id ?? null;

  const [newDate, setNewDate] = useState("");
  const [newSession, setNewSession] = useState<ExamSession>("FN");

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [addVenueOpen, setAddVenueOpen] = useState(false);
  const [allocateTarget, setAllocateTarget] = useState<SeatingVersionVenue | null>(null);
  const [removeVenueTarget, setRemoveVenueTarget] = useState<SeatingVersionVenue | null>(null);
  const [versionDeleteTarget, setVersionDeleteTarget] = useState<number | null>(null);

  const { data: versions } = useSeatingVersions({ exam_id: examId ?? undefined });
  const { data: versionDetail } = useSeatingVersion(selectedVersionId);

  const createVersion = useCreateSeatingVersion();
  const readyToPublish = useReadyToPublishSeatingVersion();
  const returnToDrafts = useReturnSeatingVersionToDrafts();
  const publishVersion = usePublishSeatingVersion();
  const withdrawVersion = useWithdrawSeatingVersion();
  const deleteVersion = useDeleteSeatingVersion();
  const removeVenue = useRemoveVersionVenue();
  const clearAllocation = useClearVenueAllocation();

  function onError(err: unknown) {
    show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
  }

  function handleCreateVersion() {
    if (!examId || !newDate) return;
    createVersion.mutate(
      { exam_id: examId, exam_date: newDate, session: newSession },
      {
        onSuccess: (version) => {
          show(`Draft version v${version.version_number} created.`, "success");
          setSelectedVersionId(version.id);
          setNewDate("");
        },
        onError,
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Halls & seating"
        description="Allocate venues and seats per examination date and session."
        actions={<ExamPicker value={examId} onChange={setSelectedExamId} />}
      />

      {examId && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Seating plan versions</h3>
            <div className="flex items-end gap-2">
              <TextInput type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-auto" />
              <SelectInput value={newSession} onChange={(e) => setNewSession(e.target.value as ExamSession)} className="w-auto">
                <option value="FN">Forenoon (FN)</option>
                <option value="AN">Afternoon (AN)</option>
              </SelectInput>
              <Button variant="primary" onClick={handleCreateVersion} disabled={!newDate} isPending={createVersion.isPending}>
                <PlusIcon className="h-4 w-4" /> New draft version
              </Button>
            </div>
          </div>

          {(!versions || versions.length === 0) && (
            <p className="text-sm text-slate-500">No seating plan versions yet for this examination.</p>
          )}

          <div className="flex flex-col gap-2">
            {versions?.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVersionId(v.id)}
                className={`flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                  selectedVersionId === v.id ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="font-medium text-slate-900">
                  {v.exam_date.slice(0, 10)} · {v.session} · v{v.version_number}
                  <span className="ml-2 text-xs text-slate-500">{v._count?.seating_plan_version_venues ?? 0} venue(s)</span>
                </span>
                <StatusPill tone={STATUS_TONE[v.status]}>{STATUS_LABEL[v.status]}</StatusPill>
              </button>
            ))}
          </div>
        </div>
      )}

      {versionDetail && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {versionDetail.exam_date.slice(0, 10)} · {versionDetail.session} · v{versionDetail.version_number}
              </h3>
              <StatusPill tone={STATUS_TONE[versionDetail.status]}>{STATUS_LABEL[versionDetail.status]}</StatusPill>
            </div>
            <div className="flex flex-wrap gap-2">
              {versionDetail.status === "draft" && (
                <>
                  <Button variant="primary" size="sm" onClick={() => setAddVenueOpen(true)}>
                    <PlusIcon className="h-4 w-4" /> Add venue
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    isPending={readyToPublish.isPending}
                    onClick={() =>
                      readyToPublish.mutate(versionDetail.id, {
                        onSuccess: () => show("Staged for publish.", "success"),
                        onError,
                      })
                    }
                  >
                    Stage for publish
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setVersionDeleteTarget(versionDetail.id)}>
                    Delete
                  </Button>
                </>
              )}
              {versionDetail.status === "ready_to_publish" && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!isSeniorCoe}
                    isPending={returnToDrafts.isPending}
                    onClick={() =>
                      returnToDrafts.mutate(versionDetail.id, {
                        onSuccess: () => show("Returned to drafts.", "success"),
                        onError,
                      })
                    }
                  >
                    Return to drafts
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!isSeniorCoe}
                    isPending={publishVersion.isPending}
                    onClick={() =>
                      publishVersion.mutate(
                        { id: versionDetail.id },
                        { onSuccess: () => show("Seating plan published.", "success"), onError },
                      )
                    }
                  >
                    {isSeniorCoe ? "Publish" : "Awaiting Senior COE"}
                  </Button>
                </>
              )}
              {versionDetail.status === "published" && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={!isSeniorCoe}
                  isPending={withdrawVersion.isPending}
                  onClick={() =>
                    withdrawVersion.mutate(versionDetail.id, {
                      onSuccess: () => show("Seating plan withdrawn.", "success"),
                      onError,
                    })
                  }
                >
                  {isSeniorCoe ? "Withdraw" : "Senior COE only"}
                </Button>
              )}
            </div>
          </div>

          {versionDetail.seating_plan_version_venues.length === 0 && (
            <p className="text-sm text-slate-500">No venues added to this version yet.</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {versionDetail.seating_plan_version_venues.map((vv) => (
              <div key={vv.id} className="rounded-md border border-slate-200 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{vv.venues.name}</p>
                    <p className="text-xs text-slate-500">
                      {vv.venues.location ?? "—"} · Capacity {vv.venues.capacity ?? "—"}
                    </p>
                  </div>
                  {versionDetail.status === "draft" && (
                    <button
                      onClick={() => setRemoveVenueTarget(vv)}
                      className="text-slate-400 hover:text-red-600"
                      aria-label="Remove venue"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mb-2 text-xs text-slate-600">
                  {vv.allocation_mode === "automatic" ? `Automatic · ${vv.pattern}` : "Manual roll list"}
                  {vv.seating_plan_venue_departments.length > 0 &&
                    ` · ${vv.seating_plan_venue_departments.map((d) => d.departments.code).join(", ")}`}
                </p>
                {versionDetail.status === "draft" && (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setAllocateTarget(vv)}>
                      Allocate
                    </Button>
                    {vv.hall_plan_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isPending={clearAllocation.isPending}
                        onClick={() =>
                          clearAllocation.mutate(
                            { versionId: versionDetail.id, venueLinkId: vv.id },
                            {
                              onSuccess: (res) => show(`${res.deleted_count} seat(s) cleared.`, "success"),
                              onError,
                            },
                          )
                        }
                      >
                        Clear allocation
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedVersionId && (
        <AddVenueModal
          open={addVenueOpen}
          versionId={selectedVersionId}
          excludeVenueIds={versionDetail?.seating_plan_version_venues.map((v) => v.venue_id) ?? []}
          onClose={() => setAddVenueOpen(false)}
        />
      )}

      {selectedVersionId && (
        <AllocateVenueModal
          open={allocateTarget !== null}
          versionId={selectedVersionId}
          versionVenue={allocateTarget}
          onClose={() => setAllocateTarget(null)}
        />
      )}

      <ConfirmDialog
        open={removeVenueTarget !== null}
        title="Remove venue"
        message={`Remove ${removeVenueTarget?.venues.name} from this seating plan version?`}
        confirmLabel="Remove"
        tone="danger"
        isPending={removeVenue.isPending}
        onConfirm={() => {
          if (!removeVenueTarget || !selectedVersionId) return;
          removeVenue.mutate(
            { versionId: selectedVersionId, venueLinkId: removeVenueTarget.id },
            {
              onSuccess: () => {
                show("Venue removed.", "success");
                setRemoveVenueTarget(null);
              },
              onError,
            },
          );
        }}
        onClose={() => setRemoveVenueTarget(null)}
      />

      <ConfirmDialog
        open={versionDeleteTarget !== null}
        title="Delete draft version"
        message="Delete this draft seating plan version and every venue/allocation in it? This can't be undone."
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteVersion.isPending}
        onConfirm={() => {
          if (!versionDeleteTarget) return;
          deleteVersion.mutate(versionDeleteTarget, {
            onSuccess: () => {
              show("Draft version deleted.", "success");
              if (selectedVersionId === versionDeleteTarget) setSelectedVersionId(null);
              setVersionDeleteTarget(null);
            },
            onError,
          });
        }}
        onClose={() => setVersionDeleteTarget(null)}
      />
    </div>
  );
}
