"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Modal } from "@/shared/components/ui/Modal";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import {
  AlertTriangleIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UserCheckIcon,
} from "@/shared/components/icons";
import {
  useCreateSoaApplication,
  useDeleteSoaApplication,
  useSoaApplications,
  useUpdateSoaApplication,
  useUpdateSoaStatus,
} from "@/modules/admissions/hooks/useAdmissions";
import { friendlyError } from "@/modules/admissions/wizard/shared";
import { WIZARD_CATEGORIES } from "@/modules/admissions/config/wizardSections";
import type {
  CreateSoaApplicationInput,
  SoaApplicationDetail,
  SoaStatus,
} from "@/modules/admissions/types";

// The community column (soa_applications/students) is free-text in the DB, but
// this is the one fixed list used elsewhere in the reference UI (student-edit.js).
const COMMUNITY_OPTIONS = ["OC", "BC", "MBC", "SC", "ST"];

// Same filter the Complete Profile wizard uses to count its data categories
// (excludes the synthetic "application" and final review steps), so the
// dashboard's "N of X saved" progress always matches the wizard exactly.
const DRAFT_CATEGORY_COUNT = WIZARD_CATEGORIES.filter((c) => c.id !== "application" && !c.review).length;

// "Draft" isn't a real soa_status_enum value — it's a derived view (admission
// confirmed, no student row yet, but a Complete Profile draft in progress).
// Handled as a distinct tab state rather than a SoaStatus.
const DRAFT_TAB = "draft" as const;

const STATUS_TABS: Array<{ value: SoaStatus | "all" | typeof DRAFT_TAB; label: string }> = [
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "fees_paid", label: "Fees paid" },
  { value: "admission_confirmed", label: "Admission confirmed" },
  { value: DRAFT_TAB, label: "Draft" },
  { value: "cancelled", label: "Cancelled / declined" },
];

const STATUS_TONE: Record<SoaStatus, PillTone> = {
  applied: "blue",
  fees_paid: "amber",
  admission_confirmed: "green",
  cancelled: "red",
};

const STATUS_LABEL: Record<SoaStatus, string> = {
  applied: "Applied",
  fees_paid: "Fees paid",
  admission_confirmed: "Admission confirmed",
  cancelled: "Cancelled",
};

interface ApplicationFormState {
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  parent_contact: string;
  student_contact: string;
  student_whatsapp: string;
  student_email: string;
  cutoff_physics: string;
  cutoff_chemistry: string;
  cutoff_maths: string;
  community: string;
}

const EMPTY_FORM: ApplicationFormState = {
  first_name: "",
  last_name: "",
  father_name: "",
  mother_name: "",
  parent_contact: "",
  student_contact: "",
  student_whatsapp: "",
  student_email: "",
  cutoff_physics: "",
  cutoff_chemistry: "",
  cutoff_maths: "",
  community: "",
};

function toFormState(app: SoaApplicationDetail): ApplicationFormState {
  return {
    first_name: app.first_name,
    last_name: app.last_name ?? "",
    father_name: app.father_name ?? "",
    mother_name: app.mother_name ?? "",
    parent_contact: app.parent_contact ?? "",
    student_contact: app.student_contact ?? "",
    student_whatsapp: app.student_whatsapp ?? "",
    student_email: app.student_email ?? "",
    cutoff_physics: app.cutoff_physics ?? "",
    cutoff_chemistry: app.cutoff_chemistry ?? "",
    cutoff_maths: app.cutoff_maths ?? "",
    community: app.community ?? "",
  };
}

function toPayload(form: ApplicationFormState): CreateSoaApplicationInput {
  const num = (v: string) => (v.trim() ? Number(v) : undefined);
  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim() || undefined,
    father_name: form.father_name.trim() || undefined,
    mother_name: form.mother_name.trim() || undefined,
    parent_contact: form.parent_contact.trim() || undefined,
    student_contact: form.student_contact.trim() || undefined,
    student_whatsapp: form.student_whatsapp.trim() || undefined,
    student_email: form.student_email.trim() || undefined,
    cutoff_physics: num(form.cutoff_physics),
    cutoff_chemistry: num(form.cutoff_chemistry),
    cutoff_maths: num(form.cutoff_maths),
    community: form.community.trim() || undefined,
  };
}

function ApplicationFormFields({
  form,
  onChange,
}: {
  form: ApplicationFormState;
  onChange: (patch: Partial<ApplicationFormState>) => void;
}) {
  const field = (key: keyof ApplicationFormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value } as never),
  });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-slate-700">
          First name<span className="ml-0.5 text-red-600">*</span>
        </label>
        <div className="mt-1.5">
          <TextInput {...field("first_name")} placeholder="Aarav" maxLength={100} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Last name</label>
        <div className="mt-1.5">
          <TextInput {...field("last_name")} placeholder="Krishnan" maxLength={100} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Father&apos;s name</label>
        <div className="mt-1.5">
          <TextInput {...field("father_name")} maxLength={150} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Mother&apos;s name</label>
        <div className="mt-1.5">
          <TextInput {...field("mother_name")} maxLength={150} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Candidate&apos;s mobile</label>
        <div className="mt-1.5">
          <TextInput {...field("student_contact")} type="tel" maxLength={10} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">WhatsApp number</label>
        <div className="mt-1.5">
          <TextInput {...field("student_whatsapp")} type="tel" maxLength={10} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Parent&apos;s mobile</label>
        <div className="mt-1.5">
          <TextInput {...field("parent_contact")} type="tel" maxLength={10} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Email on the application</label>
        <div className="mt-1.5">
          <TextInput {...field("student_email")} type="email" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Community</label>
        <div className="mt-1.5">
          <SelectInput value={form.community} onChange={(e) => onChange({ community: e.target.value })}>
            <option value="">Select community</option>
            {COMMUNITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectInput>
        </div>
      </div>
      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-semibold text-slate-500">Board cut-off marks (0–100)</p>
        <div className="grid grid-cols-3 gap-3">
          <TextInput {...field("cutoff_maths")} placeholder="Maths" />
          <TextInput {...field("cutoff_physics")} placeholder="Physics" />
          <TextInput {...field("cutoff_chemistry")} placeholder="Chemistry" />
        </div>
      </div>
    </div>
  );
}

export default function AdmitStudentDashboardPage() {
  const { show } = useToast();
  const [status, setStatus] = useState<SoaStatus | "all" | typeof DRAFT_TAB>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ApplicationFormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<SoaApplicationDetail | null>(null);
  const [editForm, setEditForm] = useState<ApplicationFormState>(EMPTY_FORM);
  const [declining, setDeclining] = useState<SoaApplicationDetail | null>(null);
  const [deleting, setDeleting] = useState<SoaApplicationDetail | null>(null);

  const params = useMemo(
    () => ({
      status: status === "all" || status === DRAFT_TAB ? undefined : status,
      has_draft: status === DRAFT_TAB ? true : undefined,
      q: debouncedSearch || undefined,
      page,
      limit: 20,
    }),
    [status, debouncedSearch, page],
  );
  const { data, isLoading, isError } = useSoaApplications(params);

  const createApplication = useCreateSoaApplication();
  const updateApplication = useUpdateSoaApplication();
  const deleteApplication = useDeleteSoaApplication();
  const updateStatus = useUpdateSoaStatus();

  async function handleCreate() {
    if (!createForm.first_name.trim()) {
      show("First name is required.", "error");
      return;
    }
    try {
      await createApplication.mutateAsync(toPayload(createForm));
      show("Application created.", "success");
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  async function handleUpdate() {
    if (!editing) return;
    if (!editForm.first_name.trim()) {
      show("First name is required.", "error");
      return;
    }
    try {
      await updateApplication.mutateAsync({ id: editing.id, input: toPayload(editForm) });
      show("Application updated.", "success");
      setEditing(null);
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  async function handleAdvance(app: SoaApplicationDetail, next: SoaStatus) {
    try {
      await updateStatus.mutateAsync({ id: app.id, status: next });
      show(`Moved to ${STATUS_LABEL[next]}.`, "success");
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  async function handleDecline() {
    if (!declining) return;
    try {
      await updateStatus.mutateAsync({ id: declining.id, status: "cancelled" });
      show("Application declined.", "success");
      setDeclining(null);
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteApplication.mutateAsync(deleting.id);
      show("Draft deleted.", "success");
      setDeleting(null);
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">Home</Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <Link href="/admin/students" className="hover:text-slate-700">Students</Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-700">Admit a student</span>
      </nav>

      <PageHeader
        title="Admission applications"
        description="Every application from first intake to admission. A profile can only be completed once an application reaches Admission confirmed."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <PlusIcon className="h-4 w-4" /> New application
          </Button>
        }
      />

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                status === tab.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, mobile…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Cut-offs</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Applied</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading applications…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                  Couldn&apos;t load applications. Try again.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No applications match this filter.
                </td>
              </tr>
            )}
            {rows.map((app) => (
              <tr key={app.id} className="align-top hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">
                    {app.first_name} {app.last_name ?? ""}
                  </div>
                  {app.community && <div className="text-xs text-slate-400">{app.community}</div>}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{app.student_contact ?? "—"}</div>
                  {app.student_email && <div className="text-xs text-slate-400">{app.student_email}</div>}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {app.cutoff_maths || app.cutoff_physics || app.cutoff_chemistry
                    ? `M ${app.cutoff_maths ?? "—"} · P ${app.cutoff_physics ?? "—"} · C ${app.cutoff_chemistry ?? "—"}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={STATUS_TONE[app.status]}>{STATUS_LABEL[app.status]}</StatusPill>
                  {app.students && (
                    <div className="mt-1 text-xs text-slate-400">Student {app.students.student_id_no}</div>
                  )}
                  {!app.students && app.admission_profile_drafts && (
                    <div className="mt-1 text-xs text-amber-600">
                      Draft: {app.admission_profile_drafts.saved_categories.length} of {DRAFT_CATEGORY_COUNT} categories saved
                      <span className="text-slate-400">
                        {" · "}
                        {new Date(app.admission_profile_drafts.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {app.status === "admission_confirmed" && app.students && (
                      <Link href={`/admin/students/${app.students.id}`}>
                        <Button variant="secondary" size="sm">View student</Button>
                      </Link>
                    )}
                    {app.status === "admission_confirmed" && !app.students && (
                      <Link href={`/admin/students/admit/${app.id}`}>
                        <Button variant="primary" size="sm">
                          <UserCheckIcon className="h-3.5 w-3.5" />
                          {app.admission_profile_drafts ? "Resume profile" : "Complete profile"}
                        </Button>
                      </Link>
                    )}
                    {(app.status === "applied" || app.status === "fees_paid") && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit application"
                          onClick={() => {
                            setEditing(app);
                            setEditForm(toFormState(app));
                          }}
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </Button>
                        {app.status === "applied" ? (
                          <Button variant="secondary" size="sm" onClick={() => handleAdvance(app, "fees_paid")}>
                            Mark fees paid
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => handleAdvance(app, "admission_confirmed")}>
                            Confirm admission
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Decline" onClick={() => setDeclining(app)}>
                          <AlertTriangleIcon className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </>
                    )}
                    {app.status === "applied" && (
                      <Button variant="ghost" size="sm" title="Delete draft" onClick={() => setDeleting(app)}>
                        <TrashIcon className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {meta.page} of {meta.totalPages} — {meta.total} application{meta.total === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New application" widthClassName="max-w-2xl">
        <ApplicationFormFields form={createForm} onChange={(patch) => setCreateForm((f) => ({ ...f, ...patch }))} />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={createApplication.isPending}>
            Cancel
          </Button>
          <Button variant="primary" isPending={createApplication.isPending} onClick={handleCreate}>
            Create application
          </Button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit application" widthClassName="max-w-2xl">
        <ApplicationFormFields form={editForm} onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))} />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditing(null)} disabled={updateApplication.isPending}>
            Cancel
          </Button>
          <Button variant="primary" isPending={updateApplication.isPending} onClick={handleUpdate}>
            Save changes
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!declining}
        title="Decline this application?"
        message={`This marks ${declining?.first_name ?? "the applicant"}'s application as cancelled. This can't be undone from here.`}
        confirmLabel="Decline"
        tone="danger"
        isPending={updateStatus.isPending}
        onConfirm={handleDecline}
        onClose={() => setDeclining(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete this draft?"
        message={`This permanently removes ${deleting?.first_name ?? "this"}'s draft application. Only drafts with no fees paid can be deleted.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteApplication.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
