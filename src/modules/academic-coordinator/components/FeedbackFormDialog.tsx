"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useClasses, useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useCreateFeedbackForm } from "../hooks/useFeedbackMutations";
import { useQuestionTemplates } from "../hooks/useFeedbackQueries";
import { useAcademicYear } from "../context/AcademicYearContext";
import { FeedbackQuestionListEditor } from "./FeedbackQuestionListEditor";
import { FEEDBACK_COURSE_TYPE_LABELS, type FeedbackCourseType, type FeedbackFormType, type FeedbackQuestionInput } from "../types";
import { fieldErrorStyle, fieldHintStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "@/modules/academic-structure/lib/formStyles";

interface FeedbackFormDialogProps {
  open: boolean;
  onClose: () => void;
}

type TargetKind = "sections" | "batch";

const FEEDBACK_CATEGORIES = Object.keys(FEEDBACK_COURSE_TYPE_LABELS) as FeedbackCourseType[];

function emptyQuestion(): FeedbackQuestionInput {
  return { question_text: "", question_type: "rating" };
}

/** True only for the untouched starter question — used to decide whether loading a category's standard questions is safe or would silently overwrite something the coordinator already typed. */
function isPristineQuestionList(questions: FeedbackQuestionInput[]): boolean {
  return questions.length === 1 && questions[0].question_text.trim() === "";
}

function segmentButtonStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    height: 36,
    borderRadius: 8,
    border: `1px solid ${active ? "#1f4fd8" : "#dfe4ec"}`,
    background: active ? "#eaf0fe" : "#fff",
    color: active ? "#1f4fd8" : "#3f4b60",
    fontWeight: 600,
    fontSize: 12.5,
    cursor: "pointer",
  };
}

export function FeedbackFormDialog({ open, onClose }: FeedbackFormDialogProps) {
  const departments = useDepartments();
  const classes = useClasses();
  const createForm = useCreateFeedbackForm();
  const { show } = useToast();
  const { batchId: globalBatchId, selectedBatch } = useAcademicYear();

  const [title, setTitle] = useState("");
  const [targetKind, setTargetKind] = useState<TargetKind>("sections");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<Set<number>>(new Set());
  const [selectionScopeKey, setSelectionScopeKey] = useState<string | null>(null);
  const [formType, setFormType] = useState<FeedbackFormType>("general");
  const [category, setCategory] = useState<FeedbackCourseType | "">("");
  const [questions, setQuestions] = useState<FeedbackQuestionInput[]>([emptyQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const templates = useQuestionTemplates(category || null);

  const deptById = useMemo(() => new Map((departments.data ?? []).map((d) => [d.id, d])), [departments.data]);

  const classesInBatch = useMemo(() => (classes.data ?? []).filter((c) => c.batch_id === globalBatchId), [classes.data, globalBatchId]);

  const defaultDeptId = useMemo(() => {
    const withClasses = (departments.data ?? []).find((d) => classesInBatch.some((c) => c.department_id === d.id));
    return withClasses?.id ?? departments.data?.[0]?.id ?? null;
  }, [departments.data, classesInBatch]);

  const effectiveDeptId = departmentId ?? defaultDeptId;

  const sectionsInDept = useMemo(() => {
    return classesInBatch.filter((c) => c.department_id === effectiveDeptId).sort((a, b) => a.section.localeCompare(b.section));
  }, [classesInBatch, effectiveDeptId]);

  // Default to "all sections selected" whenever the dept (or global batch) scope changes —
  // adjusting state during render (React's documented pattern for this) rather than in an
  // effect, so there's no extra render pass or flash of the stale selection.
  const scopeKey = `${effectiveDeptId ?? "none"}:${globalBatchId ?? "none"}`;
  if (scopeKey !== selectionScopeKey) {
    setSelectionScopeKey(scopeKey);
    setSelectedClassIds(new Set(sectionsInDept.map((c) => c.id)));
  }

  function reset() {
    setTitle("");
    setTargetKind("sections");
    setDepartmentId(null);
    setSelectedClassIds(new Set());
    setSelectionScopeKey(null);
    setFormType("general");
    setCategory("");
    setQuestions([emptyQuestion()]);
    setError(null);
    setProgress(null);
  }

  function loadTemplateQuestions() {
    if (!templates.data || templates.data.length === 0) return;
    setQuestions(
      [...templates.data]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((t): FeedbackQuestionInput => ({ question_text: t.questionText, question_type: "rating" })),
    );
  }

  function handleClose() {
    reset();
    onClose();
  }

  function toggleSection(classId: number) {
    setSelectedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  }

  async function handleSave() {
    setError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return setError("Title is required.");
    if (targetKind === "sections" && selectedClassIds.size === 0) return setError("Select at least one section.");
    if (targetKind === "batch" && !globalBatchId) return setError("Select a batch from the top bar first.");
    if (formType === "end_semester" && targetKind !== "sections") {
      return setError("End-of-semester faculty rating forms must target specific sections, not a whole batch.");
    }
    const cleanQuestions = questions.map((q) => ({ ...q, question_text: q.question_text.trim() })).filter((q) => q.question_text);
    if (cleanQuestions.length === 0) return setError("Add at least one question.");

    if (targetKind === "batch") {
      createForm
        .mutateAsync({
          title: trimmedTitle,
          batch_id: globalBatchId as number,
          form_type: formType,
          category: category || undefined,
          questions: cleanQuestions,
        })
        .then(() => {
          show("Feedback form created", "success");
          handleClose();
        })
        .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again."));
      return;
    }

    const targetIds = [...selectedClassIds];
    let succeeded = 0;
    for (const classId of targetIds) {
      setProgress(`Creating ${succeeded + 1} of ${targetIds.length}…`);
      try {
        await createForm.mutateAsync({
          title: trimmedTitle,
          class_id: classId,
          form_type: formType,
          category: category || undefined,
          questions: cleanQuestions,
        });
        succeeded += 1;
      } catch {
        // continue creating the rest; report the shortfall below
      }
    }
    setProgress(null);
    if (succeeded === targetIds.length) {
      show(targetIds.length === 1 ? "Feedback form created" : `Created ${succeeded} feedback forms`, "success");
      handleClose();
    } else if (succeeded > 0) {
      show(`Created ${succeeded} of ${targetIds.length} forms — check the list and retry the rest.`, "error");
      handleClose();
    } else {
      setError("Could not create the form. Please try again.");
    }
  }

  const isSaving = createForm.isPending || progress != null;

  return (
    <Modal open={open} onClose={handleClose} title="New feedback form" widthClassName="max-w-2xl">
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} style={fieldInputStyle()} placeholder="e.g. End Semester Faculty Feedback — Odd 2026" />
      </div>

      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Who is this for? *</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={segmentButtonStyle(targetKind === "sections")} onClick={() => setTargetKind("sections")}>
            Department &amp; sections
          </button>
          <button
            type="button"
            style={segmentButtonStyle(targetKind === "batch")}
            onClick={() => {
              setTargetKind("batch");
              setFormType("general");
            }}
          >
            An entire batch
          </button>
        </div>
      </div>

      {targetKind === "sections" ? (
        <div style={{ background: "#f8fafc", border: "1px solid #eef1f6", borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div>
            <label style={fieldLabelStyle}>Department</label>
            <select
              value={effectiveDeptId ?? ""}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              style={fieldInputStyle()}
            >
              {(departments.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={fieldLabelStyle}>
              Sections {sectionsInDept.length > 0 && <span style={{ fontWeight: 400, color: "#96a0b0" }}>({selectedClassIds.size} of {sectionsInDept.length} selected)</span>}
            </label>
            {sectionsInDept.length === 0 ? (
              <p style={{ fontSize: 12, color: "#96a0b0", margin: 0 }}>
                {deptById.get(effectiveDeptId ?? -1)?.name ?? "This department"} has no classes in the {selectedBatch ? `${selectedBatch.start_year}-${selectedBatch.end_year}` : "selected"} batch.
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {sectionsInDept.map((c) => {
                  const active = selectedClassIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleSection(c.id)}
                      style={{
                        height: 32,
                        padding: "0 14px",
                        borderRadius: 20,
                        border: `1px solid ${active ? "#1f4fd8" : "#dfe4ec"}`,
                        background: active ? "#1f4fd8" : "#fff",
                        color: active ? "#fff" : "#3f4b60",
                        fontWeight: 600,
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      Section {c.section}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedClassIds.size > 1 && (
              <p style={{ fontSize: 11, color: "#96a0b0", margin: "8px 0 0 0" }}>Creates one identical form per selected section.</p>
            )}
          </div>
        </div>
      ) : (
        <div style={fieldRowStyle}>
          <label style={fieldLabelStyle}>Batch</label>
          <div style={{ ...fieldInputStyle(), display: "flex", alignItems: "center", background: "#f8fafc", color: "#3f4b60", fontWeight: 600 }}>
            {selectedBatch ? `${selectedBatch.start_year}-${selectedBatch.end_year}` : "No batch selected"}
          </div>
          <p style={fieldHintStyle}>Sent to every student in this batch, across all departments and sections. Switch batches from the top bar.</p>
        </div>
      )}

      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Form type *</label>
        <select value={formType} onChange={(e) => setFormType(e.target.value as FeedbackFormType)} style={fieldInputStyle()}>
          <option value="general">General feedback (per-question aggregate)</option>
          <option value="end_semester" disabled={targetKind !== "sections"}>
            End-of-semester faculty rating (per faculty × subject matrix)
          </option>
        </select>
      </div>

      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as FeedbackCourseType | "")} style={fieldInputStyle()}>
          <option value="">No category — custom questions, sent to everyone in scope</option>
          {FEEDBACK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {FEEDBACK_COURSE_TYPE_LABELS[c]}
            </option>
          ))}
        </select>
        <p style={fieldHintStyle}>Optional. Picking one lets you reuse that category&apos;s standard question set below.</p>
      </div>

      <FeedbackQuestionListEditor
        questions={questions}
        onChange={setQuestions}
        headerExtra={
          category && (templates.data?.length ?? 0) > 0 ? (
            <button
              type="button"
              onClick={loadTemplateQuestions}
              title={isPristineQuestionList(questions) ? undefined : "Replaces the questions below with this category's standard set"}
              style={{ fontSize: 12, fontWeight: 600, color: "#1f4fd8", background: "none", border: "none", cursor: "pointer" }}
            >
              Load {templates.data?.length} standard question{(templates.data?.length ?? 0) === 1 ? "" : "s"}
            </button>
          ) : null
        }
      />

      {error && <p style={fieldErrorStyle}>{error}</p>}

      <div style={dialogFooterStyle}>
        <button type="button" style={pageButtonStyle(false)} onClick={handleClose} disabled={isSaving}>
          Cancel
        </button>
        <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={isSaving}>
          {progress ?? (isSaving ? "Creating…" : selectedClassIds.size > 1 && targetKind === "sections" ? `Create ${selectedClassIds.size} forms` : "Create form")}
        </button>
      </div>
    </Modal>
  );
}
