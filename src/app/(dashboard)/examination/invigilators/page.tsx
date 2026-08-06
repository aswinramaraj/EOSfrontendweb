"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { TextInput } from "@/shared/components/ui/TextInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ExamPicker } from "@/modules/examination/components/ExamPicker";
import { useSortedExams } from "@/modules/examination/hooks/useSortedExams";
import { useIsSeniorCoe } from "@/modules/examination/hooks/useIsSeniorCoe";
import { useHallPlans } from "@/modules/examination/hooks/useHallPlans";
import {
  useInvigilationBatches,
  useFindOrCreateInvigilationBatch,
  useSubmitInvigilationBatch,
  usePublishInvigilationBatch,
  useDeleteInvigilationBatch,
} from "@/modules/examination/hooks/useInvigilationBatches";
import {
  useInvigilationDuties,
  useFacultyWorkload,
  useCreateInvigilationDuty,
  useDeleteInvigilationDuty,
} from "@/modules/examination/hooks/useInvigilation";
import type { ExamSession } from "@/modules/examination/types";
import type {
  InvigilationBatchStatus,
  InvigilationDuty,
  InvigilationRole,
} from "@/modules/examination/types/invigilation";

const STATUS_TONE: Record<InvigilationBatchStatus, PillTone> = {
  draft: "slate",
  submitted: "blue",
  published: "green",
};

export default function InvigilatorsPage() {
  const { show } = useToast();
  const isSeniorCoe = useIsSeniorCoe();

  const { data: sortedExams } = useSortedExams();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const examId = selectedExamId ?? sortedExams[0]?.id ?? null;

  const [newDate, setNewDate] = useState("");
  const [newSession, setNewSession] = useState<ExamSession>("FN");
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  const [dutyHallPlanId, setDutyHallPlanId] = useState<number | "">("");
  const [dutyFacultyId, setDutyFacultyId] = useState<number | "">("");
  const [dutyRole, setDutyRole] = useState<InvigilationRole>("relief");

  const [workloadFacultyId, setWorkloadFacultyId] = useState<number | "">("");

  const { data: batches } = useInvigilationBatches({ exam_id: examId ?? undefined });
  const selectedBatch = batches?.find((b) => b.id === selectedBatchId) ?? null;

  const { data: hallPlanPage } = useHallPlans({
    exam_id: examId ?? undefined,
    exam_date: selectedBatch?.exam_date.slice(0, 10),
    limit: 100,
  });

  const { data: dutyPage } = useInvigilationDuties({
    exam_id: examId ?? undefined,
    duty_date: selectedBatch?.exam_date.slice(0, 10),
    session: selectedBatch?.session,
    limit: 200,
  });

  const { data: workload } = useFacultyWorkload(workloadFacultyId || null);

  const findOrCreateBatch = useFindOrCreateInvigilationBatch();
  const submitBatch = useSubmitInvigilationBatch();
  const publishBatch = usePublishInvigilationBatch();
  const deleteBatch = useDeleteInvigilationBatch();
  const createDuty = useCreateInvigilationDuty();
  const deleteDuty = useDeleteInvigilationDuty();

  function onError(err: unknown) {
    show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
  }

  function handleGetOrCreateBatch() {
    if (!examId || !newDate) return;
    findOrCreateBatch.mutate(
      { exam_id: examId, exam_date: newDate, session: newSession },
      {
        onSuccess: (batch) => {
          show(`Batch ready · ${batch.exam_date.slice(0, 10)} · ${batch.session}`, "success");
          setSelectedBatchId(batch.id);
          setNewDate("");
        },
        onError,
      },
    );
  }

  function handleAddDuty() {
    if (!examId || !dutyHallPlanId || !dutyFacultyId || !selectedBatch) return;
    createDuty.mutate(
      {
        exam_id: examId,
        hall_plan_id: dutyHallPlanId,
        faculty_id: dutyFacultyId,
        duty_date: selectedBatch.exam_date.slice(0, 10),
        session: selectedBatch.session,
        role: dutyRole,
        allocation_batch_id: selectedBatch.id,
      },
      {
        onSuccess: (duty) => {
          show(
            duty.warning === "DOUBLE_DUTY"
              ? "Duty assigned — this faculty already has a duty elsewhere in this session."
              : "Duty assigned.",
            duty.warning === "DOUBLE_DUTY" ? "info" : "success",
          );
          setDutyFacultyId("");
        },
        onError,
      },
    );
  }

  const dutyColumns: DataTableColumn<InvigilationDuty>[] = [
    {
      key: "faculty",
      header: "Faculty",
      render: (d) => `${d.faculty.first_name} ${d.faculty.last_name}`,
    },
    { key: "hall", header: "Hall / venue", render: (d) => d.hall_plans.venues.name },
    { key: "role", header: "Role", render: (d) => <span className="capitalize">{d.role}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (d) => (
        <button
          onClick={() =>
            deleteDuty.mutate(d.id, {
              onSuccess: () => show("Duty removed.", "success"),
              onError,
            })
          }
          className="text-slate-400 hover:text-red-600"
          aria-label="Remove duty"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invigilators"
        description="Assign invigilation duty and manage allocation batches per date and session."
        actions={<ExamPicker value={examId} onChange={setSelectedExamId} />}
      />

      {examId && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Allocation batches</h3>
            <div className="flex items-end gap-2">
              <TextInput type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-auto" />
              <SelectInput value={newSession} onChange={(e) => setNewSession(e.target.value as ExamSession)} className="w-auto">
                <option value="FN">Forenoon (FN)</option>
                <option value="AN">Afternoon (AN)</option>
              </SelectInput>
              <Button variant="primary" onClick={handleGetOrCreateBatch} disabled={!newDate} isPending={findOrCreateBatch.isPending}>
                Get / create batch
              </Button>
            </div>
          </div>

          {(!batches || batches.length === 0) && <p className="text-sm text-slate-500">No allocation batches yet.</p>}

          <div className="flex flex-col gap-2">
            {batches?.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBatchId(b.id)}
                className={`flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                  selectedBatchId === b.id ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="font-medium text-slate-900">
                  {b.exam_date.slice(0, 10)} · {b.session}
                  <span className="ml-2 text-xs text-slate-500">{b._count?.invigilation_duties ?? 0} duties</span>
                </span>
                <StatusPill tone={STATUS_TONE[b.status]}>{b.status}</StatusPill>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedBatch && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedBatch.exam_date.slice(0, 10)} · {selectedBatch.session}
              </h3>
              <StatusPill tone={STATUS_TONE[selectedBatch.status]}>{selectedBatch.status}</StatusPill>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedBatch.status === "draft" && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    isPending={submitBatch.isPending}
                    onClick={() =>
                      submitBatch.mutate(selectedBatch.id, {
                        onSuccess: () => show("Batch submitted.", "success"),
                        onError,
                      })
                    }
                  >
                    Submit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteBatch.mutate(selectedBatch.id, { onSuccess: () => setSelectedBatchId(null), onError })}>
                    Delete
                  </Button>
                </>
              )}
              {selectedBatch.status === "submitted" && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!isSeniorCoe}
                  isPending={publishBatch.isPending}
                  onClick={() =>
                    publishBatch.mutate(selectedBatch.id, {
                      onSuccess: () => show("Batch published to faculty.", "success"),
                      onError,
                    })
                  }
                >
                  {isSeniorCoe ? "Publish" : "Awaiting Senior COE"}
                </Button>
              )}
            </div>
          </div>

          {selectedBatch.status === "draft" && (
            <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Hall / venue</label>
                <SelectInput
                  value={dutyHallPlanId}
                  onChange={(e) => setDutyHallPlanId(e.target.value ? Number(e.target.value) : "")}
                  className="w-auto min-w-56"
                >
                  <option value="">Select a hall</option>
                  {hallPlanPage?.data.map((hp) => (
                    <option key={hp.id} value={hp.id}>
                      {hp.venues.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Faculty ID</label>
                <NumberInput
                  value={dutyFacultyId}
                  onChange={(e) => setDutyFacultyId(e.target.value ? Number(e.target.value) : "")}
                  className="w-28"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Role</label>
                <SelectInput value={dutyRole} onChange={(e) => setDutyRole(e.target.value as InvigilationRole)} className="w-auto">
                  <option value="relief">Relief</option>
                  <option value="chief">Chief</option>
                </SelectInput>
              </div>
              <Button variant="primary" onClick={handleAddDuty} disabled={!dutyHallPlanId || !dutyFacultyId} isPending={createDuty.isPending}>
                Assign duty
              </Button>
              <p className="w-full text-xs text-slate-500">
                No faculty directory API is exposed to COE yet — enter the faculty&apos;s numeric ID directly.
              </p>
            </div>
          )}

          <DataTable
            columns={dutyColumns}
            rows={dutyPage?.data ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No duties assigned in this batch yet."
          />
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Faculty workload lookup</h3>
        <div className="flex items-end gap-3">
          <NumberInput
            value={workloadFacultyId}
            onChange={(e) => setWorkloadFacultyId(e.target.value ? Number(e.target.value) : "")}
            className="w-32"
            placeholder="Faculty ID"
          />
        </div>
        {workload && (
          <p className="mt-3 text-sm text-slate-700">
            {workload.faculty.first_name} {workload.faculty.last_name} · {workload.total_duties} total duties (
            {workload.chief_duties} chief, {workload.relief_duties} relief)
          </p>
        )}
      </div>
    </div>
  );
}
