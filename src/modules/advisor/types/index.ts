export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Mentee classes / dashboard ──────────────────────────────────────────────

export interface MenteeClassStudent {
  id: number;
  student_id_no: string;
  name: string;
}

export interface MenteeClass {
  class_id: number;
  label: string;
  section: string;
  department: { id: number; name: string; code: string };
  academic_year: string;
  students: MenteeClassStudent[];
}

export interface AdvisorDashboardClass {
  class_id: number;
  label: string;
  academic_year: string;
  student_count: number;
}

export interface AdvisorDashboardAnnouncement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  posted_by: string;
}

export interface AdvisorDashboard {
  classes: AdvisorDashboardClass[];
  total_students: number;
  low_attendance_count: number;
  pending_leave_count: number;
  pending_od_count: number;
  recent_announcements: AdvisorDashboardAnnouncement[];
}

// ── Class result (My Students / Class Results) ─────────────────────────────

export interface MenteeClassResultStudent {
  id: number;
  name: string;
  student_id_no: string;
  roll_no: string | null;
  register_no: string | null;
  attendance_percent: number | null;
  cgpa: number | null;
  arrears: number;
  mentor_name: string;
  guardian_name: string | null;
  guardian_relation: "Father" | "Mother" | null;
  contact: string | null;
}

export interface MenteeClassResult {
  class: { id: number; label: string };
  department: { id: number; name: string; code: string };
  academic_year: string;
  mentor: { id: number; name: string };
  students: MenteeClassResultStudent[];
}

// ── Student profile ─────────────────────────────────────────────────────────

export interface MenteeProfile {
  id: number;
  name: string;
  student_id_no: string;
  roll_no: string | null;
  register_no: string | null;
  admission_no: string | null;
  email: string;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  student_type: string;
  dayscholar_mode: string | null;
  vehicle_number: string | null;
  nationality: string | null;
  religion: string | null;
  community: string | null;
  caste: string | null;
  mother_tongue: string | null;
  blood_group: string | null;
  is_first_graduate: boolean;
  is_father_exserviceman: boolean;
  exserviceman_info: string | null;
  is_diff_abled: boolean;
  diff_abled_info: string | null;
  course: { id: number; name: string; code: string };
  quota: { id: number; name: string };
  class: { id: number; section: string; department: { id: number; name: string; code: string } } | null;
  batch: { id: number; name: string; start_year: number; end_year: number };
  addresses: {
    id: number;
    address_type: string;
    address_line: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
  }[];
  identity_marks: { id: number; mark_number: number; description: string | null }[];
  family_details: {
    father_name: string | null;
    father_qualification: string | null;
    father_occupation: string | null;
    father_annual_income: string | number | null;
    father_email: string | null;
    father_mobile: string | null;
    mother_name: string | null;
    mother_qualification: string | null;
    mother_occupation: string | null;
    mother_annual_income: string | number | null;
    mother_email: string | null;
    mother_mobile: string | null;
  } | null;
  contacts: {
    student_email1: string | null;
    student_email2: string | null;
    student_mobile: string | null;
  } | null;
  profile_links: {
    resume_url: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    leetcode_url: string | null;
    hackerrank_url: string | null;
    codeforces_url: string | null;
  } | null;
  projects: { id: number; title: string; description: string | null }[];
}

export interface MenteeReport {
  id: number;
  student_id_no: string;
  name: string;
  official_email: string;
  unofficial_email: string | null;
  unofficial_email_alt: string | null;
  student_mobile: string | null;
  father: { name: string | null; mobile: string | null; email: string | null };
  mother: { name: string | null; mobile: string | null; email: string | null };
  aadhar_number: string | null;
  pan_number: string | null;
}

export interface MenteePlacement {
  drive_id: number;
  company_name: string | null;
  is_disclosed: boolean;
  scheduled_date: string;
  application_status: string;
  updated_at: string;
}

export interface ExamType {
  id: number;
  name: string;
  code: string | null;
}

// ── Subjects (for attendance/marks entry dropdowns) ────────────────────────

export interface MappingSubject {
  id: number;
  academic_year: string;
  subject: { id: number; name: string; subject_code: string };
}

// ── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceMark = "present" | "absent";

export interface MarkClassAttendanceInput {
  subject_id: number;
  academic_year?: string;
  attendance_date: string;
  records: { student_id: number; status: AttendanceMark }[];
}

export interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  subject_id: number | null;
  date: string;
  status: AttendanceMark;
  marked_by_faculty_id: number | null;
}

// ── CIA marks ────────────────────────────────────────────────────────────────

export interface MenteeClassMarksSubject {
  exam_subject_mapping_id: number;
  subject: { id: number; name: string; subject_code: string };
  exam: { id: number; title: string | null; type: { id: number; name: string } };
}

export interface MenteeClassMarksStudent {
  id: number;
  name: string;
  student_id_no: string;
  marks: {
    exam_subject_mapping_id: number;
    marks_obtained: number | null;
    max_marks: number | null;
    is_absent: boolean;
  }[];
}

export interface MenteeClassMarks {
  subjects: MenteeClassMarksSubject[];
  students: MenteeClassMarksStudent[];
}

export interface BulkMarkInput {
  exam_subject_mapping_id: number;
  max_marks: number;
  items: { student_id: number; marks_obtained?: number; is_absent?: boolean }[];
}

// ── Leave / On-Duty ──────────────────────────────────────────────────────────

export type LeaveStatus = "pending" | "faculty_approved" | "hod_approved" | "rejected";

export interface StudentLeave {
  id: number;
  student_id: number;
  student: {
    id: number;
    student_id_no: string;
    name: string;
    section: string | null;
    department_name: string | null;
  };
  from_date: string;
  to_date: string;
  reason: string | null;
  status: LeaveStatus;
  approved_by_faculty_id: number | null;
  approved_by_hod_user_id: number | null;
  created_at: string;
}

export type OdApprovalStatus = "pending" | "approved" | "rejected";

export interface StudentOd {
  id: number;
  team_id: number;
  unique_code: string;
  member_count: number;
  creator: {
    id: number;
    student_id_no: string;
    name: string;
    section: string | null;
    department_name: string | null;
  };
  from_date: string;
  to_date: string;
  from_time: string | null;
  to_time: string | null;
  reason: string | null;
  faculty_guide_name: string | null;
  mentor_approval_status: OdApprovalStatus;
  hod_approval_status: string | null;
  created_at: string;
}

// ── No-Due ───────────────────────────────────────────────────────────────────

export interface NoDueFeeLine {
  category: string;
  cleared: boolean;
  pending_amount: number;
}

export interface NoDueStudent {
  id: number;
  name: string;
  student_id_no: string;
  roll_no: string | null;
  register_no: string | null;
  section: string | null;
  fees: NoDueFeeLine[];
  library: { cleared: boolean; pending_amount: number };
  total_pending: number;
  override_approved: boolean;
}

// ── Announcements ────────────────────────────────────────────────────────────

export type AnnouncementAudience = "parents" | "teachers" | "students";
export type AnnouncementStatus = "draft" | "published";

export interface Announcement {
  id: number;
  posted_by_user_id: number;
  title: string;
  content: string;
  target_audience: AnnouncementAudience;
  status: AnnouncementStatus;
  created_at: string;
  file_url: string | null;
  file_name: string | null;
  class_ids: number[];
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  target_audience: AnnouncementAudience;
  class_ids: number[];
  status?: AnnouncementStatus;
}

export interface AssignedClassOption {
  id: number;
  label: string;
}

// Faculty's own profile (name/department/designation/contact) is handled by
// modules/faculty — see FacultyOwnProfile/UpdateOwnProfileInput there.
