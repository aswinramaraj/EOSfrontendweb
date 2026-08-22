"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { placementSelectStyle } from "@/modules/placement/components/table/PlacementTable";
import { fieldErrorStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle } from "@/modules/academic-structure/lib/formStyles";
import { useDepartments } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useSubjects } from "@/modules/academic-coordinator/hooks/useSubjectsQueries";
import { useCreateSubject, useDeleteSubject, useUpdateSubject } from "@/modules/academic-coordinator/hooks/useSubjectsMutations";
import {
  SUBJECT_CATEGORY_LABELS,
  SUBJECT_COURSE_TYPE_LABELS,
  type Subject,
  type SubjectCategory,
  type SubjectCourseType,
} from "@/modules/academic-coordinator/types";

const COURSE_TYPES: SubjectCourseType[] = ["THEORY", "PRACTICAL", "THEORY_WITH_PRACTICAL", "PROJECT", "MANDATORY", "AUDIT"];
const CATEGORIES: SubjectCategory[] = ["CORE", "ELECTIVE", "OPEN_ELECTIVE", "MANDATORY", "VALUE_ADDED"];

interface FormState {
  shortCode: string;
  code: string;
  name: string;
  credits: string;
  type: SubjectCourseType | "";
  category: SubjectCategory | "";
  departmentId: string;
  hours: string;
}

const EMPTY_FORM: FormState = { shortCode: "", code: "", name: "", credits: "", type: "", category: "", departmentId: "", hours: "" };

function formatAdded(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CreateCoursePage() {
  const { show } = useToast();
  const departments = useDepartments();
  const subjects = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);

  const deptById = useMemo(() => new Map((departments.data ?? []).map((d) => [d.id, d])), [departments.data]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): Partial<Record<keyof FormState, string>> {
    const e: Partial<Record<keyof FormState, string>> = {};
    const code = form.code.trim().toUpperCase();
    if (!code) e.code = "Course code is required.";
    else if ((subjects.data ?? []).some((s) => s.subjectCode === code && s.id !== editingId)) e.code = "This course code already exists.";
    if (!form.name.trim()) e.name = "Subject name is required.";
    const credits = Number(form.credits);
    if (form.credits === "" || Number.isNaN(credits)) e.credits = "Credits are required.";
    else if (!Number.isInteger(credits) || credits < 1 || credits > 10) e.credits = "Credits must be a whole number between 1 and 10.";
    if (!form.shortCode.trim()) e.shortCode = "Short name is required.";
    if (!form.type) e.type = "Select a course type.";
    if (!form.category) e.category = "Select a category.";
    if (!form.departmentId) e.departmentId = "Select a department.";
    const hours = Number(form.hours);
    if (form.hours === "" || Number.isNaN(hours)) e.hours = "Number of hours is required.";
    else if (!Number.isInteger(hours) || hours < 1 || hours > 120) e.hours = "Hours must be a whole number between 1 and 120.";
    return e;
  }

  function handleSubmit() {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = {
      name: form.name.trim(),
      subject_code: form.code.trim().toUpperCase(),
      short_code: form.shortCode.trim().toUpperCase(),
      course_type: form.type as SubjectCourseType,
      category: form.category as SubjectCategory,
      department_id: Number(form.departmentId),
      hours: Number(form.hours),
      credits: Number(form.credits),
    };

    const mutation = editingId != null ? updateSubject.mutateAsync({ id: editingId, input }) : createSubject.mutateAsync(input);

    mutation
      .then(() => {
        show(editingId != null ? "Course Updated Successfully" : "Course Created Successfully", "success");
        setForm(EMPTY_FORM);
        setEditingId(null);
        setErrors({});
      })
      .catch((err: unknown) => {
        const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
        if (err instanceof ApiError && err.errorCode === "SUBJECT_CODE_EXISTS") setErrors((prev) => ({ ...prev, code: message }));
        else show(message, "error");
      });
  }

  function handleEdit(s: Subject) {
    setForm({
      shortCode: s.shortCode ?? "",
      code: s.subjectCode,
      name: s.name,
      credits: s.credits != null ? String(s.credits) : "",
      type: s.courseType ?? "",
      category: s.category ?? "",
      departmentId: s.departmentId != null ? String(s.departmentId) : "",
      hours: s.hours != null ? String(s.hours) : "",
    });
    setEditingId(s.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
  }

  function handleDelete(id: number) {
    setDeletingId(id);
    deleteSubject
      .mutateAsync(id)
      .then(() => show("Course Deleted", "success"))
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"))
      .finally(() => {
        setDeletingId(null);
        setConfirmingDeleteId(null);
      });
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (subjects.data ?? []).filter((s) => {
      const matchesQuery = !q || s.subjectCode.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      const matchesDept = deptFilter === "All" || String(s.departmentId) === deptFilter;
      return matchesQuery && matchesDept;
    });
  }, [subjects.data, search, deptFilter]);

  const total = subjects.data?.length ?? 0;
  const resultBadge = filteredRows.length === total ? `${total} courses` : `${filteredRows.length} of ${total}`;
  const viewingSubject = viewingId != null ? (subjects.data ?? []).find((s) => s.id === viewingId) ?? null : null;
  const deletingSubject = confirmingDeleteId != null ? (subjects.data ?? []).find((s) => s.id === confirmingDeleteId) ?? null : null;
  const isPending = createSubject.isPending || updateSubject.isPending;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 22 }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, letterSpacing: "-.3px" }}>
          {editingId != null ? "Edit Course" : "Create Course"}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Short Name</label>
            <input value={form.shortCode} onChange={(e) => update("shortCode", e.target.value)} placeholder="e.g. CO1" style={fieldInputStyle(!!errors.shortCode)} />
            {errors.shortCode && <p style={fieldErrorStyle}>{errors.shortCode}</p>}
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Course code</label>
            <input value={form.code} onChange={(e) => update("code", e.target.value)} placeholder="e.g. AD3491" style={fieldInputStyle(!!errors.code)} />
            {errors.code && <p style={fieldErrorStyle}>{errors.code}</p>}
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Subject name</label>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Fundamentals of Data Science" style={fieldInputStyle(!!errors.name)} />
            {errors.name && <p style={fieldErrorStyle}>{errors.name}</p>}
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Credits</label>
            <input type="number" min={1} max={10} value={form.credits} onChange={(e) => update("credits", e.target.value)} placeholder="1 – 10" style={fieldInputStyle(!!errors.credits)} />
            {errors.credits && <p style={fieldErrorStyle}>{errors.credits}</p>}
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Type</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value as SubjectCourseType)} style={fieldInputStyle(!!errors.type)}>
              <option value="">Select type</option>
              {COURSE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SUBJECT_COURSE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            {errors.type && <p style={fieldErrorStyle}>{errors.type}</p>}
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Category</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value as SubjectCategory)} style={fieldInputStyle(!!errors.category)}>
              <option value="">Select</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {SUBJECT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            {errors.category && <p style={fieldErrorStyle}>{errors.category}</p>}
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>Department</label>
            <select value={form.departmentId} onChange={(e) => update("departmentId", e.target.value)} style={fieldInputStyle(!!errors.departmentId)}>
              <option value="">Select department</option>
              {(departments.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code}
                </option>
              ))}
            </select>
            {errors.departmentId && <p style={fieldErrorStyle}>{errors.departmentId}</p>}
          </div>
          <div style={fieldRowStyle}>
            <label style={fieldLabelStyle}>No. of hours</label>
            <input type="number" min={1} max={120} value={form.hours} onChange={(e) => update("hours", e.target.value)} placeholder="e.g. 45" style={fieldInputStyle(!!errors.hours)} />
            {errors.hours && <p style={fieldErrorStyle}>{errors.hours}</p>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 9, marginTop: 8 }}>
          <button type="button" style={pageButtonStyle(true)} onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : editingId != null ? "Save changes" : "Submit"}
          </button>
          {editingId != null && (
            <button type="button" style={pageButtonStyle(false)} onClick={handleCancelEdit} disabled={isPending}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {total === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, padding: 48, textAlign: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px 0" }}>No Courses Created Yet</h3>
          <p style={{ fontSize: 13, color: "#77808f", margin: 0 }}>Courses you create will appear here as a searchable register.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eef1f6", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, letterSpacing: "-.2px" }}>Created Courses</h2>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "#eaf0fe", color: "#1f4fd8" }}>{resultBadge}</span>
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course code or subject name"
                style={{ height: 34, minWidth: 260, border: "1px solid #dfe4ec", borderRadius: 8, padding: "0 12px", fontSize: 12.5, outline: "none" }}
              />
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={placementSelectStyle}>
                <option value="All">All departments</option>
                {(departments.data ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredRows.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px 0" }}>No matching courses</h3>
              <p style={{ fontSize: 12.5, color: "#77808f", margin: 0 }}>Adjust the search text or department filter.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 2fr 0.7fr 1.3fr 0.8fr 1fr 0.8fr 1.6fr", gap: 12, padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #eaeef4", minWidth: 980 }}>
                {["SHORT NAME", "COURSE CODE", "SUBJECT NAME", "CREDITS", "TYPE", "CAT", "DEPARTMENT", "HOURS", "ACTIONS"].map((h) => (
                  <span key={h} style={{ fontSize: 10.5, fontWeight: 650, color: "#77808f", letterSpacing: ".3px" }}>
                    {h}
                  </span>
                ))}
              </div>
              {filteredRows.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.2fr 2fr 0.7fr 1.3fr 0.8fr 1fr 0.8fr 1.6fr",
                    gap: 12,
                    alignItems: "center",
                    padding: "11px 20px",
                    borderBottom: "1px solid #f3f5f9",
                    fontSize: 12.5,
                    minWidth: 980,
                    background: i % 2 ? "#f5f9ff" : "#fff",
                  }}
                >
                  <span>{s.shortCode ?? "—"}</span>
                  <span style={{ fontWeight: 700, color: "#1f4fd8" }}>{s.subjectCode}</span>
                  <span>{s.name}</span>
                  <span>{s.credits ?? "—"}</span>
                  <span style={{ color: "#77808f" }}>{s.courseType ? SUBJECT_COURSE_TYPE_LABELS[s.courseType] : "—"}</span>
                  <span style={{ color: "#77808f" }}>{s.category ? SUBJECT_CATEGORY_LABELS[s.category] : "—"}</span>
                  <span>{s.departmentId != null ? (deptById.get(s.departmentId)?.code ?? "—") : "—"}</span>
                  <span>{s.hours ?? "—"}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" onClick={() => setViewingId(s.id)} style={{ height: 28, borderRadius: 6, padding: "0 9px", fontSize: 11.5, fontWeight: 600, border: "1px solid #dfe4ec", background: "#fff", color: "#2c3542", cursor: "pointer" }}>
                      View
                    </button>
                    <button type="button" onClick={() => handleEdit(s)} style={{ height: 28, borderRadius: 6, padding: "0 9px", fontSize: 11.5, fontWeight: 600, border: "1px solid #dfe4ec", background: "#fff", color: "#2c3542", cursor: "pointer" }}>
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === s.id}
                      onClick={() => setConfirmingDeleteId(s.id)}
                      style={{ height: 28, borderRadius: 6, padding: "0 9px", fontSize: 11.5, fontWeight: 600, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", cursor: deletingId === s.id ? "not-allowed" : "pointer" }}
                    >
                      {deletingId === s.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={viewingSubject != null} onClose={() => setViewingId(null)} title="Course details" widthClassName="max-w-md">
        {viewingSubject && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Short name", viewingSubject.shortCode ?? "—"],
              ["Category", viewingSubject.category ? SUBJECT_CATEGORY_LABELS[viewingSubject.category] : "—"],
              ["Course code", viewingSubject.subjectCode],
              ["Subject name", viewingSubject.name],
              ["Credits", String(viewingSubject.credits ?? "—")],
              ["Type", viewingSubject.courseType ? SUBJECT_COURSE_TYPE_LABELS[viewingSubject.courseType] : "—"],
              ["Department", viewingSubject.departmentId != null ? (deptById.get(viewingSubject.departmentId)?.code ?? "—") : "—"],
              ["No. of hours", String(viewingSubject.hours ?? "—")],
              ["Added on", formatAdded(viewingSubject.createdAt)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f1f4f8", paddingBottom: 8 }}>
                <span style={{ color: "#77808f" }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmingDeleteId != null}
        title="Delete this course?"
        message={deletingSubject ? `${deletingSubject.subjectCode} · ${deletingSubject.name} will be removed from the curriculum register. This cannot be undone.` : ""}
        confirmLabel="Delete course"
        tone="danger"
        isPending={deletingId != null}
        onConfirm={() => confirmingDeleteId != null && handleDelete(confirmingDeleteId)}
        onClose={() => setConfirmingDeleteId(null)}
      />
    </div>
  );
}
