export type FacultyStatus = "active" | "inactive";

export interface FacultyDepartmentRef {
  id: number;
  name: string;
  code?: string;
}

export interface FacultySensitiveInfo {
  aadhar_number?: string | null;
  pan_number?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  bank_name?: string | null;
}

// Fields below `created_at` were added once the lead created the extended
// faculty columns (see FACULTY_MODULE_UPDATE.md) — GET /me/faculty/:id now
// returns them, but GET /me/faculty (the list) still doesn't select them.
export interface Faculty {
  id: number;
  email: string;
  phone?: string | null;
  first_name: string;
  last_name: string;
  designation: string;
  department_id: number;
  department?: FacultyDepartmentRef | null;
  date_of_joining?: string | null;
  status: FacultyStatus;
  sensitive_info?: FacultySensitiveInfo | null;
  created_at?: string;
  profile_url?: string | null;
  prefix?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  personal_email?: string | null;
  whatsapp_number?: string | null;
  alternate_phone?: string | null;
  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  academic_role?: string | null;
  employment_status?: string | null;
  employment_type?: string | null;
  confirmation_date?: string | null;
  probation_end_date?: string | null;
  work_location?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  previous_institution?: string | null;
  previous_experience_years?: number | null;
  office_room?: string | null;
  is_mentor?: boolean;
  phone_verified?: boolean;
  whatsapp_verified?: boolean;
}

// Optional fields shared by create/update — mirrors the backend's
// FacultyExtendedFieldsDto.
export interface FacultyExtendedFields {
  prefix?: string;
  gender?: string;
  date_of_birth?: string;
  personal_email?: string;
  whatsapp_number?: string;
  alternate_phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  academic_role?: string;
  employment_status?: string;
  employment_type?: string;
  confirmation_date?: string;
  probation_end_date?: string;
  work_location?: string;
  qualification?: string;
  specialization?: string;
  previous_institution?: string;
  previous_experience_years?: number;
  office_room?: string;
  phone_verified?: boolean;
  whatsapp_verified?: boolean;
}

export interface FacultyActivityEntry {
  id: number;
  description: string;
  created_at: string;
  created_by_email: string | null;
}

export interface FacultyDocument {
  id: number;
  document_type: string;
  file_name: string;
  uploaded_at: string;
  /** Signed URL — short-lived (the documents bucket is private); re-fetch the
   *  list to refresh it. Null when the underlying file object couldn't be
   *  found in storage (e.g. a record with no real upload behind it). */
  url: string | null;
}

export interface FacultyAttendanceDay {
  date: string;
  day: string;
  punch_in: string | null;
  punch_out: string | null;
  status: string;
}

export interface FacultyAttendanceStats {
  full_days: number;
  half_days: number;
  absent: number;
  // Vacation and OD are excused — excluded from the % calculation entirely.
  // Every other kind of approved leave (on_leave) counts against it exactly
  // like an unexplained absence.
  on_leave: number;
  on_duty: number;
  on_vacation: number;
  attendance_percentage: number;
}

export type FacultyAttendanceStatus =
  | "full_day"
  | "half_day"
  | "absent"
  | "on_duty"
  | "on_leave"
  | "weekly_off"
  | "holiday";

export interface MarkFacultyAttendanceInput {
  status: FacultyAttendanceStatus;
  punch_in?: string;
  punch_out?: string;
}

export interface MarkFacultyAttendanceResult {
  faculty_id: number;
  date: string;
  status: FacultyAttendanceStatus;
  punch_in: string | null;
  punch_out: string | null;
}

export interface FacultyAttendanceMonth extends FacultyAttendanceStats {
  month: string;
  label: string;
  days: FacultyAttendanceDay[];
}

export interface FacultyAttendanceSummary {
  faculty_id: number;
  overall: FacultyAttendanceStats;
  months: FacultyAttendanceMonth[];
}

export interface FacultyAttendanceOverviewRow extends FacultyAttendanceStats {
  faculty_id: number;
  prefix?: string | null;
  first_name: string;
  last_name: string;
  profile_url?: string | null;
  department: FacultyDepartmentRef | null;
  today_status?: string | null;
  is_unaccounted_absent_today?: boolean;
}

export interface FacultyAttendanceOverview {
  today: FacultyAttendanceStats;
  rows: FacultyAttendanceOverviewRow[];
}

export interface FacultyAttendanceOverviewParams {
  department_id?: number;
  academic_year?: string;
  search?: string;
}

export interface FacultyIdCardStatus {
  issued: boolean;
  lastIssuedAt: string | null;
  issueCount: number;
}

export interface FacultyListParams {
  department_id?: number;
  status?: FacultyStatus;
  designation?: string;
  year?: number;
  search?: string;
  employment_status?: string;
  limit?: number;
  page?: number;
}

// Confirmed live against the backend's shared `paginate()` helper — total
// is nested under `meta`, not flat alongside `data` (same shape as
// FacultyMappingListResponse).
export interface FacultyListResponse {
  data: Faculty[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateFacultyInput extends FacultyExtendedFields {
  email: string;
  first_name: string;
  last_name: string;
  designation: string;
  department_id: number;
  phone?: string;
  date_of_joining?: string;
  sensitive_info?: FacultySensitiveInfo;
}

export interface UpdateFacultyInput extends FacultyExtendedFields {
  first_name?: string;
  last_name?: string;
  designation?: string;
  department_id?: number;
  date_of_joining?: string;
  status?: FacultyStatus;
  phone?: string;
  sensitive_info?: FacultySensitiveInfo;
}
