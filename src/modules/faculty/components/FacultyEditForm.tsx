"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { TypeToConfirmDialog } from "@/shared/components/ui/TypeToConfirmDialog";
import { OtpVerifyDialog } from "./OtpVerifyDialog";
import { FacultyPhotoPicker } from "./FacultyPhotoPicker";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { facultyFilesService } from "../services/faculty-files.service";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  EyeIcon,
  LayersIcon,
  LockIcon,
  PersonIcon,
  ShieldCheckIcon,
  UndoIcon,
} from "@/shared/components/icons";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useUpdateFaculty } from "../hooks/useFacultyMutations";
import { facultyEditSchema, type FacultyEditValues } from "../schemas/faculty-edit.schema";
import {
  DESIGNATION_OPTIONS,
  EMPLOYEE_TYPE_FROM_ENUM,
  EMPLOYEE_TYPE_OPTIONS,
  EMPLOYEE_TYPE_TO_ENUM,
  EMPLOYMENT_STATUS_FROM_ENUM,
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_TO_ENUM,
  GENDER_OPTIONS,
  QUALIFICATION_OPTIONS,
  ROLE_OPTIONS,
  TITLE_OPTIONS,
} from "../lib/faculty-wizard-config";
import {
  avatarToneFor,
  formatFacultyCode,
  fullName,
  initialsOf,
  toDateInputValue,
  todayDateInputValue,
} from "../lib/faculty-format";
import { clearDraft, getDraft, saveDraft } from "../lib/faculty-draft-store";
import type { Faculty, UpdateFacultyInput } from "../types";

const SECTIONS = [
  { id: "basic", label: "Basic Information", icon: PersonIcon },
  { id: "contact", label: "Contact Information", icon: EnvelopeIcon },
  { id: "account", label: "Account Information", icon: LockIcon },
  { id: "employment", label: "Employment", icon: LayersIcon },
  { id: "identity", label: "Identity", icon: ShieldCheckIcon },
] as const;

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

function editDraftKey(facultyId: number): string {
  return `eos.faculty.edit.draft.${facultyId}`;
}

function toDefaults(faculty: Faculty): FacultyEditValues {
  return {
    profilePhotoName: undefined,
    prefix: faculty.prefix ?? undefined,
    gender: faculty.gender ?? undefined,
    first_name: faculty.first_name,
    last_name: faculty.last_name,
    dob: toDateInputValue(faculty.date_of_birth) || undefined,
    designation: faculty.designation,
    department_id: faculty.department_id ?? faculty.department?.id,
    date_of_joining: toDateInputValue(faculty.date_of_joining) || undefined,
    personalEmail: faculty.personal_email ?? undefined,
    phone: faculty.phone ?? undefined,
    alternatePhone: faculty.alternate_phone ?? undefined,
    addressLine: faculty.address_line ?? undefined,
    city: faculty.city ?? undefined,
    state: faculty.state ?? undefined,
    pincode: faculty.postal_code ?? undefined,
    role: faculty.academic_role ?? undefined,
    status: faculty.status,
    employmentStatus: faculty.employment_status ? EMPLOYMENT_STATUS_FROM_ENUM[faculty.employment_status] : undefined,
    employeeType: faculty.employment_type ? EMPLOYEE_TYPE_FROM_ENUM[faculty.employment_type] : undefined,
    confirmationDate: toDateInputValue(faculty.confirmation_date) || undefined,
    probationEndDate: toDateInputValue(faculty.probation_end_date) || undefined,
    workLocation: faculty.work_location ?? undefined,
    qualification: faculty.qualification ?? undefined,
    specialization: faculty.specialization ?? undefined,
    officeRoom: faculty.office_room ?? undefined,
    reportingTo: undefined,
    aadhar_number: undefined,
    pan_number: undefined,
    bank_account_number: undefined,
    bank_ifsc: undefined,
    bank_name: undefined,
  };
}

function toSensitiveInfo(values: FacultyEditValues) {
  const hasAny =
    values.aadhar_number || values.pan_number || values.bank_account_number || values.bank_ifsc || values.bank_name;
  if (!hasAny) return undefined;
  return {
    aadhar_number: values.aadhar_number,
    pan_number: values.pan_number?.toUpperCase(),
    bank_account_number: values.bank_account_number,
    bank_ifsc: values.bank_ifsc?.toUpperCase(),
    bank_name: values.bank_name,
  };
}

function fieldGrid(children: React.ReactNode) {
  return <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">{children}</div>;
}

function SectionCard({
  id,
  title,
  desc,
  icon: Icon,
  registerRef,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  icon: typeof PersonIcon;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`section-${id}`}
      ref={(el) => registerRef(id, el)}
      className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{desc}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </div>
  );
}

export function FacultyEditForm({ faculty }: { faculty: Faculty }) {
  const router = useRouter();
  const { show, showDetailed } = useToast();
  const { data: departments } = useDepartments();
  const updateFaculty = useUpdateFaculty();
  const toggleStatus = useUpdateFaculty();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<FacultyEditValues>({
    resolver: zodResolver(facultyEditSchema),
    // Restores an in-progress draft (see the autosave effect below) so a
    // network drop or closed tab doesn't mean redoing every edit.
    defaultValues: getDraft<FacultyEditValues>(editDraftKey(faculty.id)) ?? toDefaults(faculty),
    mode: "onSubmit",
  });

  // Same reasoning as the create wizard's identical helper: reValidateMode
  // only takes effect once handleSubmit has actually run once, so it doesn't
  // reliably clear an error on the very first attempt. This re-validates a
  // field on every keystroke, but only once it already has an error, so it
  // clears live instead of waiting for another Save click.
  function liveClear(name: keyof FacultyEditValues, options?: Parameters<typeof register>[1]) {
    const field = register(name, options);
    return {
      ...field,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        field.onChange(event);
        if (errors[name]) trigger(name);
      },
    };
  }

  const unsavedCount = Object.keys(dirtyFields).length;
  const draftKey = editDraftKey(faculty.id);

  // Unlike the create wizard, editing an existing record's unsaved changes
  // aren't announced with a toast on restore — the draft still silently
  // repopulates the form (see `defaultValues` above), just without the
  // notification, since re-opening an edit is a much lower-stakes moment
  // than recovering a multi-step wizard draft.

  // Autosaves the draft locally so a network drop or closed tab doesn't
  // mean redoing every edit — debounced so it isn't writing to localStorage
  // on every keystroke.
  const editValues = watch();
  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = setTimeout(() => saveDraft(draftKey, editValues), 500);
    return () => {
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    };
  }, [editValues, draftKey]);

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [phoneOtpOpen, setPhoneOtpOpen] = useState(false);
  const [phoneVerifiedValue, setPhoneVerifiedValue] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(faculty.profile_url ?? null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  function registerSectionRef(id: string, el: HTMLDivElement | null) {
    sectionRefs.current[id] = el;
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace("section-", "");
          setActiveSection(id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const node = sectionRefs.current[s.id];
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  function scrollToSection(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openPhoneOtp() {
    if (!watch("phone")?.trim()) {
      show("Enter a phone number first.", "error");
      return;
    }
    setPhoneOtpOpen(true);
  }

  function handlePhoneVerified() {
    setPhoneVerifiedValue(watch("phone") ?? "");
    show("Phone number verified.", "success");
    setPhoneOtpOpen(false);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      show("Choose an image under 3 MB.", "error");
      return;
    }
    setPhotoUploading(true);
    try {
      const { profile_url } = await facultyFilesService.uploadPhoto(faculty.id, file);
      setPhotoDataUrl(profile_url);
      show("Profile photo updated.", "success");
    } catch (err: unknown) {
      show(err instanceof ApiError ? err.message : "Couldn't upload the photo. Try again.", "error");
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  async function handleRemovePhoto() {
    setPhotoUploading(true);
    try {
      await facultyFilesService.removePhoto(faculty.id);
      setPhotoDataUrl(null);
      show("Profile photo removed.", "success");
    } catch (err: unknown) {
      show(err instanceof ApiError ? err.message : "Couldn't remove the photo. Try again.", "error");
    } finally {
      setPhotoUploading(false);
    }
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
    } else {
      clearDraft(draftKey);
      router.push(`/admin/faculty/${faculty.id}`);
    }
  }

  function handleReset() {
    if (!isDirty) return;
    setResetConfirmOpen(true);
  }

  function confirmReset() {
    reset(toDefaults(faculty));
    setPhotoDataUrl(faculty.profile_url ?? null);
    clearDraft(draftKey);
    setResetConfirmOpen(false);
    show("Form reset to its saved values.", "info");
  }

  function onSubmit(values: FacultyEditValues) {
    const sensitive_info = toSensitiveInfo(values);
    updateFaculty
      .mutateAsync({
        id: faculty.id,
        input: {
          first_name: values.first_name,
          last_name: values.last_name,
          designation: values.designation,
          department_id: values.department_id!,
          date_of_joining: values.date_of_joining,
          status: values.status,
          phone: values.phone,
          prefix: values.prefix,
          gender: values.gender,
          date_of_birth: values.dob,
          personal_email: values.personalEmail,
          alternate_phone: values.alternatePhone,
          address_line: values.addressLine,
          city: values.city,
          state: values.state,
          postal_code: values.pincode,
          academic_role: values.role,
          employment_status: values.employmentStatus ? EMPLOYMENT_STATUS_TO_ENUM[values.employmentStatus] : undefined,
          employment_type: values.employeeType ? EMPLOYEE_TYPE_TO_ENUM[values.employeeType] : undefined,
          confirmation_date: values.confirmationDate,
          probation_end_date: values.probationEndDate,
          work_location: values.workLocation,
          qualification: values.qualification,
          specialization: values.specialization,
          office_room: values.officeRoom,
          phone_verified: !!values.phone && phoneVerifiedValue === values.phone,
          sensitive_info,
        } satisfies UpdateFacultyInput,
      })
      .then(() => {
        clearDraft(draftKey);
        showDetailed("Changes saved", `Record updated for ${fullName(faculty)}.`, "success");
        router.push(`/admin/faculty/${faculty.id}`);
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  function handleToggleStatus() {
    const nextStatus = faculty.status === "active" ? "inactive" : "active";
    toggleStatus.mutate(
      { id: faculty.id, input: { status: nextStatus } },
      {
        onSuccess: () => {
          show(nextStatus === "active" ? "Faculty reactivated." : "Faculty deactivated.", "success");
          setStatusConfirmOpen(false);
          router.push(`/admin/faculty/${faculty.id}`);
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  const knownDesignations = !DESIGNATION_OPTIONS.includes(faculty.designation)
    ? [faculty.designation, ...DESIGNATION_OPTIONS]
    : DESIGNATION_OPTIONS;

  const isPending = updateFaculty.isPending;
  const isTogglingStatus = toggleStatus.isPending;

  return (
    <div>
      <nav className="mb-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <Link href="/admin/faculty" className="hover:text-slate-700">
          Faculty
        </Link>
        <span className="mx-1.5">›</span>
        <Link href={`/admin/faculty/${faculty.id}`} className="hover:text-slate-700">
          {fullName(faculty)}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-slate-700">Edit</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Edit faculty record</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {fullName(faculty)} · {formatFacultyCode(faculty.id)} · {faculty.department?.name ?? "No department"}
          </p>
        </div>
        <Link
          href={`/admin/faculty/${faculty.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <EyeIcon className="h-4 w-4" /> View profile
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="sticky top-0 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          {unsavedCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {unsavedCount} unsaved change
              {unsavedCount === 1 ? "" : "s"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> No changes
            </span>
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset} disabled={!isDirty}>
              <UndoIcon className="h-3.5 w-3.5" /> Reset
            </Button>
            <Button type="submit" variant="primary" isPending={isPending} disabled={!isDirty}>
              <CheckIcon className="h-3.5 w-3.5" /> Save changes
            </Button>
          </div>
        </div>

        <div className="mt-4 flex gap-6">
          <aside className={`shrink-0 ${collapsed ? "w-auto" : "w-56"}`}>
            <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between px-1 pb-2">
                {!collapsed && (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sections</p>
                )}
                <button
                  type="button"
                  onClick={() => setCollapsed((v) => !v)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label={collapsed ? "Expand sections" : "Collapse sections"}
                >
                  <ChevronLeftIcon className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
                </button>
              </div>
              <nav className="flex flex-col gap-0.5">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollToSection(s.id)}
                    title={collapsed ? s.label : undefined}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      collapsed ? "justify-center" : ""
                    } ${activeSection === s.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{s.label}</span>}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <SectionCard
              id="basic"
              title="Basic Information"
              desc="Name, designation and department placement."
              icon={PersonIcon}
              registerRef={registerSectionRef}
            >
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">
                  Profile photo <span className="font-normal text-slate-400">(optional)</span>
                </p>
                <FacultyPhotoPicker
                  photoDataUrl={photoDataUrl}
                  photoLabel={null}
                  isUploading={photoUploading}
                  initials={initialsOf(faculty)}
                  tone={avatarToneFor(faculty.id)}
                  onPick={() => photoInputRef.current?.click()}
                  onRemove={handleRemovePhoto}
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {fieldGrid(
                <>
                  <FormField label="Title" htmlFor="e-prefix">
                    <SelectInput id="e-prefix" {...liveClear("prefix")}>
                      <option value="">Select title</option>
                      {TITLE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                  <FormField label="Gender" htmlFor="e-gender">
                    <SelectInput id="e-gender" {...liveClear("gender")}>
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                </>,
              )}

              {fieldGrid(
                <>
                  <FormField label="First name" htmlFor="e-first-name" required error={errors.first_name?.message}>
                    <TextInput id="e-first-name" hasError={!!errors.first_name} {...liveClear("first_name")} />
                  </FormField>
                  <FormField label="Last name" htmlFor="e-last-name" required error={errors.last_name?.message}>
                    <TextInput id="e-last-name" hasError={!!errors.last_name} {...liveClear("last_name")} />
                  </FormField>
                </>,
              )}

              {fieldGrid(
                <>
                  <FormField label="Date of birth" htmlFor="e-dob" error={errors.dob?.message}>
                    <TextInput
                      id="e-dob"
                      type="date"
                      max={todayDateInputValue()}
                      {...liveClear("dob", textFieldOptions)}
                    />
                  </FormField>
                  <FormField label="Faculty ID" htmlFor="e-faculty-id" hint="Generated automatically. Cannot be edited.">
                    <TextInput id="e-faculty-id" value={formatFacultyCode(faculty.id)} disabled className="font-mono" />
                  </FormField>
                </>,
              )}

              {fieldGrid(
                <>
                  <FormField label="Designation" htmlFor="e-designation" required error={errors.designation?.message}>
                    <SelectInput id="e-designation" hasError={!!errors.designation} {...liveClear("designation")}>
                      {knownDesignations.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                  <FormField label="Department" htmlFor="e-department" required error={errors.department_id?.message}>
                    <SelectInput
                      id="e-department"
                      hasError={!!errors.department_id}
                      {...liveClear("department_id", numberFieldOptions)}
                    >
                      <option value="">Select a department</option>
                      {departments?.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                </>,
              )}

              <FormField label="Date of joining" htmlFor="e-doj" error={errors.date_of_joining?.message}>
                <TextInput id="e-doj" type="date" {...liveClear("date_of_joining", textFieldOptions)} />
              </FormField>
            </SectionCard>

            <SectionCard
              id="contact"
              title="Contact Information"
              desc="How to reach this faculty member — official and personal channels."
              icon={EnvelopeIcon}
              registerRef={registerSectionRef}
            >
              {fieldGrid(
                <>
                  <FormField
                    label="Personal email"
                    htmlFor="e-personal-email"
                    hint="The only email on file until the official one is issued."
                    error={errors.personalEmail?.message}
                  >
                    <TextInput
                      id="e-personal-email"
                      type="email"
                      hasError={!!errors.personalEmail}
                      {...liveClear("personalEmail", textFieldOptions)}
                    />
                  </FormField>
                  <FormField label="Phone" htmlFor="e-phone" error={errors.phone?.message}>
                    <div className="flex items-center gap-2">
                      <TextInput
                        id="e-phone"
                        type="tel"
                        hasError={!!errors.phone}
                        {...liveClear("phone", textFieldOptions)}
                      />
                      {watch("phone") && phoneVerifiedValue === watch("phone") ? (
                        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                          <CheckIcon className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <Button type="button" variant="secondary" onClick={openPhoneOtp}>
                          <ShieldCheckIcon className="h-3.5 w-3.5" /> Verify
                        </Button>
                      )}
                    </div>
                  </FormField>
                </>,
              )}

              {fieldGrid(
                <>
                  <FormField
                    label="Official email"
                    htmlFor="e-email"
                    hint="Usually issued by IT a few days after joining — set at creation, can't be changed here."
                  >
                    <TextInput id="e-email" type="email" disabled value={faculty.email} />
                  </FormField>
                  <FormField label="Alternate phone" htmlFor="e-alt-phone" error={errors.alternatePhone?.message}>
                    <TextInput
                      id="e-alt-phone"
                      type="tel"
                      hasError={!!errors.alternatePhone}
                      {...liveClear("alternatePhone", textFieldOptions)}
                    />
                  </FormField>
                </>,
              )}

              <FormField label="Address" htmlFor="e-address" error={errors.addressLine?.message}>
                <TextInput id="e-address" {...liveClear("addressLine", textFieldOptions)} />
              </FormField>

              {fieldGrid(
                <>
                  <FormField label="City" htmlFor="e-city" error={errors.city?.message}>
                    <TextInput id="e-city" {...liveClear("city", textFieldOptions)} />
                  </FormField>
                  <FormField label="State" htmlFor="e-state" error={errors.state?.message}>
                    <TextInput id="e-state" {...liveClear("state", textFieldOptions)} />
                  </FormField>
                </>,
              )}

              <FormField label="Postal code" htmlFor="e-pincode" error={errors.pincode?.message}>
                <TextInput id="e-pincode" hasError={!!errors.pincode} {...liveClear("pincode", textFieldOptions)} />
              </FormField>
            </SectionCard>

            <SectionCard
              id="account"
              title="Account Information"
              desc="System access and role."
              icon={LockIcon}
              registerRef={registerSectionRef}
            >
              {fieldGrid(
                <>
                  <FormField label="Role" htmlFor="e-role">
                    <SelectInput id="e-role" {...liveClear("role")}>
                      <option value="">Select role</option>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                  <FormField
                    label="Account status"
                    htmlFor="e-status"
                    hint="Changing this immediately affects portal access."
                    error={errors.status?.message}
                  >
                    <SelectInput id="e-status" {...liveClear("status")}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </SelectInput>
                  </FormField>
                </>,
              )}
            </SectionCard>

            <SectionCard
              id="employment"
              title="Employment"
              desc="Service record, employment terms and reporting details."
              icon={LayersIcon}
              registerRef={registerSectionRef}
            >
              {fieldGrid(
                <>
                  <FormField label="Employment status" htmlFor="e-employment-status">
                    <SelectInput id="e-employment-status" {...liveClear("employmentStatus")}>
                      <option value="">Select status</option>
                      {EMPLOYMENT_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                  <FormField label="Employment type" htmlFor="e-employee-type">
                    <SelectInput id="e-employee-type" {...liveClear("employeeType")}>
                      <option value="">Select employment type</option>
                      {EMPLOYEE_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                </>,
              )}

              {fieldGrid(
                <>
                  <FormField label="Confirmation date" htmlFor="e-confirmation-date">
                    <TextInput id="e-confirmation-date" type="date" {...liveClear("confirmationDate", textFieldOptions)} />
                  </FormField>
                  <FormField label="Probation end date" htmlFor="e-probation-end">
                    <TextInput id="e-probation-end" type="date" {...liveClear("probationEndDate", textFieldOptions)} />
                  </FormField>
                </>,
              )}

              <FormField label="Work location" htmlFor="e-work-location">
                <TextInput
                  id="e-work-location"
                  placeholder="e.g. Main Campus — A Block"
                  {...liveClear("workLocation", textFieldOptions)}
                />
              </FormField>

              {fieldGrid(
                <>
                  <FormField label="Qualification" htmlFor="e-qualification">
                    <SelectInput id="e-qualification" {...liveClear("qualification")}>
                      <option value="">Select qualification</option>
                      {QUALIFICATION_OPTIONS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                  <FormField label="Specialization" htmlFor="e-specialization">
                    <TextInput id="e-specialization" {...liveClear("specialization", textFieldOptions)} />
                  </FormField>
                </>,
              )}

              {fieldGrid(
                <>
                  <FormField label="Office room" htmlFor="e-office-room">
                    <TextInput id="e-office-room" placeholder="e.g. A Block · Room 218" {...liveClear("officeRoom", textFieldOptions)} />
                  </FormField>
                  <FormField label="Reporting to" htmlFor="e-reporting-to">
                    <TextInput id="e-reporting-to" {...liveClear("reportingTo", textFieldOptions)} />
                  </FormField>
                </>,
              )}
            </SectionCard>

            <SectionCard
              id="identity"
              title="Identity"
              desc="Access-controlled. Never shown on the faculty list or in exports."
              icon={ShieldCheckIcon}
              registerRef={registerSectionRef}
            >
              <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <ShieldCheckIcon className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Write-only</p>
                  <p className="mt-0.5 text-amber-700">
                    The backend never returns these once saved, so the fields below always start blank — leave a
                    field empty to keep its current value unchanged, or fill it in to set/replace it.
                  </p>
                </div>
              </div>

              {fieldGrid(
                <>
                  <FormField
                    label="Aadhaar number"
                    htmlFor="e-aadhar"
                    hint="12 digits, no spaces."
                    error={errors.aadhar_number?.message}
                  >
                    <TextInput
                      id="e-aadhar"
                      hasError={!!errors.aadhar_number}
                      {...liveClear("aadhar_number", textFieldOptions)}
                    />
                  </FormField>
                  <FormField label="PAN" htmlFor="e-pan" error={errors.pan_number?.message}>
                    <TextInput
                      id="e-pan"
                      placeholder="ABCDE1234F"
                      hasError={!!errors.pan_number}
                      {...liveClear("pan_number", textFieldOptions)}
                    />
                  </FormField>
                </>,
              )}

              {fieldGrid(
                <>
                  <FormField label="Bank name" htmlFor="e-bank-name">
                    <TextInput id="e-bank-name" {...liveClear("bank_name", textFieldOptions)} />
                  </FormField>
                  <FormField
                    label="Bank account number"
                    htmlFor="e-bank-account"
                    error={errors.bank_account_number?.message}
                  >
                    <TextInput
                      id="e-bank-account"
                      hasError={!!errors.bank_account_number}
                      {...liveClear("bank_account_number", textFieldOptions)}
                    />
                  </FormField>
                </>,
              )}

              <FormField label="IFSC code" htmlFor="e-ifsc" error={errors.bank_ifsc?.message}>
                <TextInput
                  id="e-ifsc"
                  placeholder="e.g. SBIN0007124"
                  hasError={!!errors.bank_ifsc}
                  {...liveClear("bank_ifsc", textFieldOptions)}
                />
              </FormField>
            </SectionCard>

            <div className="rounded-xl border border-red-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4 border-b border-red-100 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-red-700">Danger zone</h3>
                  <p className="mt-1 text-sm text-slate-500">High-impact operations, applied immediately.</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangleIcon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <div>
                  <p className="text-sm font-medium text-red-700">
                    {faculty.status === "active" ? "Deactivate faculty" : "Reactivate faculty"}
                  </p>
                  <p className="text-xs text-red-700/80">
                    {faculty.status === "active"
                      ? "Revokes system access immediately."
                      : "Restores system access immediately."}
                  </p>
                </div>
                <Button type="button" variant="dangerSolid" onClick={() => setStatusConfirmOpen(true)}>
                  {faculty.status === "active" ? "Deactivate" : "Reactivate"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Discard unsaved changes?"
        message={`${unsavedCount} field${unsavedCount === 1 ? "" : "s"} modified. Leaving now discards those edits.`}
        confirmLabel="Discard and leave"
        tone="danger"
        onConfirm={() => {
          clearDraft(draftKey);
          router.push(`/admin/faculty/${faculty.id}`);
        }}
        onClose={() => setCancelConfirmOpen(false)}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset the form?"
        message="All fields return to their last saved values."
        confirmLabel="Reset form"
        tone="danger"
        onConfirm={confirmReset}
        onClose={() => setResetConfirmOpen(false)}
      />

      {faculty.status === "active" ? (
        <TypeToConfirmDialog
          open={statusConfirmOpen}
          title="Deactivate faculty"
          message={`Deactivating ${fullName(faculty)} revokes their portal access immediately. This can be undone later by reactivating them.`}
          confirmValue={fullName(faculty)}
          confirmLabel="Deactivate"
          isPending={isTogglingStatus}
          onConfirm={handleToggleStatus}
          onClose={() => setStatusConfirmOpen(false)}
        />
      ) : (
        <ConfirmDialog
          open={statusConfirmOpen}
          title="Reactivate faculty"
          message={`Reactivate ${fullName(faculty)}? Portal access will be restored.`}
          confirmLabel="Reactivate"
          tone="primary"
          isPending={isTogglingStatus}
          onConfirm={handleToggleStatus}
          onClose={() => setStatusConfirmOpen(false)}
        />
      )}

      <OtpVerifyDialog
        open={phoneOtpOpen}
        fieldLabel="mobile number"
        channel="sms"
        phoneNumber={watch("phone") ?? ""}
        onVerified={handlePhoneVerified}
        onClose={() => setPhoneOtpOpen(false)}
      />
    </div>
  );
}
