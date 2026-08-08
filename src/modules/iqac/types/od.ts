import type { VerificationStatus } from "./common";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface EmailDetails {
  sender: string | null;
  receiver: string | null;
  subject: string | null;
  sent_at: string | null;
  body: string | null;
}

export interface StudentOdListItem {
  id: number;
  team_id: number;
  unique_code: string;
  member_count: number;
  creator: {
    id: number;
    student_id_no: string;
    name: string;
    section: string | null;
    department_id: number | null;
    department_name: string | null;
  };
  from_date: string;
  to_date: string;
  reason: string | null;
  organization: string | null;
  location: string | null;
  mentor_approval_status: ApprovalStatus;
  verification_status: VerificationStatus;
  photo_url: string | null;
  certificate_url: string | null;
  admin_remarks: string | null;
  created_at: string;
}

export interface StudentOdDetail extends StudentOdListItem {
  from_time: string | null;
  to_time: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_uploaded_at: string | null;
  certificate_uploaded_at: string | null;
  faculty_guide_name: string | null;
  email: EmailDetails;
  team_members: { student_id: number; name: string; student_id_no: string; section: string | null }[];
  hod_approvals: {
    id: number;
    status: ApprovalStatus;
    reviewed_at: string | null;
    department_name: string;
    student_name: string;
  }[];
}

export interface StudentOdListParams {
  department_id?: number;
  from?: string;
  to?: string;
  mentor_approval_status?: ApprovalStatus;
  verification_status?: VerificationStatus;
  page?: number;
  limit?: number;
}

export interface FacultyOd {
  id: number;
  from_date: string;
  to_date: string;
  place: string | null;
  purpose: string | null;
  hod_approval_status: ApprovalStatus;
  hr_approval_status: ApprovalStatus;
  overall_status: ApprovalStatus;
  organization_visited: string | null;
  students_guided: number | null;
  sanction_order: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  photo_uploaded_at: string | null;
  certificate_url: string | null;
  certificate_uploaded_at: string | null;
  verification_status: VerificationStatus;
  email: EmailDetails;
  admin_remarks: string | null;
  created_at: string;
  faculty: {
    id: number;
    first_name: string;
    last_name: string;
    designation: string;
    department_id: number;
    department_name: string;
  };
}

export interface FacultyOdListParams {
  department_id?: number;
  from?: string;
  to?: string;
  verification_status?: VerificationStatus;
  page?: number;
  limit?: number;
}

export interface VerifyOdInput {
  verification_status: VerificationStatus;
  admin_remarks?: string;
}
