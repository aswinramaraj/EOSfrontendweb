// Raw shapes returned by the real backend (EOSbackend1). Kept separate from
// the display-oriented types in ./index.ts — pages map these into whatever
// shape their components already expect.

export interface ApiPaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiPaginated<T> {
  data: T[];
  meta: ApiPaginatedMeta;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type AppraisalRequestStatus =
  | "submitted"
  | "hod_reviewed"
  | "hr_scored"
  | "management_approved"
  | "rejected";
export type DepartmentAppraisalRollupStatus =
  | "not_started"
  | "in_progress"
  | "complete";

export interface ApiFacultyRef {
  id: number;
  prefix?: string | null;
  first_name: string;
  last_name: string;
  designation: string;
  profile_url?: string | null;
}

export interface ApiDepartmentRef {
  id: number;
  name: string;
}

// ---- /leave-types (reference data — managed directly in the database) ----

export interface LeaveType {
  id: number;
  name: string;
  default_annual_quota: number;
}

export interface LeaveTypeRef {
  id: number;
  name: string;
}

// ---- /hr/dashboard ----

export interface HrDepartmentRollup {
  id: number;
  name: string;
  code: string;
  total_faculty: number;
  on_leave_today: number;
  on_od_today: number;
  pending_requests: number;
  appraisal_status: DepartmentAppraisalRollupStatus;
}

export interface HrDashboardSummary {
  pending_requests_count: number;
  todays_leave_count: number;
  todays_od_count: number;
  pending_appraisals_count: number;
  payroll: {
    month: number;
    year: number;
    total_active_faculty: number;
    processed_count: number;
    completion_percent: number;
  };
  department_overview: HrDepartmentRollup[];
}

// ---- /hr/requests (unified leave + OD) ----

export interface HrUnifiedRequest {
  id: string;
  kind: "leave" | "od";
  source_id: number;
  faculty: ApiFacultyRef & { department: ApiDepartmentRef };
  from_date: string;
  to_date: string;
  detail: string | null;
  // Only ever set for kind "leave" — OD has no sub-type.
  leave_type: LeaveTypeRef | null;
  hod_approval_status: ApprovalStatus;
  hr_approval_status: ApprovalStatus;
  overall_status: ApprovalStatus;
  created_at: string;
}

export interface HrRequestsListParams {
  department_id?: number;
  faculty_id?: number;
  kind?: "leave" | "od";
  status?: ApprovalStatus;
  page?: number;
  limit?: number;
}

export interface CreateHrVacationEntryInput {
  faculty_id: number;
  kind: "leave" | "od";
  date: string;
  reason?: string;
  /** Only meaningful when kind is "leave" — FK into leave_types. */
  leave_type_id?: number;
}

// ---- /appraisal-divisions + /appraisal-criteria ----

export interface AppraisalDivision {
  id: number;
  name: string;
}

export interface AppraisalCriterion {
  id: number;
  division_id: number;
  criteria_name: string;
  max_score: number;
  academic_year: string;
  appraisal_divisions: AppraisalDivision;
}

export interface AppraisalCriteriaListParams {
  division_id?: number;
  academic_year?: string;
  page?: number;
  limit?: number;
}

export interface CreateAppraisalCriterionInput {
  division_id: number;
  criteria_name: string;
  max_score: number;
  academic_year: string;
}

// ---- /me/appraisal_requests (Employee Reviews) ----

export interface AppraisalEntry {
  id: number;
  description: string | null;
  score: number | null;
  criteria: {
    id: number;
    name: string;
    max_score: number;
    division: AppraisalDivision;
  };
}

export interface AppraisalRequest {
  id: number;
  academic_year: string;
  status: AppraisalRequestStatus;
  faculty: ApiFacultyRef;
  hod_reviewer: { id: number; email: string } | null;
  hod_reviewed_at: string | null;
  management_approver: { id: number; email: string } | null;
  management_approved_at: string | null;
  created_at: string;
  entries: AppraisalEntry[];
}

export interface AppraisalRequestsListParams {
  faculty_id?: number;
  academic_year?: string;
  status?: AppraisalRequestStatus;
  page?: number;
  limit?: number;
}

// ---- /me/hr-payroll ----

export interface HrPayrollRecord {
  id: number;
  month: string; // "YYYY-MM"
  year: number;
  month_number: number;
  gross_amount: number;
  net_amount: number;
  paid_at: string | null;
  faculty: ApiFacultyRef | null;
  processed_by: { id: number; email: string } | null;
}

export interface HrPayrollListParams {
  faculty_id?: number;
  month?: string; // "YYYY-MM"
  page?: number;
  limit?: number;
}

export interface CreateHrPayrollInput {
  faculty_id: number;
  month: string; // "YYYY-MM"
  basic_salary: number;
  hra: number;
  da: number;
  pf_deduction?: number;
  other_deductions?: number;
  paid_on?: string;
}

// ---- /me/payslip-requests ----

export type PayslipRequestStatus = "pending" | "processed" | "rejected";

export interface PayslipRequest {
  id: number;
  month: string; // "YYYY-MM"
  status: PayslipRequestStatus;
  file_url: string | null;
  requested_at: string;
  purpose: string | null;
  faculty: ApiFacultyRef & { department: ApiDepartmentRef };
}

export interface PayslipRequestsListParams {
  faculty_id?: number;
  month?: string; // "YYYY-MM"
  status?: PayslipRequestStatus;
  page?: number;
  limit?: number;
}

export interface UpdatePayslipRequestInput {
  status: "processed" | "rejected";
  /** Required when status is "processed" — the link to the generated payslip. */
  file_url?: string;
}
