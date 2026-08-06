"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ExamPicker } from "@/modules/examination/components/ExamPicker";
import { MapSubjectsPanel } from "@/modules/examination/components/timetable/MapSubjectsPanel";
import { SlotFormModal } from "@/modules/examination/components/timetable/SlotFormModal";
import { useSortedExams } from "@/modules/examination/hooks/useSortedExams";
import { useIsSeniorCoe } from "@/modules/examination/hooks/useIsSeniorCoe";
import { useTimetableVersions, useTimetableVersion } from "@/modules/examination/hooks/useTimetableVersions";
import {
  useCreateTimetableVersion,
  useReadyToPublishVersion,
  useReturnVersionToDrafts,
  usePublishVersion,
  useWithdrawVersion,
  useDeleteTimetableVersion,
  useDeleteTimetableSlot,
} from "@/modules/examination/hooks/useTimetableVersionMutations";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import type { TimetableSlot, TimetableVersionStatus } from "@/modules/examination/types/exam-timetable-versions";

// start_time/end_time come back as full ISO datetimes on a 1970-01-01
// placeholder date (Prisma's @db.Time mapped through JSON) — only the
// HH:mm portion at [11,16) is meaningful.
function toHm(isoTime: string): string {
  return isoTime.includes("T") ? isoTime.slice(11, 16) : isoTime.slice(0, 5);
}

const STATUS_TONE: Record<TimetableVersionStatus, PillTone> = {
  draft: "slate",
  ready_to_publish: "amber",
  published: "green",
  superseded: "slate",
  withdrawn: "red",
};

const STATUS_LABEL: Record<TimetableVersionStatus, string> = {
  draft: "Draft",
  ready_to_publish: "Ready to publish",
  published: "Published",
  superseded: "Superseded",
  withdrawn: "Withdrawn",
};

export default function TimetablePage() {
  const { show } = useToast();
  const isSeniorCoe = useIsSeniorCoe();

  const { data: sortedExams } = useSortedExams();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const examId = selectedExamId ?? sortedExams[0]?.id ?? null;

  const { data: departments } = useDepartments();
  const [newVersionDept, setNewVersionDept] = useState<number | "">("");

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [slotFormTarget, setSlotFormTarget] = useState<TimetableSlot | "new" | null>(null);
  const [slotDeleteTarget, setSlotDeleteTarget] = useState<TimetableSlot | null>(null);
  const [versionDeleteTarget, setVersionDeleteTarget] = useState<number | null>(null);

  const { data: versions } = useTimetableVersions({ exam_id: examId ?? undefined });
  const { data: versionDetail } = useTimetableVersion(selectedVersionId);

  const createVersion = useCreateTimetableVersion();
  const readyToPublish = useReadyToPublishVersion();
  const returnToDrafts = useReturnVersionToDrafts();
  const publishVersion = usePublishVersion();
  const withdrawVersion = useWithdrawVersion();
  const deleteVersion = useDeleteTimetableVersion();
  const deleteSlot = useDeleteTimetableSlot();

  function onError(err: unknown) {
    show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
  }

  function handleCreateVersion() {
    if (!examId) return;
    createVersion.mutate(
      { exam_id: examId, department_id: newVersionDept || undefined },
      {
        onSuccess: (version) => {
          show(`Draft version v${version.version_number} created.`, "success");
          setSelectedVersionId(version.id);
          setNewVersionDept("");
        },
        onError,
      },
    );
  }

  const slotColumns: DataTableColumn<TimetableSlot>[] = [
    {
      key: "subject",
      header: "Paper",
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900">
            {s.exam_subject_mapping.subjects.subject_code} · {s.exam_subject_mapping.subjects.name}
          </p>
          <p className="text-xs text-slate-500">Section {s.exam_subject_mapping.classes.section}</p>
        </div>
      ),
    },
    { key: "exam_date", header: "Date", render: (s) => s.exam_date.slice(0, 10) },
    { key: "session", header: "Session" },
    { key: "time", header: "Time", render: (s) => `${toHm(s.start_time)}–${toHm(s.end_time)}` },
    { key: "venue", header: "Venue", render: (s) => s.venues?.name ?? "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (s) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => setSlotFormTarget(s)} className="text-slate-400 hover:text-blue-700" aria-label="Edit slot">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setSlotDeleteTarget(s)} className="text-slate-400 hover:text-red-600" aria-label="Delete slot">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Timetables"
        description="Version, schedule and publish examination timetables."
        actions={<ExamPicker value={examId} onChange={setSelectedExamId} />}
      />

      {examId && <MapSubjectsPanel examId={examId} />}

      {examId && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Timetable versions</h3>
            <div className="flex items-end gap-2">
              <SelectInput
                value={newVersionDept}
                onChange={(e) => setNewVersionDept(e.target.value ? Number(e.target.value) : "")}
                className="w-auto"
              >
                <option value="">Exam-wide (all departments)</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </SelectInput>
              <Button variant="primary" onClick={handleCreateVersion} isPending={createVersion.isPending}>
                <PlusIcon className="h-4 w-4" /> New draft version
              </Button>
            </div>
          </div>

          {(!versions || versions.length === 0) && (
            <p className="text-sm text-slate-500">No timetable versions yet for this examination.</p>
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
                  v{v.version_number} · {v.departments?.name ?? "Exam-wide"}
                  <span className="ml-2 text-xs text-slate-500">{v._count?.exam_timetable ?? 0} papers scheduled</span>
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
                v{versionDetail.version_number} · {versionDetail.departments?.name ?? "Exam-wide"}
              </h3>
              <StatusPill tone={STATUS_TONE[versionDetail.status]}>{STATUS_LABEL[versionDetail.status]}</StatusPill>
            </div>
            <div className="flex flex-wrap gap-2">
              {versionDetail.status === "draft" && (
                <>
                  <Button variant="primary" size="sm" onClick={() => setSlotFormTarget("new")}>
                    <PlusIcon className="h-4 w-4" /> Schedule paper
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
                        { onSuccess: () => show("Timetable published.", "success"), onError },
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
                      onSuccess: () => show("Timetable withdrawn.", "success"),
                      onError,
                    })
                  }
                >
                  {isSeniorCoe ? "Withdraw" : "Senior COE only"}
                </Button>
              )}
            </div>
          </div>

          <DataTable
            columns={slotColumns}
            rows={versionDetail.exam_timetable}
            rowKey={(row) => row.id}
            emptyMessage="No papers scheduled in this version yet."
          />
        </div>
      )}

      {examId && selectedVersionId && (
        <SlotFormModal
          open={slotFormTarget !== null}
          versionId={selectedVersionId}
          examId={examId}
          scheduledMappingIds={versionDetail?.exam_timetable.map((s) => s.exam_subject_mapping_id) ?? []}
          slot={slotFormTarget === "new" ? null : slotFormTarget}
          onClose={() => setSlotFormTarget(null)}
        />
      )}

      <ConfirmDialog
        open={slotDeleteTarget !== null}
        title="Remove scheduled paper"
        message="Remove this paper from the timetable version? This can't be undone."
        confirmLabel="Remove"
        tone="danger"
        isPending={deleteSlot.isPending}
        onConfirm={() => {
          if (!slotDeleteTarget) return;
          deleteSlot.mutate(slotDeleteTarget.id, {
            onSuccess: () => {
              show("Slot removed.", "success");
              setSlotDeleteTarget(null);
            },
            onError,
          });
        }}
        onClose={() => setSlotDeleteTarget(null)}
      />

      <ConfirmDialog
        open={versionDeleteTarget !== null}
        title="Delete draft version"
        message="Delete this draft timetable version and every slot in it? This can't be undone."
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
