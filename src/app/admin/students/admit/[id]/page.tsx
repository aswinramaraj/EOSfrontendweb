"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardIcon,
  FileTextIcon,
  LockIcon,
  PersonIcon,
  SendIcon,
  UploadIcon,
  UserCheckIcon,
} from "@/shared/components/icons";
import { useCourses } from "@/modules/courses/hooks/useCourses";
import { useQuotas } from "@/modules/quotas/hooks/useQuotas";
import { useBatches } from "@/modules/batches/hooks/useBatches";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import {
  useTransportStages,
  useHostelRoomTypes,
  useCertificateTypes,
  usePerfectEntry,
  useProfileDraft,
  useSaveProfileDraft,
  useSoaApplication,
  useUpdateSoaStatus,
  useUploadApplicationDocument,
  useUploadApplicationPhoto,
} from "@/modules/admissions/hooks/useAdmissions";
import { WIZARD_CATEGORIES, type Category } from "@/modules/admissions/config/wizardSections";
import type { PerfectEntryResult } from "@/modules/admissions/types";
import {
  CATEGORY_ICONS,
  CategoryForm,
  CategoryHead,
  DisabledStub,
  RepeatPanel,
  buildPerfectEntryPayload,
  categoryStats,
  friendlyError,
  liveFields,
  validateField,
  vkey,
  type CategoryStats,
  type LookupOptions,
} from "@/modules/admissions/wizard/shared";

const PROFILE_CATEGORIES = WIZARD_CATEGORIES.filter((c) => c.id !== "application");
const DATA_CATEGORIES = PROFILE_CATEGORIES.filter((c) => !c.review);
const REVIEW_CATEGORY = PROFILE_CATEGORIES.find((c) => c.review)!;

export default function CompleteProfilePage() {
  const params = useParams<{ id: string }>();
  const applicationId = Number(params.id);
  const { show } = useToast();
  const { data: application, isLoading, isError } = useSoaApplication(applicationId);
  const updateStatus = useUpdateSoaStatus();
  // Set the instant perfect-entry succeeds, checked before application.students
  // below — see ProfileWizard's onComplete prop docblock for why this can't
  // just be a local state further down the tree.
  const [justCompleted, setJustCompleted] = useState<PerfectEntryResult | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-slate-500">Loading application…</div>;
  }

  if (isError || !application) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          This application doesn&apos;t exist, or was deleted.
        </div>
        <Link href="/admin/students/admit" className="mt-4 inline-block">
          <Button variant="secondary">
            <ArrowLeftIcon className="h-4 w-4" /> Back to the pipeline
          </Button>
        </Link>
      </div>
    );
  }

  const crumb = (
    <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
      <Link href="/admin" className="hover:text-slate-700">Home</Link>
      <ChevronRightIcon className="h-3.5 w-3.5" />
      <Link href="/admin/students" className="hover:text-slate-700">Students</Link>
      <ChevronRightIcon className="h-3.5 w-3.5" />
      <Link href="/admin/students/admit" className="hover:text-slate-700">Admission applications</Link>
      <ChevronRightIcon className="h-3.5 w-3.5" />
      <span className="font-medium text-slate-700">
        {application.first_name} {application.last_name ?? ""}
      </span>
    </nav>
  );

  async function copyPassword() {
    if (!justCompleted) return;
    try {
      await navigator.clipboard.writeText(justCompleted.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch {
      show("Couldn't copy — select and copy the password manually.", "error");
    }
  }

  // Checked BEFORE application.students below, and takes priority when both
  // are true — see ProfileWizard's onComplete prop docblock for why: without
  // this, the background refetch that invalidateQueries triggers would swap
  // in the plain "already completed" branch (no password) the instant it
  // resolves, possibly before the admin has read or copied it.
  if (justCompleted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        {crumb}
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-2 text-green-800">
            <CheckIcon className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Admission confirmed</h1>
          </div>
          <p className="mt-2 text-sm text-green-800">
            Student ID <strong>{justCompleted.student_id_no}</strong> was created (internal id #{justCompleted.id}).
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5">
            <LockIcon className="h-4 w-4 shrink-0 text-slate-500" />
            <code className="flex-1 select-all break-all font-mono text-sm text-slate-800">
              {justCompleted.password}
            </code>
            <button
              type="button"
              onClick={copyPassword}
              title="Copy to clipboard"
              className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            >
              {passwordCopied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
            </button>
          </div>

          <div
            className={`mt-3 rounded-md border p-3 text-sm ${
              justCompleted.sms.sent
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <div className="flex gap-2">
              {justCompleted.sms.sent ? (
                <SendIcon className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p>
                {justCompleted.sms.sent
                  ? "This password was texted to the student's phone."
                  : `${justCompleted.sms.note} Copy the password above and hand it to the student directly. If they lose it later, use Reset Password from their profile.`}
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Link href={`/admin/students/${justCompleted.id}`}>
              <Button variant="primary">View student profile</Button>
            </Link>
            <Link href="/admin/students/admit">
              <Button variant="secondary">Back to the pipeline</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (application.students) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        {crumb}
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-2 text-green-800">
            <CheckIcon className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Profile already completed</h1>
          </div>
          <p className="mt-2 text-sm text-green-800">
            Student ID <strong>{application.students.student_id_no}</strong> was created from this application.
          </p>
          <div className="mt-5 flex gap-2">
            <Link href={`/admin/students/${application.students.id}`}>
              <Button variant="primary">View student profile</Button>
            </Link>
            <Link href="/admin/students/admit">
              <Button variant="secondary">Back to the pipeline</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (application.status !== "admission_confirmed") {
    const nextStatus = application.status === "applied" ? "fees_paid" : "admission_confirmed";
    const nextLabel = application.status === "applied" ? "Mark fees paid" : "Confirm admission";
    const canAdvance = application.status === "applied" || application.status === "fees_paid";

    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        {crumb}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangleIcon className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Profile completion isn&apos;t open yet</h1>
          </div>
          <p className="mt-2 text-sm text-amber-800">
            This application is currently <strong>{application.status.replace("_", " ")}</strong>. The rest of the
            student&apos;s profile (identity, programme, personal details, and everything else) can only be filled in
            once the application reaches <strong>admission confirmed</strong>.
          </p>
          <div className="mt-5 flex gap-2">
            {canAdvance && (
              <Button
                variant="primary"
                isPending={updateStatus.isPending}
                onClick={async () => {
                  try {
                    await updateStatus.mutateAsync({ id: application.id, status: nextStatus });
                    show(`Moved to ${nextStatus.replace("_", " ")}.`, "success");
                  } catch (err) {
                    show(friendlyError(err), "error");
                  }
                }}
              >
                {nextLabel}
              </Button>
            )}
            <Link href="/admin/students/admit">
              <Button variant="secondary">Back to the pipeline</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProfileWizard applicationId={applicationId} crumb={crumb} onComplete={setJustCompleted} />;
}

function ProfileWizard({
  applicationId,
  crumb,
  onComplete,
}: {
  applicationId: number;
  crumb: React.ReactNode;
  /**
   * Reports success up to CompleteProfilePage instead of this component
   * showing its own success screen — usePerfectEntry's onSuccess
   * invalidates the soa-applications detail query, and that refetch
   * resolving would otherwise unmount this whole component (the parent's
   * `application.students` check would flip and swap in its own "already
   * completed" branch) mid-flash, taking the one-time password reveal with
   * it before the admin has a chance to read/copy it.
   */
  onComplete: (result: PerfectEntryResult) => void;
}) {
  const { show } = useToast();
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [marks, setMarks] = useState<string[]>([""]);

  const { data: departments } = useDepartments();
  const { data: courses } = useCourses();
  const { data: quotas } = useQuotas();
  const { data: batches } = useBatches();
  const { data: transportStages } = useTransportStages(true);
  const { data: hostelRoomTypes } = useHostelRoomTypes(true);
  const { data: certificateTypes } = useCertificateTypes(true);
  const certificateTypeIds = useMemo(() => certificateTypes?.map((t) => t.id) ?? [], [certificateTypes]);

  const perfectEntry = usePerfectEntry();
  const isSubmitting = perfectEntry.isPending;

  // Draft resume: loaded once per mount, then applied to local state exactly
  // once (draftAppliedRef) so it can never clobber the admin's own edits on
  // a later refetch — this is a one-shot "restore where I left off", not a
  // live sync.
  const { data: draft, isLoading: draftLoading } = useProfileDraft(applicationId, true);
  const saveDraft = useSaveProfileDraft();
  const draftAppliedRef = useRef(false);

  // One-shot hydration of local editable state from an async-loaded resource
  // (draftAppliedRef guarantees this body runs at most once per mount) — not
  // the ongoing React/external-system sync the set-state-in-effect rule is
  // meant to catch, so it's deliberately silenced for this whole effect body.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (draftAppliedRef.current || draftLoading) return;
    draftAppliedRef.current = true;
    if (!draft) return;
    setValues(draft.values);
    setMarks(draft.marks.length ? draft.marks : [""]);
    setSaved(new Set(draft.saved_categories));
    const firstUnsaved = DATA_CATEGORIES.findIndex((c) => !draft.saved_categories.includes(c.id));
    setCurrent(firstUnsaved === -1 ? DATA_CATEGORIES.length : firstUnsaved);
    show("Resumed from where you left off.", "success");
  }, [draft, draftLoading, show]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function persistDraft(nextSaved: Set<string>, nextValues: Record<string, string>, nextMarks: string[]) {
    saveDraft.mutate({
      id: applicationId,
      input: { values: nextValues, marks: nextMarks, saved_categories: Array.from(nextSaved) },
    });
  }

  const lookupOptions: LookupOptions = useMemo(() => {
    const selectedDept = values[vkey("placement", "department")];
    const filteredCourses = selectedDept ? (courses ?? []).filter((c) => String(c.department_id) === selectedDept) : courses ?? [];
    return {
      department: (departments ?? []).map((d) => ({ value: String(d.id), label: d.name })),
      course: filteredCourses.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` })),
      quota: (quotas ?? []).map((q) => ({ value: String(q.id), label: q.name })),
      batch: (batches ?? []).map((b) => ({ value: String(b.id), label: b.name })),
      transportStage: (transportStages ?? []).map((t) => ({ value: String(t.id), label: t.stage_name })),
      hostelRoomType: (hostelRoomTypes ?? []).map((h) => ({ value: String(h.id), label: h.name })),
    };
  }, [values, departments, courses, quotas, batches, transportStages, hostelRoomTypes]);

  const setValue = (categoryId: string, fieldKey: string, val: string, clears: string[] = []) => {
    setValues((v) => {
      const next = { ...v, [vkey(categoryId, fieldKey)]: val };
      clears.forEach((k) => delete next[vkey(categoryId, k)]);
      return next;
    });
    setErrors((e) => {
      const k = vkey(categoryId, fieldKey);
      if (!e[k]) return e;
      const next = { ...e };
      delete next[k];
      return next;
    });
  };

  const category = current < DATA_CATEGORIES.length ? DATA_CATEGORIES[current] : REVIEW_CATEGORY;
  const isReview = category.review === true;

  function goTo(index: number) {
    setCurrent(Math.max(0, Math.min(PROFILE_CATEGORIES.length - 1, index)));
  }

  function validateCategory(cat: Category): Record<string, string> {
    const out: Record<string, string> = {};
    liveFields(cat, values).forEach((f) => {
      const raw = values[vkey(cat.id, f.key)] ?? f.defaultValue ?? "";
      const msg = validateField(f, raw);
      if (msg) out[vkey(cat.id, f.key)] = msg;
    });
    return out;
  }

  function saveCategoryAndAdvance() {
    const catErrors = validateCategory(category);
    if (Object.keys(catErrors).length) {
      setErrors((e) => ({ ...e, ...catErrors }));
      show(`${Object.keys(catErrors).length} field(s) need attention.`, "error");
      return;
    }
    const nextSaved = new Set(saved).add(category.id);
    setSaved(nextSaved);
    persistDraft(nextSaved, values, marks);
    goTo(current + 1);
  }

  // Skipping still leaves the category unsaved (matches the existing "not
  // saved" semantics in the Rail/Review), but whatever was typed into it —
  // and every other category's progress so far — is still worth keeping if
  // the admin closes the tab right after.
  function skipCategory() {
    persistDraft(saved, values, marks);
    goTo(current + 1);
  }

  function allValidationErrors(): { categoryId: string; errors: Record<string, string> }[] {
    return DATA_CATEGORIES.filter((c) => !c.repeat && !c.disabledStub).map((c) => ({
      categoryId: c.id,
      errors: validateCategory(c),
    }));
  }

  async function handleConfirm() {
    const perCategory = allValidationErrors();
    const firstBad = perCategory.find((c) => Object.keys(c.errors).length > 0);
    if (firstBad) {
      setErrors((e) => ({ ...e, ...firstBad.errors }));
      const idx = DATA_CATEGORIES.findIndex((c) => c.id === firstBad.categoryId);
      goTo(idx);
      show("Some required fields still need attention.", "error");
      return;
    }

    try {
      const student = await perfectEntry.mutateAsync({
        id: applicationId,
        input: buildPerfectEntryPayload(values, marks, certificateTypeIds),
      });
      // Handled by the parent (CompleteProfilePage), not local state here —
      // see onComplete's own docblock for why.
      onComplete(student);
      show("Profile completed.", "success");
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  if (draftLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        {crumb}
        <div className="text-sm text-slate-500">Checking for saved progress…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {crumb}

      <PageHeader
        title="Complete the profile"
        description="Thirteen categories, one confirmation. Fields the backend doesn't yet write are shown disabled with an honest note instead of being hidden."
        actions={
          <Link href="/admin/students/admit">
            <Button variant="secondary">
              <ArrowLeftIcon className="h-4 w-4" /> Back to the pipeline
            </Button>
          </Link>
        }
      />

      <ProgressBar current={current} saved={saved} isSavingDraft={saveDraft.isPending} />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Rail
          current={current}
          values={values}
          marks={marks}
          saved={saved}
          certificateTypeIds={certificateTypeIds}
          onSelect={goTo}
        />

        <div className="rounded-xl border border-slate-200 bg-white">
          <CategoryHead category={category} />
          <div className="border-t border-slate-100 p-5">
            {category.id === "identity" && (
              <PhotoPicker
                applicationId={applicationId}
                photoUrl={values[vkey("identity", "photo_url")]}
                onUploaded={(url) => setValue("identity", "photo_url", url)}
              />
            )}
            {isReview ? (
              <ReviewPanel
                values={values}
                marks={marks}
                saved={saved}
                onJump={goTo}
                onConfirm={handleConfirm}
                isSubmitting={isSubmitting}
              />
            ) : category.disabledStub ? (
              <DisabledStub reason={category.disabledStub} />
            ) : category.repeat ? (
              <RepeatPanel spec={category.repeat} marks={marks} setMarks={setMarks} />
            ) : category.checklist ? (
              <CertificateChecklistPanel
                applicationId={applicationId}
                category={category}
                values={values}
                setValue={setValue}
              />
            ) : (
              <CategoryForm
                category={category}
                values={values}
                errors={errors}
                lookupOptions={lookupOptions}
                setValue={setValue}
              />
            )}
          </div>
          {!isReview && (
            <FooterBar
              current={current}
              category={category}
              stats={categoryStats(category, values, marks, certificateTypeIds)}
              saved={saved.has(category.id)}
              onBack={() => goTo(current - 1)}
              onSkip={skipCategory}
              onSave={saveCategoryAndAdvance}
              isLast={current === PROFILE_CATEGORIES.length - 2}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  current,
  saved,
  isSavingDraft,
}: {
  current: number;
  saved: Set<string>;
  isSavingDraft: boolean;
}) {
  const pct = Math.round((saved.size / DATA_CATEGORIES.length) * 100);
  const cat = PROFILE_CATEGORIES[current];
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-slate-500">
              {current + 1} / {PROFILE_CATEGORIES.length}
            </span>
            <span className="text-sm font-semibold text-slate-800">{cat.label}</span>
            <span className="text-xs text-slate-400">{cat.table}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full max-w-xs rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {isSavingDraft && <span>Saving progress…</span>}
          <span>
            <span className="font-semibold text-slate-700">{saved.size}</span> / {DATA_CATEGORIES.length} categories saved
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Not part of the reference's 14 categories — the reference never handled
 * admission photos at all (see uiskill/todo research). Rendered as an extra
 * widget above the "Identity & login" category's own field grid rather than
 * a FieldSpec, since a file picker doesn't fit the text/select/date field
 * model the rest of the wizard is built on. Uploads immediately (there's no
 * students row to attach photo_url to yet — see the endpoint's own
 * docblock); the returned URL rides in the wizard's own values/draft state
 * exactly like every other field, and goes out in the final perfect-entry
 * payload.
 */
function PhotoPicker({
  applicationId,
  photoUrl,
  onUploaded,
}: {
  applicationId: number;
  photoUrl: string | undefined;
  onUploaded: (url: string) => void;
}) {
  const { show } = useToast();
  const uploadPhoto = useUploadApplicationPhoto();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be re-picked after a failed upload
    if (!file) return;
    try {
      const { url } = await uploadPhoto.mutateAsync({ id: applicationId, file });
      onUploaded(url);
      show("Photo uploaded.", "success");
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  return (
    <div className="mb-6 flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- a Supabase Storage URL, not a local/optimizable asset
          <img src={photoUrl} alt="Candidate" className="h-full w-full object-cover" />
        ) : (
          <PersonIcon className="h-7 w-7 text-slate-300" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-700">Photograph</p>
        <p className="text-xs text-slate-400">Optional — JPG, PNG or WebP, up to 5MB.</p>
      </div>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFile} />
      <Button
        variant="secondary"
        size="sm"
        isPending={uploadPhoto.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon className="h-3.5 w-3.5" /> {photoUrl ? "Replace" : "Upload"}
      </Button>
    </div>
  );
}

/**
 * Renders the "Document checklist" category (student_certificates) as a
 * real tick/attach/preview list backed by GET /certificate-types, matching
 * the reference form's own three-separate-facts model (collected / scanned
 * / verified — only the first two are settable here; verification happens
 * later, on the student's own profile). Every upload goes to the private
 * student_documents bucket immediately; is_available/file_url ride in the
 * wizard's values/draft state as `${typeId}_available` / `${typeId}_file_url`
 * and are folded into the perfect-entry payload's `certificates` array.
 */
function CertificateChecklistPanel({
  applicationId,
  category,
  values,
  setValue,
}: {
  applicationId: number;
  category: Category;
  values: Record<string, string>;
  setValue: (categoryId: string, fieldKey: string, val: string) => void;
}) {
  const { show } = useToast();
  const { data: certificateTypes, isLoading } = useCertificateTypes(true);
  const uploadDocument = useUploadApplicationDocument();
  // Signed preview links are only good for an hour and are never persisted
  // to the draft — after a resume, an already-attached document shows
  // "Attached" (no dead link) until re-uploaded or viewed from the
  // student's own Certificates panel post-admission.
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});

  if (isLoading) return <p className="text-sm text-slate-400">Loading document types…</p>;
  if (!certificateTypes?.length) {
    return <p className="text-sm text-slate-400">No certificate types are configured yet.</p>;
  }

  async function handleFile(typeId: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await uploadDocument.mutateAsync({ id: applicationId, certificateTypeId: typeId, file });
      setValue(category.id, `${typeId}_file_url`, result.file_url);
      setValue(category.id, `${typeId}_available`, "true");
      setPreviewUrls((p) => ({ ...p, [typeId]: result.preview_url }));
      show("Attached.", "success");
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  const collected = certificateTypes.filter((t) => values[vkey(category.id, `${t.id}_available`)] === "true").length;

  return (
    <div className="flex flex-col gap-4">
      <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        {collected} of {certificateTypes.length} collected
      </span>

      <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200">
        {certificateTypes.map((type) => {
          const isAvailable = values[vkey(category.id, `${type.id}_available`)] === "true";
          const fileUrl = values[vkey(category.id, `${type.id}_file_url`)];
          const previewUrl = previewUrls[type.id];
          return (
            <div key={type.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <label className="flex flex-1 items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setValue(category.id, `${type.id}_available`, String(e.target.checked))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                />
                {type.name}
              </label>
              {fileUrl &&
                (previewUrl ? (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:underline"
                  >
                    <FileTextIcon className="h-3.5 w-3.5" /> View
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <FileTextIcon className="h-3.5 w-3.5" /> Attached
                  </span>
                ))}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => handleFile(type.id, e)}
                />
                <span className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  <UploadIcon className="h-3.5 w-3.5" /> {fileUrl ? "Replace" : "Attach"}
                </span>
              </label>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">
        Ticking records that the document was collected. Attaching a scan keeps a copy — PDF, JPG, PNG or WebP, up to
        5MB. Verifying a scan against the original happens later, from the student&apos;s own profile.
      </p>
    </div>
  );
}

function Rail({
  current,
  values,
  marks,
  saved,
  certificateTypeIds,
  onSelect,
}: {
  current: number;
  values: Record<string, string>;
  marks: string[];
  saved: Set<string>;
  certificateTypeIds: number[];
  onSelect: (i: number) => void;
}) {
  return (
    <nav className="h-fit rounded-xl border border-slate-200 bg-white p-2">
      {PROFILE_CATEGORIES.map((cat, i) => {
        const Icon = CATEGORY_ICONS[cat.id];
        const isSaved = saved.has(cat.id);
        const isCurrent = i === current;
        const stats = categoryStats(cat, values, marks, certificateTypeIds);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(i)}
            className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
              isCurrent ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isSaved ? "bg-green-100 text-green-700" : isCurrent ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {isSaved ? <CheckIcon className="h-3.5 w-3.5" /> : cat.review ? <Icon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{cat.label}</span>
              <span className="block truncate text-xs text-slate-400">
                {cat.review ? "final step" : isSaved ? "saved" : stats.total ? `${stats.filled} of ${stats.total} filled` : "optional"}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function FooterBar({
  current,
  category,
  stats,
  saved,
  onBack,
  onSkip,
  onSave,
  isLast,
}: {
  current: number;
  category: Category;
  stats: CategoryStats;
  saved: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSave: () => void;
  isLast: boolean;
}) {
  const isFirst = current === 0;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
      <span className="text-xs text-slate-500">
        {saved
          ? "Saved"
          : stats.missingRequired.length
          ? `${stats.missingRequired.length} required field(s) to fill`
          : "Nothing required is missing"}
      </span>
      <div className="flex gap-2">
        {!isFirst && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
        {!category.disabledStub && (
          <Button variant="ghost" onClick={onSkip} title="Leaves this category unsaved — the review step will list it.">
            Skip for now
          </Button>
        )}
        <Button variant="primary" onClick={onSave}>
          {isLast ? "Save" : saved ? "Save changes & continue" : "Save & continue"}
        </Button>
      </div>
    </div>
  );
}

function ReviewPanel({
  values,
  marks,
  saved,
  onJump,
  onConfirm,
  isSubmitting,
}: {
  values: Record<string, string>;
  marks: string[];
  saved: Set<string>;
  onJump: (i: number) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  const outstanding: string[] = [];
  DATA_CATEGORIES.forEach((cat) => {
    if (cat.repeat || cat.disabledStub) return;
    categoryStats(cat, values, marks).missingRequired.forEach((f) => outstanding.push(`${cat.label} — ${f.label}`));
  });
  const unsaved = DATA_CATEGORIES.filter((c) => !c.disabledStub && !saved.has(c.id));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DATA_CATEGORIES.map((cat, i) => {
          const isSaved = saved.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onJump(i)}
              className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm ${
                isSaved ? "border-green-200 bg-green-50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isSaved ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {isSaved ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-slate-800">{cat.label}</span>
                <span className="block text-xs text-slate-400">{isSaved ? "saved" : "not saved"}</span>
              </span>
            </button>
          );
        })}
      </div>

      {outstanding.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertTriangleIcon className="h-4 w-4" /> Required fields still empty ({outstanding.length})
          </div>
          <ul className="mt-2 list-inside list-disc text-sm text-red-700">
            {outstanding.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="font-semibold text-slate-800">Complete the profile</div>
        <p className="mt-1 text-sm text-slate-500">
          Writes the student record from this already-confirmed application. Categories shown disabled above
          (Document checklist, Online profiles, and any field marked &ldquo;Not available&rdquo;) are not written by
          the current backend.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Button variant="primary" size="md" isPending={isSubmitting} onClick={onConfirm} disabled={outstanding.length > 0}>
            <UserCheckIcon className="h-4 w-4" /> Complete profile
          </Button>
        </div>
        {(outstanding.length > 0 || unsaved.length > 0) && (
          <p className="mt-2 text-xs text-slate-500">
            {unsaved.length > 0 && `${unsaved.length} categor${unsaved.length === 1 ? "y" : "ies"} not saved yet. `}
            {outstanding.length > 0 && `${outstanding.length} required field(s) empty.`}
          </p>
        )}
      </div>
    </div>
  );
}
