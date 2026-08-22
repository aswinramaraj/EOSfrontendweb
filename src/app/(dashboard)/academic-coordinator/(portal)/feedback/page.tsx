"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlacementTable,
  placementSelectStyle,
  type PlacementTableColumn,
} from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { ApiError } from "@/shared/lib/api-client";
import { useBatches, useClasses, useCourses, useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useFeedbackForms } from "@/modules/academic-coordinator/hooks/useFeedbackQueries";
import { useDeleteFeedbackForm, usePublishFeedbackForm } from "@/modules/academic-coordinator/hooks/useFeedbackMutations";
import { FeedbackFormDialog } from "@/modules/academic-coordinator/components/FeedbackFormDialog";
import { EditFeedbackFormDialog } from "@/modules/academic-coordinator/components/EditFeedbackFormDialog";
import { FEEDBACK_COURSE_TYPE_LABELS, type FeedbackForm } from "@/modules/academic-coordinator/types";

const PAGE_SIZE = 10;

export default function FeedbackFormsPage() {
  const router = useRouter();
  const { show } = useToast();
  const [page, setPage] = useState(1);
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const departments = useDepartments();
  const courses = useCourses();
  const batches = useBatches();
  const classes = useClasses();
  const deleteForm = useDeleteFeedbackForm();
  const publishForm = usePublishFeedbackForm();

  const forms = useFeedbackForms({
    page,
    limit: PAGE_SIZE,
    batch_id: batchFilter === "all" ? undefined : Number(batchFilter),
    class_id: classFilter === "all" ? undefined : Number(classFilter),
  });

  const classLabel = useMemo(() => {
    const deptById = new Map((departments.data ?? []).map((d) => [d.id, d.code]));
    const courseById = new Map((courses.data ?? []).map((c) => [c.id, c.code]));
    const batchById = new Map((batches.data ?? []).map((b) => [b.id, b.name]));
    return (id: number) => {
      const c = (classes.data ?? []).find((x) => x.id === id);
      if (!c) return `Class #${id}`;
      return `${deptById.get(c.department_id) ?? "?"} · ${courseById.get(c.course_id) ?? "?"} · ${batchById.get(c.batch_id) ?? "?"} · Sec ${c.section}`;
    };
  }, [classes.data, departments.data, courses.data, batches.data]);

  function handlePublish(id: number) {
    setPublishingId(id);
    publishForm
      .mutateAsync(id)
      .then(() => show("Feedback form published", "success"))
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error"))
      .finally(() => setPublishingId(null));
  }

  function handleDelete(id: number) {
    setDeletingId(id);
    deleteForm
      .mutateAsync(id)
      .then(() => {
        show("Feedback form deleted", "success");
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error");
      })
      .finally(() => {
        setDeletingId(null);
        setConfirmingDeleteId(null);
      });
  }

  const columns: PlacementTableColumn<FeedbackForm>[] = [
    { key: "title", label: "Title", width: "2fr", strong: true, render: (f) => ({ text: f.title }) },
    {
      key: "target",
      label: "Target",
      width: "1.4fr",
      render: (f) => ({
        text: f.class_id ? classLabel(f.class_id) : f.batchName ? `Batch: ${f.batchName}` : "—",
      }),
    },
    {
      key: "type",
      label: "Type",
      width: "1fr",
      type: "badge",
      render: (f) => ({ text: f.form_type === "end_semester" ? "End Semester" : "General" }),
    },
    {
      key: "category",
      label: "Category",
      width: "1fr",
      render: (f) => ({ text: f.category ? FEEDBACK_COURSE_TYPE_LABELS[f.category] : "—" }),
    },
    {
      key: "status",
      label: "Status",
      width: "0.8fr",
      type: "badge",
      render: (f) => ({ text: f.isPublished ? "Published" : "Draft" }),
    },
    { key: "questions", label: "Questions", width: "0.8fr", render: (f) => ({ text: String(f.questionCount) }) },
    {
      key: "created",
      label: "Created",
      width: "1fr",
      render: (f) => ({ text: new Date(f.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }),
    },
    {
      key: "actions",
      label: "",
      width: "1.8fr",
      type: "action",
      actions: (f) => [
        ...(f.isPublished
          ? []
          : [
              {
                label: publishingId === f.id ? "Publishing…" : "Publish",
                tone: "primary" as const,
                disabled: publishingId === f.id,
                onClick: () => handlePublish(f.id),
              },
            ]),
        f.isPublished
          ? { label: "Results", onClick: () => router.push(`/academic-coordinator/feedback/${f.id}`) }
          : { label: "Edit", onClick: () => setEditingId(f.id) },
        {
          label: deletingId === f.id ? "Deleting…" : "Delete",
          tone: "danger",
          disabled: deletingId === f.id,
          onClick: () => setConfirmingDeleteId(f.id),
        },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Feedback</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Create and manage general or end-of-semester faculty rating feedback forms. All responses are anonymous.
          </p>
        </div>
        <button type="button" style={pageButtonStyle(true)} onClick={() => setCreateOpen(true)}>
          + New form
        </button>
      </div>

      <PlacementTable
        toolbar={
          <>
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setPage(1);
              }}
              style={placementSelectStyle}
            >
              <option value="all">All batches</option>
              {(batches.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              style={placementSelectStyle}
            >
              <option value="all">All classes</option>
              {(classes.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {classLabel(c.id)}
                </option>
              ))}
            </select>
          </>
        }
        columns={columns}
        rows={forms.data?.data ?? []}
        rowKey={(f) => f.id}
        onRowClick={(f) => (f.isPublished ? router.push(`/academic-coordinator/feedback/${f.id}`) : setEditingId(f.id))}
        sort={null}
        onSortChange={() => {}}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        totalCount={forms.data?.meta.total}
        emptyMessage={forms.isLoading ? "Loading…" : "No feedback forms yet. Create one to get started."}
      />

      <FeedbackFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <EditFeedbackFormDialog key={editingId ?? "none"} formId={editingId} onClose={() => setEditingId(null)} />

      <ConfirmDialog
        open={confirmingDeleteId != null}
        title="Delete feedback form?"
        message="This permanently removes the form and its questions. Forms that already have student responses cannot be deleted."
        confirmLabel="Delete"
        tone="danger"
        isPending={deletingId != null}
        onConfirm={() => confirmingDeleteId != null && handleDelete(confirmingDeleteId)}
        onClose={() => setConfirmingDeleteId(null)}
      />
    </div>
  );
}
