import {
  AlertTriangleIcon,
  CertificateIcon,
  ClipboardIcon,
  EyeIcon,
  FileTextIcon,
  HomeIcon,
  IdCardIcon,
  LayersIcon,
  LinkIcon,
  MapPinIcon,
  PeopleIcon,
  PersonIcon,
  PhoneIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserCheckIcon,
} from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { TextInput } from "@/shared/components/ui/TextInput";
import { ApiError } from "@/shared/lib/api-client";
import type { Category, FieldGroup, FieldSpec } from "../config/wizardSections";
import type { CreatePerfectEntryInput } from "../types";

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  application: FileTextIcon,
  identity: IdCardIcon,
  placement: LayersIcon,
  personal: PersonIcon,
  residence: HomeIcon,
  addresses: MapPinIcon,
  contacts: PhoneIcon,
  sensitive: ShieldCheckIcon,
  family: PeopleIcon,
  counselling: ClipboardIcon,
  marks: EyeIcon,
  certificates: CertificateIcon,
  profiles: LinkIcon,
  review: UserCheckIcon,
};

export const vkey = (categoryId: string, fieldKey: string) => `${categoryId}.${fieldKey}`;

export function parseShowWhen(expr: string): [string, string | undefined] {
  const [key, expected] = expr.split("=");
  return [key, expected];
}

/**
 * A showWhen target field's own defaultValue counts as its current value
 * until the admin actually touches it — e.g. a bool field defaulting to
 * "false" must resolve as "false" here even though `values` has no entry
 * for it yet (an untouched checkbox is stored nowhere, not as "false").
 * Without this, a field gated on `showWhen: "otherKey=false"` would stay
 * hidden until the admin toggled otherKey on and back off once.
 */
function resolveShowWhenValue(category: Category, key: string, values: Record<string, string>): string {
  const stored = values[vkey(category.id, key)];
  if (stored !== undefined) return stored;
  for (const group of category.groups ?? []) {
    const field = group.fields.find((f) => f.key === key);
    if (field?.defaultValue !== undefined) return field.defaultValue;
  }
  return "";
}

export function isFieldVisible(category: Category, field: FieldSpec, values: Record<string, string>): boolean {
  if (!field.showWhen) return true;
  const [key, expected] = parseShowWhen(field.showWhen);
  const current = resolveShowWhenValue(category, key, values);
  return expected !== undefined ? current === expected : !!current && current !== "false";
}

export function isGroupVisible(category: Category, group: FieldGroup, values: Record<string, string>): boolean {
  if (!group.showWhen) return true;
  const [key, expected] = parseShowWhen(group.showWhen);
  const current = resolveShowWhenValue(category, key, values);
  return expected !== undefined ? current === expected : !!current && current !== "false";
}

/** Every field a save would actually look at — honours group- and field-level showWhen, skips disabled/readonly. */
export function liveFields(category: Category, values: Record<string, string>): FieldSpec[] {
  const out: FieldSpec[] = [];
  (category.groups ?? []).forEach((group) => {
    if (!isGroupVisible(category, group, values)) return;
    group.fields.forEach((field) => {
      if (field.type === "disabled" || field.type === "readonly") return;
      if (!isFieldVisible(category, field, values)) return;
      out.push(field);
    });
  });
  return out;
}

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const AADHAAR_RE = /^\d{4}-?\d{4}-?\d{4}$/;
const PAN_RE = /^[A-Za-z]{5}\d{4}[A-Za-z]$/;

export function validateField(field: FieldSpec, raw: string): string | null {
  const value = raw.trim();
  if (!value) return field.required ? `${field.label} is required.` : null;
  if (field.max && (field.type === "text" || field.type === "textarea" || field.type === "password") && value.length > field.max) {
    return `${value.length} characters — max is ${field.max}.`;
  }
  if (field.key === "aadhar_number") return AADHAAR_RE.test(value) ? null : "12 digits, optionally grouped with dashes.";
  if (field.key === "pan_number") return PAN_RE.test(value.toUpperCase()) ? null : "Five letters, four digits, one letter.";
  if (field.key === "perm_pincode" || field.key === "temp_pincode") {
    return /^\d{6}$/.test(value) ? null : "Exactly 6 digits.";
  }
  if (field.key === "joined_academic_year") {
    return /^\d{4}-\d{4}$/.test(value) ? null : "Format: YYYY-YYYY, e.g. 2026-2027.";
  }
  if (field.key === "password") {
    return value.length >= 6 ? null : "At least 6 characters — the backend rejects anything shorter.";
  }
  switch (field.type) {
    case "email":
      return EMAIL_RE.test(value) ? null : "Not a valid email address.";
    case "tel":
      return /^\d{10}$/.test(value) ? null : "Exactly 10 digits.";
    case "date":
      return Number.isNaN(Date.parse(value)) ? "Unreadable date." : null;
    case "decimal": {
      if (!/^\d+(\.\d{1,2})?$/.test(value)) return "A number with up to two decimal places.";
      return Number(value) > 100 ? "Cannot exceed 100." : null;
    }
    case "money":
      return /^\d+(\.\d{1,2})?$/.test(value.replace(/[₹,\s]/g, "")) ? null : "Not an amount.";
    case "lookup":
      return field.required && !value ? `${field.label} is required.` : null;
    default:
      return null;
  }
}

export interface CategoryStats {
  total: number;
  filled: number;
  missingRequired: FieldSpec[];
}

export function categoryStats(
  category: Category,
  values: Record<string, string>,
  marks: string[],
  certificateTypeIds: number[] = [],
): CategoryStats {
  if (category.review) return { total: 0, filled: 0, missingRequired: [] };
  if (category.repeat) {
    const filled = marks.filter((m) => m.trim()).length;
    return { total: marks.length, filled, missingRequired: [] };
  }
  if (category.disabledStub) return { total: 0, filled: 0, missingRequired: [] };
  if (category.checklist) {
    const filled = certificateTypeIds.filter(
      (id) => values[vkey(category.id, `${id}_available`)] === "true",
    ).length;
    return { total: certificateTypeIds.length, filled, missingRequired: [] };
  }
  const fields = liveFields(category, values);
  const missingRequired: FieldSpec[] = [];
  let filled = 0;
  fields.forEach((f) => {
    const v = (values[vkey(category.id, f.key)] ?? f.defaultValue ?? "").trim();
    if (v && v !== "false") filled++;
    if (f.required && !v) missingRequired.push(f);
  });
  return { total: fields.length, filled, missingRequired };
}

export type LookupOptions = Record<string, Array<{ value: string; label: string }>>;

export function toNumber(raw: string | undefined): number | undefined {
  const v = raw?.trim();
  if (!v) return undefined;
  const n = Number(v.replace(/[₹,\s]/g, ""));
  return Number.isNaN(n) ? undefined : n;
}

export function buildPerfectEntryPayload(
  values: Record<string, string>,
  marks: string[],
  certificateTypeIds: number[] = [],
): CreatePerfectEntryInput {
  const gi = (key: string) => values[vkey("identity", key)]?.trim() || undefined;
  const gp = (key: string) => values[vkey("placement", key)]?.trim() || undefined;
  const gper = (key: string) => values[vkey("personal", key)]?.trim() || undefined;
  const gr = (key: string) => values[vkey("residence", key)]?.trim() || undefined;
  const gc = (key: string) => values[vkey("counselling", key)]?.trim() || undefined;
  const gs = (key: string) => values[vkey("sensitive", key)]?.trim() || undefined;
  const gf = (key: string) => values[vkey("family", key)]?.trim() || undefined;
  const gco = (key: string) => values[vkey("contacts", key)]?.trim() || undefined;
  const ga = (key: string) => values[vkey("addresses", key)]?.trim() || undefined;
  const gcert = (typeId: number, field: string) => values[vkey("certificates", `${typeId}_${field}`)]?.trim();
  const boolOf = (v: string | undefined) => (v === "true" ? true : v === "false" ? false : undefined);

  // Omit a type entirely if nothing was recorded for it — "not ticked, not
  // attached" isn't the same fact as "ticked false", and the backend
  // shouldn't get a row for a checklist item nobody touched.
  const certificates: CreatePerfectEntryInput["certificates"] = certificateTypeIds
    .map((typeId) => {
      const availableRaw = gcert(typeId, "available");
      const fileUrl = gcert(typeId, "file_url");
      if (availableRaw === undefined && !fileUrl) return undefined;
      return {
        certificate_type_id: typeId,
        is_available: availableRaw === "true" || !!fileUrl,
        file_url: fileUrl,
      };
    })
    .filter((c): c is NonNullable<typeof c> => !!c);

  const sensitiveInfo =
    gs("aadhar_number") || gs("pan_number")
      ? { aadhar_number: gs("aadhar_number"), pan_number: gs("pan_number") }
      : undefined;

  const identityMarks = marks
    .map((description, i) => ({ mark_number: i + 1, description: description.trim() || undefined }))
    .filter((m) => m.description);

  const familyFields = {
    father_name: gf("father_name"),
    father_qualification: gf("father_qualification"),
    father_occupation: gf("father_occupation"),
    father_annual_income: toNumber(gf("father_annual_income")),
    father_email: gf("father_email"),
    father_mobile: gf("father_mobile"),
    mother_name: gf("mother_name"),
    mother_qualification: gf("mother_qualification"),
    mother_occupation: gf("mother_occupation"),
    mother_annual_income: toNumber(gf("mother_annual_income")),
    mother_email: gf("mother_email"),
    mother_mobile: gf("mother_mobile"),
  };
  const familyDetails = Object.values(familyFields).some((v) => v !== undefined) ? familyFields : undefined;

  const contactFields = {
    student_email1: gco("student_email1"),
    student_email2: gco("student_email2"),
    student_mobile: gco("student_mobile"),
  };
  const contacts = Object.values(contactFields).some((v) => v !== undefined) ? contactFields : undefined;

  const addresses: CreatePerfectEntryInput["addresses"] = [];
  if (ga("perm_address_line") || ga("perm_city") || ga("perm_state") || ga("perm_pincode")) {
    addresses.push({
      address_type: "permanent",
      address_line: ga("perm_address_line"),
      city: ga("perm_city"),
      state: ga("perm_state"),
      pincode: ga("perm_pincode"),
    });
  }
  if (ga("temp_address_line") || ga("temp_city") || ga("temp_state") || ga("temp_pincode")) {
    addresses.push({
      address_type: "temporary",
      address_line: ga("temp_address_line"),
      city: ga("temp_city"),
      state: ga("temp_state"),
      pincode: ga("temp_pincode"),
    });
  }

  const studentType = (gr("student_type") as "hosteller" | "dayscholar" | undefined) ?? "dayscholar";
  const dayscholarMode = gr("dayscholar_mode") as "transport" | "own_vehicle" | undefined;

  // Toggle on: omit password entirely so the backend generates its own
  // random 6-digit code (see SoaApplicationsService.generateNumericPassword)
  // — the typed field is hidden via showWhen in this same case, so there's
  // nothing to send anyway.
  const autoGeneratePassword = boolOf(gi("auto_generate_password")) === true;

  return {
    email: gi("email") ?? "",
    password: autoGeneratePassword ? undefined : gi("password"),
    course_id: Number(gp("course")),
    quota_id: Number(gp("quota")),
    batch_id: Number(gp("batch")),
    student_id_no: gi("student_id_no") ?? "",
    roll_no: gi("roll_no"),
    register_no: gi("register_no"),
    admission_no: gi("admission_no"),
    admission_date: gi("admission_date"),
    admission_type: gi("admission_type"),
    joined_academic_year: gi("joined_academic_year"),
    gender: gper("gender"),
    date_of_birth: gper("date_of_birth"),
    blood_group: gper("blood_group"),
    mother_tongue: gper("mother_tongue"),
    nationality: gper("nationality"),
    religion: gper("religion"),
    community: gper("community"),
    caste: gper("caste"),
    is_first_graduate: boolOf(gper("is_first_graduate")),
    is_diff_abled: boolOf(gper("is_diff_abled")),
    diff_abled_info: boolOf(gper("is_diff_abled")) ? gper("diff_abled_info") : undefined,
    is_father_exserviceman: boolOf(gper("is_father_exserviceman")),
    exserviceman_info: boolOf(gper("is_father_exserviceman")) ? gper("exserviceman_info") : undefined,
    student_type: studentType,
    dayscholar_mode: studentType === "dayscholar" ? dayscholarMode : undefined,
    vehicle_number: dayscholarMode === "own_vehicle" ? gr("vehicle_number") : undefined,
    transport_stage_id: dayscholarMode === "transport" ? toNumber(gr("transport_stage_id")) : undefined,
    hostel_room_type_id: studentType === "hosteller" ? toNumber(gr("hostel_room_type_id")) : undefined,
    counselling_order_no: gc("counselling_order_no"),
    counselling_rank_no: gc("counselling_rank_no"),
    govt_quota_admission_no: gc("govt_quota_admission_no"),
    joined_through: gc("joined_through"),
    knew_institution_by: gc("knew_institution_by"),
    nominee: gc("nominee"),
    sensitive_info: sensitiveInfo,
    identity_marks: identityMarks.length ? identityMarks : undefined,
    family_details: familyDetails,
    contacts,
    addresses: addresses.length ? addresses : undefined,
    photo_url: gi("photo_url"),
    certificates: certificates.length ? certificates : undefined,
  };
}

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "This email is already registered to another account.",
  STUDENT_ID_NO_ALREADY_EXISTS: "This student ID is already in use.",
  ADMISSION_NO_ALREADY_EXISTS: "This admission number is already in use.",
  COURSE_NOT_FOUND: "The selected course no longer exists — pick another.",
  QUOTA_NOT_FOUND: "The selected quota no longer exists — pick another.",
  BATCH_NOT_FOUND: "The selected batch no longer exists — pick another.",
  TRANSPORT_STAGE_NOT_FOUND: "The selected transport stage no longer exists — pick another.",
  HOSTEL_ROOM_TYPE_NOT_FOUND: "The selected room type no longer exists — pick another.",
  PERFECT_ENTRY_ALREADY_DONE: "This application has already been completed.",
  PERFECT_ENTRY_NOT_ALLOWED: "The application isn't in the right state to complete admission.",
  INVALID_CUTOFF_RANGE: "A cut-off mark must be between 0 and 100.",
  MISSING_CONDITIONAL_FIELD: "A required field for the chosen residence type is missing.",
  APPLICATION_NOT_EDITABLE: "This application can no longer be edited from its current status.",
  APPLICATION_NOT_DELETABLE: "Only applications still in 'applied' status can be deleted.",
  SOA_APPLICATION_NOT_FOUND: "This application no longer exists.",
  INVALID_STATUS_TRANSITION: "That status change isn't allowed from here.",
  ADMIN_PASSWORD_INCORRECT: "That's not your current password.",
};

export function friendlyError(err: unknown): string {
  if (err instanceof ApiError) return ERROR_MESSAGES[err.errorCode] ?? err.message;
  return "Something went wrong. Please try again.";
}

export function DisabledStub({ reason }: { reason: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
      <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <p>{reason}</p>
    </div>
  );
}

export function CategoryHead({ category }: { category: Category }) {
  const Icon = CATEGORY_ICONS[category.id];
  return (
    <div className="flex items-start gap-3 p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900">{category.label}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{category.lead}</p>
      </div>
    </div>
  );
}

export function CategoryForm({
  category,
  values,
  errors,
  lookupOptions,
  setValue,
}: {
  category: Category;
  values: Record<string, string>;
  errors: Record<string, string>;
  lookupOptions: LookupOptions;
  setValue: (categoryId: string, fieldKey: string, val: string, clears?: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {(category.groups ?? [])
        .filter((g) => isGroupVisible(category, g, values))
        .map((group, gi) => (
          <div key={gi}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{group.label}</h3>
              {group.copyFromPrefix && (
                <button
                  type="button"
                  className="text-xs font-medium text-blue-700 hover:underline"
                  onClick={() => {
                    group.fields.forEach((f) => {
                      if (!f.key.startsWith(group.copyFromPrefix!.to)) return;
                      const fromKey = group.copyFromPrefix!.from + f.key.slice(group.copyFromPrefix!.to.length);
                      const v = values[vkey(category.id, fromKey)] ?? "";
                      setValue(category.id, f.key, v);
                    });
                  }}
                >
                  {group.copyFromPrefix.label}
                </button>
              )}
            </div>
            {group.hint && <p className="mb-3 text-xs text-slate-500">{group.hint}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.fields
                .filter((f) => isFieldVisible(category, f, values))
                .map((field) => (
                  <FieldRow
                    key={field.key}
                    categoryId={category.id}
                    field={field}
                    value={values[vkey(category.id, field.key)] ?? field.defaultValue ?? ""}
                    error={errors[vkey(category.id, field.key)]}
                    lookupOptions={field.lookup ? lookupOptions[field.lookup] : field.key === "department" ? lookupOptions.department : undefined}
                    onChange={(val, clears) => setValue(category.id, field.key, val, clears)}
                    wide={field.type === "textarea" || field.type === "bool"}
                  />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export function FieldRow({
  categoryId,
  field,
  value,
  error,
  lookupOptions,
  onChange,
  wide,
}: {
  categoryId: string;
  field: FieldSpec;
  value: string;
  error?: string;
  lookupOptions?: Array<{ value: string; label: string }>;
  onChange: (val: string, clears?: string[]) => void;
  wide?: boolean;
}) {
  if (field.type === "disabled") {
    return (
      <div className={wide ? "sm:col-span-2" : undefined}>
        <label className="text-sm font-medium text-slate-400">{field.label}</label>
        <div
          className="mt-1.5 flex items-start gap-2 rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400"
          title={field.disabledReason}
        >
          <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{field.disabledReason}</span>
        </div>
      </div>
    );
  }

  if (field.type === "readonly") {
    return (
      <div className={wide ? "sm:col-span-2" : undefined}>
        <label className="text-sm font-medium text-slate-700">{field.label}</label>
        <div className="mt-1.5 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {field.readonlyValue}
        </div>
        {field.hint && <p className="mt-1 text-xs text-slate-500">{field.hint}</p>}
      </div>
    );
  }

  if (field.type === "bool") {
    return (
      <label className="flex items-start gap-2.5 sm:col-span-2">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
        />
        <span className="text-sm text-slate-700">{field.label}</span>
      </label>
    );
  }

  const id = `f-${vkey(categoryId, field.key)}`;

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      <div className="mt-1.5">
        {field.type === "textarea" ? (
          <textarea
            id={id}
            rows={3}
            value={value}
            maxLength={field.max}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              error ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
          />
        ) : field.type === "select" ? (
          <SelectInput id={id} value={value} hasError={!!error} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select {field.label.toLowerCase()}</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </SelectInput>
        ) : field.type === "lookup" ? (
          <SelectInput id={id} value={value} hasError={!!error} onChange={(e) => onChange(e.target.value, field.key === "department" ? ["course"] : [])}>
            <option value="">
              {(lookupOptions ?? []).length ? `Select ${field.label.toLowerCase()}` : "Nothing to choose from yet"}
            </option>
            {(lookupOptions ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectInput>
        ) : (
          <TextInput
            id={id}
            type={
              field.type === "date"
                ? "date"
                : field.type === "email"
                  ? "email"
                  : field.type === "tel"
                    ? "tel"
                    : field.type === "password"
                      ? "password"
                      : "text"
            }
            value={value}
            maxLength={field.type === "text" || field.type === "password" ? field.max : undefined}
            placeholder={field.placeholder}
            hasError={!!error}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={field.type === "password" ? "new-password" : undefined}
          />
        )}
      </div>
      {field.hint && !error && <p className="mt-1 text-xs text-slate-500">{field.hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function RepeatPanel({
  spec,
  marks,
  setMarks,
}: {
  spec: NonNullable<Category["repeat"]>;
  marks: string[];
  setMarks: (fn: (m: string[]) => string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {marks.map((desc, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-medium text-slate-500">
              {spec.rowLabel} {i + 1}
            </span>
            <TextInput
              value={desc}
              maxLength={spec.fieldMax}
              placeholder={spec.fieldPlaceholder}
              onChange={(e) =>
                setMarks((m) => {
                  const next = [...m];
                  next[i] = e.target.value;
                  return next;
                })
              }
            />
            {marks.length > 1 && (
              <button
                type="button"
                aria-label={`Remove ${spec.rowLabel} ${i + 1}`}
                onClick={() => setMarks((m) => m.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {marks.length < spec.max ? (
          <Button variant="secondary" size="sm" onClick={() => setMarks((m) => [...m, ""])}>
            <PlusIcon className="h-4 w-4" /> {spec.addLabel}
          </Button>
        ) : (
          <span className="text-xs text-slate-500">{spec.note}</span>
        )}
      </div>
    </div>
  );
}
