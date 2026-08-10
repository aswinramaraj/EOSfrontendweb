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
import { OtpVerifyDialog } from "../OtpVerifyDialog";
import { FacultyPhotoPicker } from "../FacultyPhotoPicker";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  FileTextIcon,
  GraduationCapIcon,
  LayersIcon,
  LockIcon,
  PencilIcon,
  PersonIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@/shared/components/icons";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useCreateFaculty } from "../../hooks/useFacultyMutations";
import { facultyFilesService } from "../../services/faculty-files.service";
import { facultyWizardSchema, type FacultyWizardValues } from "../../schemas/faculty-wizard.schema";
import {
  DESIGNATION_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  EMPLOYEE_TYPE_TO_ENUM,
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_TO_ENUM,
  GENDER_OPTIONS,
  QUALIFICATION_DOCUMENT_TYPE_OPTIONS,
  QUALIFICATION_OPTIONS,
  ROLE_OPTIONS,
  STEP_FIELDS,
  TITLE_OPTIONS,
  WIZARD_STEPS,
  getStepProgress,
} from "../../lib/faculty-wizard-config";
import type { CreateFacultyInput, Faculty } from "../../types";
import { FacultyWizardStepper } from "./FacultyWizardStepper";
import { avatarToneFor, initialsOf, todayDateInputValue } from "../../lib/faculty-format";
import { clearDraft, getDraft, saveDraft } from "../../lib/faculty-draft-store";

// Mirrors the backend's ALLOWED_DOCUMENT_MIME_TYPES/MAX_DOCUMENT_BYTES
// (faculty-files.service.ts) — checked here too so a bad file is caught
// before faculty creation, not after (a rejected upload here only surfaces
// as "N of M uploads failed" post-creation, which is much less clear).
const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const DOCUMENT_FORMAT_HINT = "PDF, JPG, or PNG · up to 10 MB";

const STEP_ICONS: Record<string, typeof PersonIcon> = {
  basic: PersonIcon,
  contact: EnvelopeIcon,
  employment: LayersIcon,
  account: LockIcon,
  identity: ShieldCheckIcon,
  qualifications: GraduationCapIcon,
  documents: FileTextIcon,
  review: CheckIcon,
};

interface PendingDocument {
  type: string;
  fileName: string;
  file: File;
}

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const CREATE_DRAFT_KEY = "eos.faculty.create.draft";

const DEFAULT_VALUES: FacultyWizardValues = {
  profilePhotoName: undefined,
  prefix: "",
  gender: "",
  firstName: "",
  lastName: "",
  dob: undefined,
  personalEmail: "",
  phone: "",
  whatsapp: "",
  officialEmail: undefined,
  alternatePhone: undefined,
  addressLine: undefined,
  city: undefined,
  state: undefined,
  pincode: undefined,
  designation: "",
  departmentId: undefined,
  dateOfJoining: "",
  employmentStatus: "Probation",
  employeeType: undefined,
  workLocation: undefined,
  confirmationDate: undefined,
  probationEndDate: undefined,
  role: "",
  accountStatus: "active",
  aadhar: "",
  pan: "",
  bankName: undefined,
  bankAccount: undefined,
  ifsc: undefined,
  qualification: "",
  specialization: "",
  previousInstitution: undefined,
  experienceYears: undefined,
};

function fieldGrid(children: React.ReactNode) {
  return <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">{children}</div>;
}

interface FacultyCreateWizardProps {
  /** Where "Cancel"/"Back to Faculty List"/"View Faculty" land — lets HR's
   *  wizard stay under /hr/... instead of hardcoding the admin route. */
  basePath?: string;
  /** localStorage key for the autosaved draft — kept separate per portal so
   *  an in-progress Admin draft never leaks into HR's wizard or vice versa. */
  draftKey?: string;
}

export function FacultyCreateWizard({
  basePath = "/admin/faculty",
  draftKey = CREATE_DRAFT_KEY,
}: FacultyCreateWizardProps = {}) {
  const router = useRouter();
  const { show } = useToast();
  const { data: departments } = useDepartments();
  const createFaculty = useCreateFaculty();

  const [stepIndex, setStepIndex] = useState(0);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [revealSensitive, setRevealSensitive] = useState(false);
  const [createdFaculty, setCreatedFaculty] = useState<Faculty | null>(null);

  // Which number-field's OTP dialog is open, plus which fields have already
  // been verified — keyed by field name, storing the value that was
  // verified so an edit to that field after verifying invalidates it again.
  const [otpTarget, setOtpTarget] = useState<"phone" | "whatsapp" | null>(null);
  const [verifiedFields, setVerifiedFields] = useState<Record<string, string>>({});

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [docType, setDocType] = useState("");
  const docFileRef = useRef<HTMLInputElement>(null);
  const [docFileName, setDocFileName] = useState("No file selected");

  const [qualDocuments, setQualDocuments] = useState<PendingDocument[]>([]);
  const [qualDocType, setQualDocType] = useState("");
  const qualDocFileRef = useRef<HTMLInputElement>(null);
  const [qualDocFileName, setQualDocFileName] = useState("No file selected");

  const {
    register,
    trigger,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FacultyWizardValues>({
    resolver: zodResolver(facultyWizardSchema),
    // Restores an in-progress draft (see the autosave effect below) so a
    // network drop or closed tab doesn't mean re-typing the whole form.
    defaultValues: getDraft<FacultyWizardValues>(draftKey) ?? DEFAULT_VALUES,
    // Errors only ever appear via the explicit trigger() calls in goToStep/
    // handleCreate below (this wizard doesn't use RHF's own handleSubmit),
    // so `reValidateMode` has no lifecycle to hook into — it only activates
    // once handleSubmit has run. liveClear() below is the real mechanism:
    // it re-validates a field on every keystroke, but only once it already
    // has an error, so it clears the instant the value becomes valid instead
    // of waiting for the next Next/Create Faculty click.
    mode: "onSubmit",
  });

  // Wraps register() so a field's error clears live as soon as its value
  // becomes valid — see the note on useForm above for why RHF's own
  // reValidateMode can't do this here.
  function liveClear(name: keyof FacultyWizardValues, options?: Parameters<typeof register>[1]) {
    const field = register(name, options);
    return {
      ...field,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        field.onChange(event);
        if (errors[name]) trigger(name);
      },
    };
  }

  const values = watch();
  const step = WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;
  const anyFieldTouched = Object.values(values).some((v) => typeof v === "string" && v.trim() !== "");

  // Notify once, on mount, if a draft was actually restored — computed via
  // a lazy useState initializer rather than re-reading localStorage here so
  // it only ever reflects what was there when the form first loaded, not
  // what's been autosaved since.
  const [hadDraft] = useState(() => getDraft<FacultyWizardValues>(draftKey) !== null);
  useEffect(() => {
    if (hadDraft) show("Restored your unsaved draft from earlier.", "info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosaves the draft locally so a network drop or closed tab doesn't
  // mean re-typing the whole form — debounced so it isn't writing to
  // localStorage on every single keystroke.
  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = setTimeout(() => saveDraft(draftKey, values), 500);
    return () => {
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    };
  }, [values, draftKey]);

  function stepperSubtext(stepId: string, index: number) {
    if (index === WIZARD_STEPS.length - 1) return "final step";
    const { filled, total } = getStepProgress(stepId, values);
    if (total === 0) return "optional";
    return `${filled} of ${total} filled`;
  }

  function openOtpDialog(field: "phone" | "whatsapp") {
    const value = values[field]?.trim();
    if (!value) {
      show("Enter a number first.", "error");
      return;
    }
    setOtpTarget(field);
  }

  function handleOtpVerified() {
    if (!otpTarget) return;
    setVerifiedFields((prev) => ({ ...prev, [otpTarget]: values[otpTarget] ?? "" }));
    show(`${otpTarget === "phone" ? "Phone" : "WhatsApp"} number verified.`, "success");
    setOtpTarget(null);
  }

  function renderVerifyButton(field: "phone" | "whatsapp") {
    const isVerified = !!values[field] && verifiedFields[field] === values[field];
    if (isVerified) {
      return (
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
          <CheckIcon className="h-3.5 w-3.5" /> Verified
        </span>
      );
    }
    return (
      <Button type="button" variant="secondary" onClick={() => openOtpDialog(field)}>
        <ShieldCheckIcon className="h-3.5 w-3.5" /> Verify
      </Button>
    );
  }

  async function goToStep(index: number) {
    if (index > stepIndex) {
      const fields = STEP_FIELDS[step.id];
      const valid = fields.length === 0 || (await trigger(fields));
      if (!valid) {
        show("Some fields on this step need attention.", "error");
        return;
      }
    }
    setStepIndex(Math.max(0, Math.min(WIZARD_STEPS.length - 1, index)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    if (anyFieldTouched) {
      setCancelConfirmOpen(true);
    } else {
      clearDraft(draftKey);
      router.push(basePath);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      show("Choose an image under 3 MB.", "error");
      return;
    }
    setValue("profilePhotoName", file.name);
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhotoDataUrl(null);
    setPhotoFile(null);
    setValue("profilePhotoName", "");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function isValidDocumentFile(file: File): boolean {
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
      show(`That file type isn't supported. Please upload a ${DOCUMENT_FORMAT_HINT} file.`, "error");
      return false;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      show(`That file is too large. Please upload a file ${DOCUMENT_FORMAT_HINT}.`, "error");
      return false;
    }
    return true;
  }

  function addDocument() {
    const file = docFileRef.current?.files?.[0];
    if (!docType || !file) {
      show("Choose a document type and a file first.", "error");
      return;
    }
    if (!isValidDocumentFile(file)) return;
    setDocuments((prev) => [...prev, { type: docType, fileName: file.name, file }]);
    setDocType("");
    setDocFileName("No file selected");
    if (docFileRef.current) docFileRef.current.value = "";
  }

  function addQualDocument() {
    const file = qualDocFileRef.current?.files?.[0];
    if (!qualDocType || !file) {
      show("Choose a document type and a file first.", "error");
      return;
    }
    if (!isValidDocumentFile(file)) return;
    setQualDocuments((prev) => [...prev, { type: qualDocType, fileName: file.name, file }]);
    setQualDocType("");
    setQualDocFileName("No file selected");
    if (qualDocFileRef.current) qualDocFileRef.current.value = "";
  }

  async function handleCreate() {
    const valid = await trigger();
    if (!valid) {
      show("Some required fields are missing. Please review each step.", "error");
      const firstErrorStep = WIZARD_STEPS.findIndex((s) =>
        STEP_FIELDS[s.id].some((f) => f in errors),
      );
      if (firstErrorStep >= 0) setStepIndex(firstErrorStep);
      return;
    }

    const v = getValues();
    // Profile photo, official email and account status still aren't
    // sendable — no backend field for a photo URL yet (needs file storage),
    // no official_email column, and CreateFacultyDto always creates as
    // active. Everything else now maps to real faculty columns.
    const payload: CreateFacultyInput = {
      email: v.personalEmail,
      first_name: v.firstName,
      last_name: v.lastName,
      designation: v.designation,
      department_id: v.departmentId!,
      phone: v.phone,
      date_of_joining: v.dateOfJoining,
      prefix: v.prefix,
      gender: v.gender,
      date_of_birth: v.dob,
      personal_email: v.personalEmail,
      whatsapp_number: v.whatsapp,
      alternate_phone: v.alternatePhone,
      address_line: v.addressLine,
      city: v.city,
      state: v.state,
      postal_code: v.pincode,
      academic_role: v.role,
      employment_status: EMPLOYMENT_STATUS_TO_ENUM[v.employmentStatus],
      employment_type: v.employeeType ? EMPLOYEE_TYPE_TO_ENUM[v.employeeType] : undefined,
      confirmation_date: v.confirmationDate,
      probation_end_date: v.probationEndDate,
      work_location: v.workLocation,
      qualification: v.qualification,
      specialization: v.specialization,
      previous_institution: v.previousInstitution,
      previous_experience_years: v.experienceYears ? Number(v.experienceYears) : undefined,
      phone_verified: !!v.phone && verifiedFields.phone === v.phone,
      whatsapp_verified: !!v.whatsapp && verifiedFields.whatsapp === v.whatsapp,
      sensitive_info: {
        aadhar_number: v.aadhar,
        pan_number: v.pan.toUpperCase(),
        bank_account_number: v.bankAccount,
        bank_ifsc: v.ifsc?.toUpperCase(),
        bank_name: v.bankName,
      },
    };

    createFaculty.mutate(payload, {
      onSuccess: async (faculty) => {
        clearDraft(draftKey);
        setCreatedFaculty(faculty);

        const uploads: Promise<unknown>[] = [];
        if (photoFile) {
          uploads.push(facultyFilesService.uploadPhoto(faculty.id, photoFile));
        }
        for (const doc of [...documents, ...qualDocuments]) {
          uploads.push(facultyFilesService.uploadDocument(faculty.id, doc.file, doc.type));
        }

        if (uploads.length === 0) {
          show("Faculty created.", "success");
          return;
        }

        const results = await Promise.allSettled(uploads);
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed === 0) {
          show("Faculty created — photo and documents uploaded.", "success");
        } else {
          show(
            `Faculty created, but ${failed} of ${uploads.length} file upload(s) failed. Retry from the edit page.`,
            "error",
          );
        }
      },
      onError: (err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      },
    });
  }

  if (createdFaculty) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h2 className="text-lg font-bold text-slate-900">Faculty created successfully</h2>
        <p className="mt-2 text-sm text-slate-500">
          {createdFaculty.first_name} {createdFaculty.last_name} has been added.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`${basePath}/${createdFaculty.id}`}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            View Faculty
          </Link>
          <Link
            href={basePath}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Faculty List
          </Link>
        </div>
      </div>
    );
  }

  const StepIcon = STEP_ICONS[step.id];

  return (
    <div>
      <div className="flex gap-6">
        <FacultyWizardStepper currentIndex={stepIndex} getSubtext={stepperSubtext} onStepClick={goToStep} />

        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">{step.label}</h2>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <StepIcon className="h-4 w-4" />
            </span>
          </div>

          <div className="flex flex-col gap-5 p-6">
            {step.id === "basic" && (
              <>
                <FormField label="Faculty ID" htmlFor="w-faculty-id">
                  <TextInput id="w-faculty-id" placeholder="FAC1020" disabled />
                  <p className="mt-1 text-xs text-slate-500">Generated automatically. Cannot be edited.</p>
                </FormField>

                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-700">
                    Profile photo <span className="font-normal text-slate-400">(optional)</span>
                  </p>
                  <FacultyPhotoPicker
                    photoDataUrl={photoDataUrl}
                    photoLabel={watch("profilePhotoName") || null}
                    initials={initialsOf({ first_name: watch("firstName"), last_name: watch("lastName") })}
                    tone={avatarToneFor(`${watch("firstName")}${watch("lastName")}` || "new-faculty")}
                    avatarClassName="h-21 w-21 rounded-lg text-2xl"
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
                    <FormField label="Title" htmlFor="w-prefix" required error={errors.prefix?.message}>
                      <SelectInput id="w-prefix" hasError={!!errors.prefix} {...liveClear("prefix")}>
                        <option value="">Select title</option>
                        {TITLE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                    <FormField label="Gender" htmlFor="w-gender" required error={errors.gender?.message}>
                      <SelectInput id="w-gender" hasError={!!errors.gender} {...liveClear("gender")}>
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
                    <FormField label="First name" htmlFor="w-first-name" required error={errors.firstName?.message}>
                      <TextInput
                        id="w-first-name"
                        placeholder="e.g. Kavitha"
                        hasError={!!errors.firstName}
                        {...liveClear("firstName")}
                      />
                    </FormField>
                    <FormField label="Last name" htmlFor="w-last-name" required error={errors.lastName?.message}>
                      <TextInput
                        id="w-last-name"
                        placeholder="e.g. Rajendran"
                        hasError={!!errors.lastName}
                        {...liveClear("lastName")}
                      />
                    </FormField>
                  </>,
                )}

                <FormField label="Date of birth" htmlFor="w-dob" hint="optional" error={errors.dob?.message}>
                  <TextInput
                    id="w-dob"
                    type="date"
                    max={todayDateInputValue()}
                    hasError={!!errors.dob}
                    {...liveClear("dob", textFieldOptions)}
                  />
                </FormField>
              </>
            )}

            {step.id === "contact" && (
              <>
                {fieldGrid(
                  <>
                    <FormField
                      label="Personal email"
                      htmlFor="w-personal-email"
                      required
                      hint="The only email on file until the official one is issued."
                      error={errors.personalEmail?.message}
                    >
                      <TextInput
                        id="w-personal-email"
                        type="email"
                        placeholder="name@example.com"
                        hasError={!!errors.personalEmail}
                        {...liveClear("personalEmail")}
                      />
                    </FormField>
                    <FormField label="Phone" htmlFor="w-phone" required error={errors.phone?.message}>
                      <div className="flex items-center gap-2">
                        <TextInput
                          id="w-phone"
                          type="tel"
                          placeholder="10-digit mobile number"
                          hasError={!!errors.phone}
                          {...liveClear("phone")}
                        />
                        {renderVerifyButton("phone")}
                      </div>
                    </FormField>
                  </>,
                )}

                {fieldGrid(
                  <>
                    <FormField label="WhatsApp number" htmlFor="w-whatsapp" required error={errors.whatsapp?.message}>
                      <div className="flex items-center gap-2">
                        <TextInput
                          id="w-whatsapp"
                          type="tel"
                          placeholder="10-digit mobile number"
                          hasError={!!errors.whatsapp}
                          {...liveClear("whatsapp")}
                        />
                        {renderVerifyButton("whatsapp")}
                      </div>
                    </FormField>
                    <FormField
                      label="Official email"
                      htmlFor="w-official-email"
                      hint="Usually issued by IT a few days after joining — add it once available."
                      error={errors.officialEmail?.message}
                    >
                      <TextInput
                        id="w-official-email"
                        type="email"
                        placeholder="firstname.lastname@sece.ac.in"
                        hasError={!!errors.officialEmail}
                        {...liveClear("officialEmail", textFieldOptions)}
                      />
                    </FormField>
                  </>,
                )}

                <FormField label="Alternate phone" htmlFor="w-alt-phone" error={errors.alternatePhone?.message}>
                  <TextInput
                    id="w-alt-phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    hasError={!!errors.alternatePhone}
                    {...liveClear("alternatePhone", textFieldOptions)}
                  />
                </FormField>

                <FormField label="Address" htmlFor="w-address" error={errors.addressLine?.message}>
                  <TextInput
                    id="w-address"
                    placeholder="House / street / area"
                    hasError={!!errors.addressLine}
                    {...liveClear("addressLine", textFieldOptions)}
                  />
                </FormField>

                {fieldGrid(
                  <>
                    <FormField label="City" htmlFor="w-city" error={errors.city?.message}>
                      <TextInput id="w-city" hasError={!!errors.city} {...liveClear("city", textFieldOptions)} />
                    </FormField>
                    <FormField label="State" htmlFor="w-state" error={errors.state?.message}>
                      <TextInput id="w-state" hasError={!!errors.state} {...liveClear("state", textFieldOptions)} />
                    </FormField>
                  </>,
                )}

                <FormField
                  label="Postal code"
                  htmlFor="w-pincode"
                  hint="6-digit PIN code"
                  error={errors.pincode?.message}
                >
                  <TextInput id="w-pincode" hasError={!!errors.pincode} {...liveClear("pincode", textFieldOptions)} />
                </FormField>
              </>
            )}

            {step.id === "employment" && (
              <>
                {fieldGrid(
                  <>
                    <FormField
                      label="Designation"
                      htmlFor="w-designation"
                      required
                      error={errors.designation?.message}
                    >
                      <SelectInput id="w-designation" hasError={!!errors.designation} {...liveClear("designation")}>
                        <option value="">Select designation</option>
                        {DESIGNATION_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                    <FormField label="Department" htmlFor="w-department" required error={errors.departmentId?.message}>
                      <SelectInput
                        id="w-department"
                        hasError={!!errors.departmentId}
                        {...liveClear("departmentId", numberFieldOptions)}
                      >
                        <option value="">Select department</option>
                        {departments?.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} — {d.name}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                  </>,
                )}

                {fieldGrid(
                  <>
                    <FormField
                      label="Date of joining"
                      htmlFor="w-doj"
                      required
                      error={errors.dateOfJoining?.message}
                    >
                      <TextInput
                        id="w-doj"
                        type="date"
                        hasError={!!errors.dateOfJoining}
                        {...liveClear("dateOfJoining")}
                      />
                    </FormField>
                    <FormField
                      label="Employment status"
                      htmlFor="w-employment-status"
                      required
                      error={errors.employmentStatus?.message}
                    >
                      <SelectInput
                        id="w-employment-status"
                        hasError={!!errors.employmentStatus}
                        {...liveClear("employmentStatus")}
                      >
                        {EMPLOYMENT_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                  </>,
                )}

                {fieldGrid(
                  <>
                    <FormField label="Employment type" htmlFor="w-employee-type" error={errors.employeeType?.message}>
                      <SelectInput id="w-employee-type" hasError={!!errors.employeeType} {...liveClear("employeeType")}>
                        <option value="">Select employment type</option>
                        {EMPLOYEE_TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                    <FormField label="Work location" htmlFor="w-work-location" error={errors.workLocation?.message}>
                      <TextInput
                        id="w-work-location"
                        placeholder="e.g. Main Campus — A Block"
                        hasError={!!errors.workLocation}
                        {...liveClear("workLocation", textFieldOptions)}
                      />
                    </FormField>
                  </>,
                )}

                {fieldGrid(
                  <>
                    <FormField
                      label="Confirmation date"
                      htmlFor="w-confirmation-date"
                      error={errors.confirmationDate?.message}
                    >
                      <TextInput
                        id="w-confirmation-date"
                        type="date"
                        hasError={!!errors.confirmationDate}
                        {...liveClear("confirmationDate", textFieldOptions)}
                      />
                    </FormField>
                    <FormField
                      label="Probation end date"
                      htmlFor="w-probation-end"
                      error={errors.probationEndDate?.message}
                    >
                      <TextInput
                        id="w-probation-end"
                        type="date"
                        hasError={!!errors.probationEndDate}
                        {...liveClear("probationEndDate", textFieldOptions)}
                      />
                    </FormField>
                  </>,
                )}
              </>
            )}

            {step.id === "account" && (
              <>
                {fieldGrid(
                  <>
                    <FormField label="Role" htmlFor="w-role" required error={errors.role?.message}>
                      <SelectInput id="w-role" hasError={!!errors.role} {...liveClear("role")}>
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
                      htmlFor="w-account-status"
                      required
                      hint="Controls system access — separate from employment status. New accounts start Active regardless of this setting until the backend supports it at creation."
                      error={errors.accountStatus?.message}
                    >
                      <SelectInput id="w-account-status" hasError={!!errors.accountStatus} {...liveClear("accountStatus")}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </SelectInput>
                    </FormField>
                  </>,
                )}
              </>
            )}

            {step.id === "identity" && (
              <>
                <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <ShieldCheckIcon className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Access-controlled information</p>
                    <p className="mt-0.5 text-amber-700">
                      Visible only to administrators. Never shown on the faculty list or in exports. Payroll details
                      can be added later if not on hand.
                    </p>
                  </div>
                </div>

                {fieldGrid(
                  <>
                    <FormField
                      label="Aadhaar number"
                      htmlFor="w-aadhar"
                      required
                      hint="12 digits, no spaces."
                      error={errors.aadhar?.message}
                    >
                      <TextInput
                        id="w-aadhar"
                        placeholder="12-digit Aadhaar number"
                        hasError={!!errors.aadhar}
                        {...liveClear("aadhar")}
                      />
                    </FormField>
                    <FormField label="PAN" htmlFor="w-pan" required error={errors.pan?.message}>
                      <TextInput id="w-pan" placeholder="ABCDE1234F" hasError={!!errors.pan} {...liveClear("pan")} />
                    </FormField>
                  </>,
                )}

                {fieldGrid(
                  <>
                    <FormField label="Bank name" htmlFor="w-bank-name" error={errors.bankName?.message}>
                      <TextInput
                        id="w-bank-name"
                        placeholder="e.g. State Bank of India"
                        hasError={!!errors.bankName}
                        {...liveClear("bankName", textFieldOptions)}
                      />
                    </FormField>
                    <FormField label="Bank account number" htmlFor="w-bank-account" error={errors.bankAccount?.message}>
                      <TextInput
                        id="w-bank-account"
                        hasError={!!errors.bankAccount}
                        {...liveClear("bankAccount", textFieldOptions)}
                      />
                    </FormField>
                  </>,
                )}

                <FormField label="IFSC code" htmlFor="w-ifsc" error={errors.ifsc?.message}>
                  <TextInput
                    id="w-ifsc"
                    placeholder="e.g. SBIN0007124"
                    hasError={!!errors.ifsc}
                    {...liveClear("ifsc", textFieldOptions)}
                  />
                </FormField>
              </>
            )}

            {step.id === "qualifications" && (
              <>
                {fieldGrid(
                  <>
                    <FormField
                      label="Highest qualification"
                      htmlFor="w-qualification"
                      required
                      error={errors.qualification?.message}
                    >
                      <SelectInput id="w-qualification" hasError={!!errors.qualification} {...liveClear("qualification")}>
                        <option value="">Select qualification</option>
                        {QUALIFICATION_OPTIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </SelectInput>
                    </FormField>
                    <FormField
                      label="Specialization"
                      htmlFor="w-specialization"
                      required
                      error={errors.specialization?.message}
                    >
                      <TextInput
                        id="w-specialization"
                        placeholder="e.g. Computer Science & Engineering"
                        hasError={!!errors.specialization}
                        {...liveClear("specialization")}
                      />
                    </FormField>
                  </>,
                )}

                {fieldGrid(
                  <>
                    <FormField
                      label="Institution / University"
                      htmlFor="w-previous-institution"
                      error={errors.previousInstitution?.message}
                    >
                      <TextInput
                        id="w-previous-institution"
                        placeholder="e.g. Anna University"
                        hasError={!!errors.previousInstitution}
                        {...liveClear("previousInstitution", textFieldOptions)}
                      />
                    </FormField>
                    <FormField
                      label="Previous experience (years)"
                      htmlFor="w-experience-years"
                      error={errors.experienceYears?.message}
                    >
                      <TextInput
                        id="w-experience-years"
                        type="number"
                        min={0}
                        placeholder="e.g. 5"
                        hasError={!!errors.experienceYears}
                        {...liveClear("experienceYears", textFieldOptions)}
                      />
                    </FormField>
                  </>,
                )}

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    Qualification &amp; experience documents <span className="font-normal text-slate-400">(optional)</span>
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectInput value={qualDocType} onChange={(e) => setQualDocType(e.target.value)}>
                      <option value="">Select document type</option>
                      {QUALIFICATION_DOCUMENT_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </SelectInput>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="secondary" onClick={() => qualDocFileRef.current?.click()}>
                        Choose file
                      </Button>
                      <span className="text-xs text-slate-500">{qualDocFileName}</span>
                      <input
                        ref={qualDocFileRef}
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => setQualDocFileName(e.target.files?.[0]?.name ?? "No file selected")}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Accepted formats: {DOCUMENT_FORMAT_HINT}.</p>
                  <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={addQualDocument}>
                    <PlusIcon className="h-3.5 w-3.5" /> Add qualification document
                  </Button>

                  <div className="mt-4 flex flex-col gap-2">
                    {qualDocuments.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No qualification or experience documents added yet. This step is optional.
                      </p>
                    )}
                    {qualDocuments.map((doc, i) => (
                      <div
                        key={`${doc.fileName}-${i}`}
                        className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileTextIcon className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{doc.fileName}</p>
                            <p className="text-xs text-slate-500">{doc.type}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setQualDocuments((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-red-600"
                          aria-label="Remove document"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step.id === "documents" && (
              <>
                <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  <FileTextIcon className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Optional — add now or later</p>
                    <p className="mt-0.5 text-blue-700">
                      Resume, ID proofs, certificates and other paperwork can be uploaded now or anytime after the
                      record is created.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectInput value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="">Select document type</option>
                    {DOCUMENT_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </SelectInput>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" onClick={() => docFileRef.current?.click()}>
                      Choose file
                    </Button>
                    <span className="text-xs text-slate-500">{docFileName}</span>
                    <input
                      ref={docFileRef}
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => setDocFileName(e.target.files?.[0]?.name ?? "No file selected")}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">Accepted formats: {DOCUMENT_FORMAT_HINT}.</p>
                <Button type="button" variant="secondary" size="sm" onClick={addDocument} className="self-start">
                  <PlusIcon className="h-3.5 w-3.5" /> Add document
                </Button>

                <div className="flex flex-col gap-2">
                  {documents.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No documents added yet. This step is optional — you can upload these later from the faculty
                      profile.
                    </p>
                  )}
                  {documents.map((doc, i) => (
                    <div
                      key={`${doc.fileName}-${i}`}
                      className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileTextIcon className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{doc.fileName}</p>
                          <p className="text-xs text-slate-500">{doc.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDocuments((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-red-600"
                        aria-label="Remove document"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step.id === "review" && (
              <ReviewStep
                values={values}
                departments={departments}
                documents={documents}
                qualDocuments={qualDocuments}
                revealSensitive={revealSensitive}
                onToggleReveal={() => setRevealSensitive((v) => !v)}
                onEditStep={goToStep}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-6">
        <div className="w-64 shrink-0" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pl-3">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button type="button" variant="secondary" onClick={() => goToStep(stepIndex - 1)}>
                <ChevronLeftIcon className="h-4 w-4" /> Back
              </Button>
            )}
            {isLastStep ? (
              <Button
                type="button"
                variant="primary"
                isPending={createFaculty.isPending}
                onClick={handleCreate}
                className="text-base"
              >
                <CheckIcon className="h-4 w-4" /> Create Faculty
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={() => goToStep(stepIndex + 1)} className="text-base">
                Next <ChevronRightIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Discard this new faculty record?"
        message="The information entered so far will be lost."
        confirmLabel="Discard"
        tone="danger"
        onConfirm={() => {
          clearDraft(draftKey);
          router.push(basePath);
        }}
        onClose={() => setCancelConfirmOpen(false)}
      />

      <OtpVerifyDialog
        open={otpTarget !== null}
        fieldLabel={otpTarget === "whatsapp" ? "WhatsApp number" : "mobile number"}
        channel={otpTarget === "whatsapp" ? "whatsapp" : "sms"}
        phoneNumber={otpTarget ? values[otpTarget] ?? "" : ""}
        onVerified={handleOtpVerified}
        onClose={() => setOtpTarget(null)}
      />
    </div>
  );
}

interface ReviewStepProps {
  values: FacultyWizardValues;
  departments?: { id: number; name: string; code: string }[];
  documents: PendingDocument[];
  qualDocuments: PendingDocument[];
  revealSensitive: boolean;
  onToggleReveal: () => void;
  onEditStep: (index: number) => void;
}

function orNotProvided(v?: string) {
  return v && v.trim() !== "" ? v : "Not provided";
}

function maskTail(v: string | undefined, keep: number) {
  if (!v) return "Not provided";
  if (v.length <= keep) return v;
  return `${"•".repeat(v.length - keep)}${v.slice(-keep)}`;
}

function ReviewCard({
  title,
  stepIndex,
  onEdit,
  rows,
}: {
  title: string;
  stepIndex: number;
  onEdit: (index: number) => void;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <button
          onClick={() => onEdit(stepIndex)}
          className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
        >
          <PencilIcon className="h-3 w-3" /> Edit
        </button>
      </div>
      <dl className="divide-y divide-slate-100 px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2.5 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ReviewStep({
  values,
  departments,
  documents,
  qualDocuments,
  revealSensitive,
  onToggleReveal,
  onEditStep,
}: ReviewStepProps) {
  const dept = departments?.find((d) => d.id === values.departmentId);
  const name = [values.prefix, values.firstName, values.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <CheckIcon className="h-5 w-5 shrink-0" />
        <p>
          Check every field below. Use Edit to jump back to any step. Fields left blank show as “Not provided” and
          can be filled in anytime from the faculty profile.
        </p>
      </div>

      <ReviewCard
        title="Basic Information"
        stepIndex={0}
        onEdit={onEditStep}
        rows={[
          ["Name", orNotProvided(name)],
          ["Gender", orNotProvided(values.gender)],
          ["Date of birth", orNotProvided(values.dob)],
          ["Profile photo", orNotProvided(values.profilePhotoName)],
        ]}
      />

      <ReviewCard
        title="Contact Information"
        stepIndex={1}
        onEdit={onEditStep}
        rows={[
          ["Personal email", orNotProvided(values.personalEmail)],
          ["Phone", orNotProvided(values.phone)],
          ["WhatsApp number", orNotProvided(values.whatsapp)],
          ["Official email", orNotProvided(values.officialEmail)],
          ["Alternate phone", orNotProvided(values.alternatePhone)],
          ["Address", orNotProvided(values.addressLine)],
          ["City", orNotProvided(values.city)],
          ["State", orNotProvided(values.state)],
          ["Postal code", orNotProvided(values.pincode)],
        ]}
      />

      <ReviewCard
        title="Employment Information"
        stepIndex={2}
        onEdit={onEditStep}
        rows={[
          ["Designation", orNotProvided(values.designation)],
          ["Department", dept ? `${dept.code} — ${dept.name}` : "Not provided"],
          ["Date of joining", orNotProvided(values.dateOfJoining)],
          ["Employment status", orNotProvided(values.employmentStatus)],
          ["Employment type", orNotProvided(values.employeeType)],
          ["Work location", orNotProvided(values.workLocation)],
          ["Confirmation date", orNotProvided(values.confirmationDate)],
          ["Probation end date", orNotProvided(values.probationEndDate)],
        ]}
      />

      <ReviewCard
        title="Account Information"
        stepIndex={3}
        onEdit={onEditStep}
        rows={[
          ["Role", orNotProvided(values.role)],
          ["Account status", values.accountStatus === "active" ? "Active" : "Inactive"],
        ]}
      />

      <div className="rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">Identity</h3>
          <div className="flex items-center gap-3">
            <button onClick={onToggleReveal} className="text-xs font-medium text-blue-700 hover:underline">
              {revealSensitive ? "Hide" : "Show"}
            </button>
            <button
              onClick={() => onEditStep(4)}
              className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
            >
              <PencilIcon className="h-3 w-3" /> Edit
            </button>
          </div>
        </div>
        <dl className="divide-y divide-slate-100 px-4">
          {[
            ["Aadhaar number", revealSensitive ? orNotProvided(values.aadhar) : maskTail(values.aadhar, 4)],
            ["PAN", revealSensitive ? orNotProvided(values.pan?.toUpperCase()) : maskTail(values.pan, 4)],
            ["Bank name", orNotProvided(values.bankName)],
            [
              "Bank account",
              revealSensitive ? orNotProvided(values.bankAccount) : maskTail(values.bankAccount, 4),
            ],
            ["IFSC", orNotProvided(values.ifsc?.toUpperCase())],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2.5 text-sm">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-mono font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ReviewCard
        title="Qualifications"
        stepIndex={5}
        onEdit={onEditStep}
        rows={[
          ["Highest qualification", orNotProvided(values.qualification)],
          ["Specialization", orNotProvided(values.specialization)],
          ["Institution / University", orNotProvided(values.previousInstitution)],
          ["Previous experience", values.experienceYears ? `${values.experienceYears} years` : "Not provided"],
        ]}
      />

      <div className="rounded-lg border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">Documents</h3>
          <button
            onClick={() => onEditStep(6)}
            className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
          >
            <PencilIcon className="h-3 w-3" /> Edit
          </button>
        </div>
        <div className="px-4 py-3">
          {documents.length === 0 && qualDocuments.length === 0 ? (
            <p className="text-sm text-slate-500">No documents added.</p>
          ) : (
            <dl className="divide-y divide-slate-100">
              {[...qualDocuments, ...documents].map((doc, i) => (
                <div key={`${doc.fileName}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
                  <dt className="text-slate-500">{doc.type}</dt>
                  <dd className="font-medium text-slate-900">{doc.fileName}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
