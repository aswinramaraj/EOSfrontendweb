export type SoaStatus = "applied" | "fees_paid" | "admission_confirmed" | "cancelled";

export interface SoaApplication {
  id: number;
  first_name: string;
  last_name: string | null;
  status: SoaStatus;
  created_at: string;
}

export interface CreateSoaApplicationInput {
  first_name: string;
  last_name?: string;
  father_name?: string;
  mother_name?: string;
  parent_contact?: string;
  student_contact?: string;
  student_whatsapp?: string;
  student_email?: string;
  cutoff_physics?: number;
  cutoff_chemistry?: number;
  cutoff_maths?: number;
  community?: string;
}

export interface TransportStage {
  id: number;
  route_id: number;
  stage_name: string;
  sequence_no: number;
  fee_amount: string;
}

export interface HostelRoomType {
  id: number;
  name: string;
}

export interface SensitiveInfoInput {
  aadhar_number?: string;
  pan_number?: string;
}

export interface IdentityMarkInput {
  mark_number: number;
  description?: string;
}

export interface FamilyDetailsInput {
  father_name?: string;
  father_qualification?: string;
  father_occupation?: string;
  father_annual_income?: number;
  father_email?: string;
  father_mobile?: string;
  mother_name?: string;
  mother_qualification?: string;
  mother_occupation?: string;
  mother_annual_income?: number;
  mother_email?: string;
  mother_mobile?: string;
}

export interface PerfectEntryContactsInput {
  student_email1?: string;
  student_email2?: string;
  student_mobile?: string;
}

export interface PerfectEntryAddressInput {
  address_type: "permanent" | "temporary";
  address_line?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface PerfectEntryCertificateInput {
  certificate_type_id: number;
  is_available: boolean;
  file_url?: string;
}

export interface CreatePerfectEntryInput {
  email: string;
  /** Omit to have the backend auto-generate a random 6-digit numeric code (the wizard's "Auto-generate" toggle). */
  password?: string;
  course_id: number;
  quota_id: number;
  batch_id: number;
  student_id_no: string;
  roll_no?: string;
  register_no?: string;
  admission_no?: string;
  admission_date?: string;
  admission_type?: string;
  joined_academic_year?: string;
  gender?: string;
  date_of_birth?: string;
  student_type: "hosteller" | "dayscholar";
  dayscholar_mode?: "transport" | "own_vehicle";
  vehicle_number?: string;
  transport_stage_id?: number;
  hostel_room_type_id?: number;
  is_first_graduate?: boolean;
  nationality?: string;
  religion?: string;
  community?: string;
  caste?: string;
  mother_tongue?: string;
  blood_group?: string;
  is_father_exserviceman?: boolean;
  exserviceman_info?: string;
  is_diff_abled?: boolean;
  diff_abled_info?: string;
  counselling_order_no?: string;
  counselling_rank_no?: string;
  govt_quota_admission_no?: string;
  joined_through?: string;
  knew_institution_by?: string;
  nominee?: string;
  sensitive_info?: SensitiveInfoInput;
  identity_marks?: IdentityMarkInput[];
  family_details?: FamilyDetailsInput;
  contacts?: PerfectEntryContactsInput;
  addresses?: PerfectEntryAddressInput[];
  photo_url?: string;
  certificates?: PerfectEntryCertificateInput[];
}

export interface CertificateType {
  id: number;
  name: string;
}

export interface UploadedDocument {
  certificate_type_id: number;
  file_url: string;
  preview_url: string;
}

export interface PerfectEntryResult {
  id: number;
  student_id_no: string;
  roll_no: string | null;
  register_no: string | null;
  admission_no: string | null;
  soa_application_id: number;
  user_id: number;
  /** The plaintext login password — typed by the admin or auto-generated, either way shown exactly once here (password_hash is one-way). */
  password: string;
  /** Best-effort SMS delivery of the credentials above — see SmsService; `sent: false` is expected until a real provider is configured. */
  sms: { sent: boolean; note: string };
}

export interface SoaApplicationLinkedStudent {
  id: number;
  student_id_no: string;
}

export interface SoaApplicationDraftSummary {
  saved_categories: string[];
  updated_at: string;
}

export interface SoaApplicationDetail extends SoaApplication {
  father_name: string | null;
  mother_name: string | null;
  parent_contact: string | null;
  student_contact: string | null;
  student_whatsapp: string | null;
  student_email: string | null;
  cutoff_physics: string | null;
  cutoff_chemistry: string | null;
  cutoff_maths: string | null;
  community: string | null;
  students: SoaApplicationLinkedStudent | null;
  admission_profile_drafts: SoaApplicationDraftSummary | null;
}

export interface ListSoaApplicationsParams {
  q?: string;
  status?: SoaStatus;
  has_draft?: boolean;
  page?: number;
  limit?: number;
}

export interface SoaApplicationsListResponse {
  data: SoaApplicationDetail[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type UpdateSoaApplicationInput = Partial<CreateSoaApplicationInput>;

export interface ProfileDraft {
  values: Record<string, string>;
  marks: string[];
  saved_categories: string[];
  updated_at: string;
}

export interface SaveProfileDraftInput {
  values: Record<string, string>;
  marks: string[];
  saved_categories: string[];
}
