"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { UploadIcon, TrashIcon } from "@/shared/components/icons";
import { friendlyError } from "@/modules/admissions/wizard/shared";
import { useCourses } from "@/modules/courses/hooks/useCourses";
import { useBatches } from "@/modules/batches/hooks/useBatches";
import { useQuotas } from "@/modules/quotas/hooks/useQuotas";
import { useClasses } from "@/modules/classes/hooks/useClasses";
import { avatarTint, initials } from "../lib/format";
import {
  useDeleteStudentPhoto,
  useStudentEditProfile,
  useUpdateStudentProfile,
  useUploadStudentPhoto,
} from "../hooks/useStudents";
import type { StudentEditProfile, UpdateStudentProfileInput } from "../types";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const COMMUNITY_OPTIONS = ["OC", "BC", "MBC", "SC", "ST"];
const ADMISSION_TYPE_OPTIONS = [
  "Counselling",
  "Management",
  "Direct",
  "Lateral Entry",
];

/**
 * These four fields are free-text columns in the DB (no CHECK constraint) —
 * the fixed lists above are just the values the admission wizard offers for
 * *new* entries. An existing record can carry an older/manually-entered value
 * outside that list (e.g. "CC" for community); silently defaulting the
 * select to the first option in that case would overwrite real data with the
 * wrong value the moment the form is saved. Always keep the record's actual
 * current value selectable, even when it's off-list.
 */
function optionsWithCurrent(options: string[], current: string): string[] {
  if (!current || options.includes(current)) return options;
  return [current, ...options];
}

// Mirrors AdminUpdateStudentDto exactly — every field here is real and
// writable via PATCH /students/:id today. Nothing shown that the backend
// can't actually persist.
interface FormState {
  roll_no: string;
  register_no: string;
  admission_no: string;
  admission_date: string;
  admission_type: string;
  joined_academic_year: string;
  gender: string;
  date_of_birth: string;
  student_type: "hosteller" | "dayscholar";
  dayscholar_mode: "" | "transport" | "own_vehicle";
  vehicle_number: string;
  course_id: string;
  quota_id: string;
  class_id: string;
  batch_id: string;
  status: "active" | "inactive";
  is_first_graduate: boolean;
  nationality: string;
  religion: string;
  community: string;
  caste: string;
  mother_tongue: string;
  blood_group: string;
  is_father_exserviceman: boolean;
  exserviceman_info: string;
  is_diff_abled: boolean;
  diff_abled_info: string;
}

function toFormState(p: StudentEditProfile): FormState {
  return {
    roll_no: p.roll_no ?? "",
    register_no: p.register_no ?? "",
    admission_no: p.admission_no ?? "",
    admission_date: p.admission_date ? p.admission_date.slice(0, 10) : "",
    admission_type: p.admission_type ?? "",
    joined_academic_year: p.joined_academic_year ?? "",
    gender: p.gender ?? "",
    date_of_birth: p.date_of_birth ? p.date_of_birth.slice(0, 10) : "",
    student_type: p.student_type,
    dayscholar_mode: p.dayscholar_mode ?? "",
    vehicle_number: p.vehicle_number ?? "",
    course_id: String(p.course_id),
    quota_id: String(p.quota_id),
    class_id: p.class_id ? String(p.class_id) : "",
    batch_id: String(p.batch_id),
    status: p.status,
    is_first_graduate: p.is_first_graduate,
    nationality: p.nationality ?? "",
    religion: p.religion ?? "",
    community: p.community ?? "",
    caste: p.caste ?? "",
    mother_tongue: p.mother_tongue ?? "",
    blood_group: p.blood_group ?? "",
    is_father_exserviceman: p.is_father_exserviceman,
    exserviceman_info: p.exserviceman_info ?? "",
    is_diff_abled: p.is_diff_abled,
    diff_abled_info: p.diff_abled_info ?? "",
  };
}

/** Same validation shape as the admission wizard — field-keyed error map, only the fields that actually have rules. */
function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (
    form.joined_academic_year &&
    !/^\d{4}-\d{4}$/.test(form.joined_academic_year)
  ) {
    errors.joined_academic_year = "Format: YYYY-YYYY, e.g. 2026-2027.";
  }
  if (form.student_type === "dayscholar" && !form.dayscholar_mode) {
    errors.dayscholar_mode = "Required for a day scholar.";
  }
  if (form.dayscholar_mode === "own_vehicle" && !form.vehicle_number.trim()) {
    errors.vehicle_number = "Required when travelling by own vehicle.";
  }
  if (!form.course_id) errors.course_id = "Required.";
  if (!form.quota_id) errors.quota_id = "Required.";
  if (!form.batch_id) errors.batch_id = "Required.";
  return errors;
}

function toPayload(form: FormState): UpdateStudentProfileInput {
  const str = (v: string) => v.trim() || undefined;
  return {
    roll_no: str(form.roll_no),
    register_no: str(form.register_no),
    admission_no: str(form.admission_no),
    admission_date: str(form.admission_date),
    admission_type: str(form.admission_type),
    joined_academic_year: str(form.joined_academic_year),
    gender: str(form.gender),
    date_of_birth: str(form.date_of_birth),
    student_type: form.student_type,
    dayscholar_mode:
      form.student_type === "dayscholar" && form.dayscholar_mode
        ? form.dayscholar_mode
        : undefined,
    vehicle_number:
      form.dayscholar_mode === "own_vehicle"
        ? str(form.vehicle_number)
        : undefined,
    course_id: Number(form.course_id),
    quota_id: Number(form.quota_id),
    // class_id has no "unassign" path through this endpoint — only send it
    // when a real class was picked.
    class_id: form.class_id ? Number(form.class_id) : undefined,
    batch_id: Number(form.batch_id),
    status: form.status,
    is_first_graduate: form.is_first_graduate,
    nationality: str(form.nationality),
    religion: str(form.religion),
    community: str(form.community),
    caste: str(form.caste),
    mother_tongue: str(form.mother_tongue),
    blood_group: str(form.blood_group),
    is_father_exserviceman: form.is_father_exserviceman,
    exserviceman_info: form.is_father_exserviceman
      ? str(form.exserviceman_info)
      : undefined,
    is_diff_abled: form.is_diff_abled,
    diff_abled_info: form.is_diff_abled ? str(form.diff_abled_info) : undefined,
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
      />
      {label}
    </label>
  );
}

export function EditProfileModal({
  studentId,
  firstName,
  lastName,
  open,
  onClose,
}: {
  studentId: number;
  firstName: string | null;
  lastName: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { show } = useToast();
  const { data: profile, isLoading: profileLoading } = useStudentEditProfile(
    studentId,
    open,
  );
  const { data: courses } = useCourses();
  const { data: batches } = useBatches();
  const { data: quotas } = useQuotas();
  const { data: classes } = useClasses();
  const updateProfile = useUpdateStudentProfile();
  const uploadPhoto = useUploadStudentPhoto();
  const deletePhoto = useDeleteStudentPhoto();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Re-hydrate from the server's current values every time the modal opens
  // for a (possibly different) student — never carry stale edits across opens.
  // Deliberate one-shot hydration on open/data-arrival, not the kind of
  // external-sync setState the set-state-in-effect rule is meant to flag.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open && profile) setForm(toFormState(profile));
    if (!open) {
      setForm(null);
      setErrors({});
    }
  }, [open, profile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function patch(p: Partial<FormState>) {
    setForm((f) => (f ? { ...f, ...p } : f));
  }

  async function handleSave() {
    if (!form) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await updateProfile.mutateAsync({
        id: studentId,
        input: toPayload(form),
      });
      show("Profile updated.", "success");
      onClose();
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadPhoto.mutateAsync({ id: studentId, file });
      show("Photo updated.", "success");
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  async function handleDeletePhoto() {
    try {
      await deletePhoto.mutateAsync(studentId);
      show("Photo removed.", "success");
      setConfirmDelete(false);
    } catch (err) {
      show(friendlyError(err), "error");
    }
  }

  // Filtered to the selected course so the list stays short and relevant —
  // but if the student's currently-assigned class belongs to a different
  // course (a data inconsistency, not something this form should silently
  // paper over), keep it selectable rather than making the dropdown show a
  // blank "Unassigned" for a class that's actually still assigned.
  const classOptionsForCourse = (classes ?? []).filter(
    (c) =>
      !form ||
      c.course_id === Number(form.course_id) ||
      String(c.id) === form.class_id,
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Edit profile"
        widthClassName="max-w-3xl"
      >
        {profileLoading || !form ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Loading current values…
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Profile photo
              </p>
              <div className="flex items-center gap-4">
                {(() => {
                  const tint = avatarTint(studentId);
                  return (
                    <span
                      className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 text-xl font-semibold"
                      style={
                        profile?.photo_url
                          ? undefined
                          : { background: tint.bg, color: tint.fg }
                      }
                    >
                      {profile?.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- a Supabase Storage URL, not a local/optimizable asset
                        <img
                          src={profile.photo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials(firstName, lastName)
                      )}
                    </span>
                  );
                })()}
                <div className="flex flex-col gap-2">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handlePhotoFile}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      isPending={uploadPhoto.isPending}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <UploadIcon className="h-3.5 w-3.5" />{" "}
                      {profile?.photo_url ? "Replace photo" : "Upload photo"}
                    </Button>
                    {profile?.photo_url && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <TrashIcon className="h-3.5 w-3.5" /> Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    JPG, PNG or WebP, up to 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Identity numbers
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Roll number">
                  <TextInput
                    value={form.roll_no}
                    maxLength={30}
                    onChange={(e) => patch({ roll_no: e.target.value })}
                  />
                </Field>
                <Field label="Register number">
                  <TextInput
                    value={form.register_no}
                    maxLength={30}
                    onChange={(e) => patch({ register_no: e.target.value })}
                  />
                </Field>
                <Field label="Admission number">
                  <TextInput
                    value={form.admission_no}
                    maxLength={30}
                    onChange={(e) => patch({ admission_no: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Academic placement
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Course" error={errors.course_id}>
                  <SelectInput
                    value={form.course_id}
                    hasError={!!errors.course_id}
                    onChange={(e) =>
                      patch({ course_id: e.target.value, class_id: "" })
                    }
                  >
                    <option value="">Select course</option>
                    {courses?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Batch" error={errors.batch_id}>
                  <SelectInput
                    value={form.batch_id}
                    hasError={!!errors.batch_id}
                    onChange={(e) => patch({ batch_id: e.target.value })}
                  >
                    <option value="">Select batch</option>
                    {batches?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Quota" error={errors.quota_id}>
                  <SelectInput
                    value={form.quota_id}
                    hasError={!!errors.quota_id}
                    onChange={(e) => patch({ quota_id: e.target.value })}
                  >
                    <option value="">Select quota</option>
                    {quotas?.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.name}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Class section">
                  <SelectInput
                    value={form.class_id}
                    onChange={(e) => patch({ class_id: e.target.value })}
                    disabled={!form.course_id}
                  >
                    <option value="">Unassigned</option>
                    {classOptionsForCourse.map((c) => (
                      <option key={c.id} value={c.id}>
                        Section {c.section}
                        {c.current_semester
                          ? ` · Sem ${c.current_semester}`
                          : ""}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Status">
                  <SelectInput
                    value={form.status}
                    onChange={(e) =>
                      patch({ status: e.target.value as FormState["status"] })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </SelectInput>
                </Field>
                <Field label="Admission date">
                  <TextInput
                    type="date"
                    value={form.admission_date}
                    onChange={(e) => patch({ admission_date: e.target.value })}
                  />
                </Field>
                <Field label="Admission type">
                  <SelectInput
                    value={form.admission_type}
                    onChange={(e) => patch({ admission_type: e.target.value })}
                  >
                    <option value="">Select type</option>
                    {optionsWithCurrent(
                      ADMISSION_TYPE_OPTIONS,
                      form.admission_type,
                    ).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field
                  label="Joined academic year"
                  error={errors.joined_academic_year}
                >
                  <TextInput
                    value={form.joined_academic_year}
                    placeholder="2026-2027"
                    hasError={!!errors.joined_academic_year}
                    onChange={(e) =>
                      patch({ joined_academic_year: e.target.value })
                    }
                  />
                </Field>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Personal details
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Gender">
                  <SelectInput
                    value={form.gender}
                    onChange={(e) => patch({ gender: e.target.value })}
                  >
                    <option value="">Select gender</option>
                    {optionsWithCurrent(GENDER_OPTIONS, form.gender).map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ),
                    )}
                  </SelectInput>
                </Field>
                <Field label="Date of birth">
                  <TextInput
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => patch({ date_of_birth: e.target.value })}
                  />
                </Field>
                <Field label="Blood group">
                  <SelectInput
                    value={form.blood_group}
                    onChange={(e) => patch({ blood_group: e.target.value })}
                  >
                    <option value="">Select blood group</option>
                    {optionsWithCurrent(
                      BLOOD_GROUP_OPTIONS,
                      form.blood_group,
                    ).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Community">
                  <SelectInput
                    value={form.community}
                    onChange={(e) => patch({ community: e.target.value })}
                  >
                    <option value="">Select community</option>
                    {optionsWithCurrent(COMMUNITY_OPTIONS, form.community).map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ),
                    )}
                  </SelectInput>
                </Field>
                <Field label="Nationality">
                  <TextInput
                    value={form.nationality}
                    maxLength={50}
                    placeholder="Indian"
                    onChange={(e) => patch({ nationality: e.target.value })}
                  />
                </Field>
                <Field label="Religion">
                  <TextInput
                    value={form.religion}
                    maxLength={50}
                    onChange={(e) => patch({ religion: e.target.value })}
                  />
                </Field>
                <Field label="Caste">
                  <TextInput
                    value={form.caste}
                    maxLength={50}
                    onChange={(e) => patch({ caste: e.target.value })}
                  />
                </Field>
                <Field label="Mother tongue">
                  <TextInput
                    value={form.mother_tongue}
                    maxLength={50}
                    placeholder="Tamil"
                    onChange={(e) => patch({ mother_tongue: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Residence
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Residence type">
                  <SelectInput
                    value={form.student_type}
                    onChange={(e) =>
                      patch({
                        student_type: e.target
                          .value as FormState["student_type"],
                        dayscholar_mode:
                          e.target.value === "hosteller"
                            ? ""
                            : form.dayscholar_mode,
                      })
                    }
                  >
                    <option value="hosteller">Hosteller</option>
                    <option value="dayscholar">Day scholar</option>
                  </SelectInput>
                </Field>
                {form.student_type === "dayscholar" && (
                  <Field label="How they travel" error={errors.dayscholar_mode}>
                    <SelectInput
                      value={form.dayscholar_mode}
                      hasError={!!errors.dayscholar_mode}
                      onChange={(e) =>
                        patch({
                          dayscholar_mode: e.target
                            .value as FormState["dayscholar_mode"],
                        })
                      }
                    >
                      <option value="">Select mode</option>
                      <option value="transport">College transport</option>
                      <option value="own_vehicle">Own vehicle</option>
                    </SelectInput>
                  </Field>
                )}
                {form.dayscholar_mode === "own_vehicle" && (
                  <Field label="Vehicle number" error={errors.vehicle_number}>
                    <TextInput
                      value={form.vehicle_number}
                      maxLength={30}
                      placeholder="TN 37 CX 1234"
                      hasError={!!errors.vehicle_number}
                      onChange={(e) =>
                        patch({ vehicle_number: e.target.value })
                      }
                    />
                  </Field>
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Special categories
              </p>
              <div className="flex flex-col gap-3">
                <Checkbox
                  label="First graduate in the family"
                  checked={form.is_first_graduate}
                  onChange={(v) => patch({ is_first_graduate: v })}
                />
                <Checkbox
                  label="Father is an ex-serviceman"
                  checked={form.is_father_exserviceman}
                  onChange={(v) => patch({ is_father_exserviceman: v })}
                />
                {form.is_father_exserviceman && (
                  <TextInput
                    value={form.exserviceman_info}
                    maxLength={255}
                    placeholder="Service details"
                    onChange={(e) =>
                      patch({ exserviceman_info: e.target.value })
                    }
                  />
                )}
                <Checkbox
                  label="Differently abled"
                  checked={form.is_diff_abled}
                  onChange={(v) => patch({ is_diff_abled: v })}
                />
                {form.is_diff_abled && (
                  <TextInput
                    value={form.diff_abled_info}
                    maxLength={255}
                    placeholder="Details"
                    onChange={(e) => patch({ diff_abled_info: e.target.value })}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={updateProfile.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isPending={updateProfile.isPending}
                onClick={handleSave}
              >
                Save changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sibling, not nested inside <Modal> — two native <dialog> elements
        open at once behave correctly as siblings; nesting one inside the
        other's DOM subtree made the browser close both when the inner one
        closed (see CategoriesPanel.tsx for the same sibling convention). */}
      <ConfirmDialog
        open={confirmDelete}
        title="Remove photo?"
        message="This deletes the current profile photo from storage. The student will show initials until a new one is uploaded."
        confirmLabel="Remove photo"
        tone="danger"
        isPending={deletePhoto.isPending}
        onConfirm={handleDeletePhoto}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
