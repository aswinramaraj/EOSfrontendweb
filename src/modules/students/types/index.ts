export interface StudentListItem {
  id: number;
  student_id_no: string;
  roll_no: string | null;
  register_no: string | null;
  admission_no: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  student_type: "hosteller" | "dayscholar";
  dayscholar_mode: "transport" | "own_vehicle" | null;
  status: "active" | "inactive";
  admission_date: string | null;
  created_at: string;
  photo_url: string | null;
  photo_uploaded_at: string | null;
  batch: { id: number; name: string } | null;
  class: { id: number; section: string; current_semester: number | null } | null;
  course: { id: number; name: string; code: string } | null;
  department: { id: number; name: string } | null;
  quota: { id: number; name: string } | null;
}

export interface StudentAddress {
  address_type: string;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

/**
 * GET /students/:id/edit-profile — mirrors AdminUpdateStudentDto's field list
 * (current value of every field the edit form can write), plus `addresses`
 * for the Addresses section — the one relation this endpoint includes
 * beyond the students table's own columns.
 */
export interface StudentEditProfile {
  roll_no: string | null;
  register_no: string | null;
  admission_no: string | null;
  admission_date: string | null;
  admission_type: string | null;
  joined_academic_year: string | null;
  gender: string | null;
  date_of_birth: string | null;
  student_type: "hosteller" | "dayscholar";
  dayscholar_mode: "transport" | "own_vehicle" | null;
  vehicle_number: string | null;
  course_id: number;
  quota_id: number;
  class_id: number | null;
  batch_id: number;
  status: "active" | "inactive";
  is_first_graduate: boolean;
  nationality: string | null;
  religion: string | null;
  community: string | null;
  caste: string | null;
  mother_tongue: string | null;
  blood_group: string | null;
  is_father_exserviceman: boolean;
  exserviceman_info: string | null;
  is_diff_abled: boolean;
  diff_abled_info: string | null;
  photo_url: string | null;
  addresses: StudentAddress[];
}

// class_id can only be assigned a real value through PATCH /students/:id
// (AdminUpdateStudentDto has no way to explicitly clear it back to null) —
// everything else can be omitted (unchanged) or overwritten. photo_url and
// addresses aren't writable through this endpoint at all — photo_url only
// ever changes via the dedicated photo upload/delete endpoints, and
// addresses have their own PATCH /students/:id/addresses (see
// UpdateStudentAddressesInput below).
export type UpdateStudentProfileInput = Partial<Omit<StudentEditProfile, "class_id" | "photo_url" | "addresses">> & {
  class_id?: number;
};

/** PATCH /students/:id/addresses — upserts by (student_id, address_type); "permanent"/"temporary" only. */
export interface UpdateStudentAddressesInput {
  addresses: Array<{
    address_type: string;
    address_line?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }>;
}

export interface StudentFamily {
  father_name: string | null;
  father_qualification: string | null;
  father_occupation: string | null;
  father_annual_income: string | null;
  father_email: string | null;
  father_mobile: string | null;
  mother_name: string | null;
  mother_qualification: string | null;
  mother_occupation: string | null;
  mother_annual_income: string | null;
  mother_email: string | null;
  mother_mobile: string | null;
}

export interface StudentProfileDetails {
  student_id_no: string;
  roll_no: string | null;
  register_no: string | null;
  course_name: string | null;
  quota_name: string | null;
  batch_name: string | null;
  class_section: string | null;
  student_type: "hosteller" | "dayscholar";
  gender: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  is_first_graduate: boolean | null;
  nationality: string | null;
  religion: string | null;
  community: string | null;
  mother_tongue: string | null;
  is_diff_abled: boolean | null;
  addresses: StudentAddress[];
  identity_marks: Array<{ mark_number: number; description: string }>;
  family_details: StudentFamily | null;
  contacts: {
    student_email1: string | null;
    student_email2: string | null;
    student_mobile: string | null;
  } | null;
}

export interface StudentLifecycle {
  application_submitted_at: string | null;
  application_status: string | null;
  admitted_at: string | null;
  current_status: "active" | "inactive";
  alumni_status: string | null;
  alumni_joined_at: string | null;
}

export interface StudentSubject {
  subject_id: number;
  name: string;
  subject_code: string;
  credits: number | null;
  semester: number;
}

export interface StudentExamMark {
  id: number;
  marks_obtained: string | null;
  max_marks: string;
  entered_at: string;
  exam_subject_mapping: {
    id: number;
    exam_id: number;
    subject_id: number;
    exams: {
      id: number;
      academic_year: string;
      semester: number;
      exam_types: { name: string } | null;
    };
    subjects: { id: number; name: string; subject_code: string };
  };
}

export interface StudentHostelResident {
  id: number;
  hostel: { id: number; name: string; code: string } | null;
  room: { id: number; room_number: string } | null;
  sharing: string | null;
  fee_status: "not_applicable" | "unpaid" | "partially_paid" | "paid";
  allocated_date: string | null;
  current_status: "in_hostel" | "on_leave";
}

export interface StudentPlacementHistoryItem {
  drive_id: number;
  company_name: string;
  scheduled_date: string;
  drive_status: string;
  application_status: string;
}

export interface StudentBorrowRecord {
  id: number;
  book: { id: number; title: string; qr_code: string | null };
  borrowed_date: string;
  due_date: string;
  returned_date: string | null;
  status: string;
  is_overdue: boolean;
  days_overdue: number;
  returned_late: boolean;
  fine_amount: number;
  fine_paid: boolean;
}

export interface StudentProjectsResponse {
  student_id: number;
  profile: {
    id: number;
    resume_url: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    leetcode_url: string | null;
    hackerrank_url: string | null;
    codeforces_url: string | null;
  } | null;
  projects: Array<{
    id: number;
    title: string;
    description: string | null;
    faculty: { id: number; first_name: string; last_name: string } | null;
  }>;
}

export interface StudentAttendanceSummary {
  overall: { total_days: number; present: number; absent: number; percentage: number };
  by_subject: Array<{ subject_id: number; subject_name: string; total: number; present: number; percentage: number }>;
  records: Array<{ attendance_date: string; subject_id: number | null; status: "present" | "absent" }>;
}

export interface StudentAttendanceTerm {
  semester: number;
  from: string;
  to: string;
  working_days: number;
  present: number;
  absent: number;
  percentage: number;
  /** Real periods configured in this class's timetable (1..N) — empty if no timetable exists for the class. */
  periods: number[];
  days: Array<{
    date: string;
    subjects: Array<{ subject_id: number | null; subject_name: string; status: "present" | "absent" }>;
    lost: number;
    /** One entry per `periods` — status is null where no timetable slot or no attendance data covers that period. */
    period_marks: Array<{ period_number: number; subject_name: string | null; status: "present" | "absent" | null }>;
  }>;
  absences: Array<{ date: string; subjects_missed: string[]; lost: number; running_total: number }>;
}

export interface StudentRequestItem {
  type: "leave" | "outing" | "bonafide" | "od";
  id: number;
  label: string;
  from_date: string | null;
  to_date: string | null;
  detail: string | null;
  status: string;
  created_at: string;
}

export interface StudentAnnouncement {
  id: number;
  title: string;
  content: string;
  target_audience: string;
  created_at: string;
}

export interface StudentCertificate {
  id: number;
  certificate_type_id: number;
  certificate_name: string;
  is_available: boolean;
  file_url: string | null;
  verified_at: string | null;
}

export interface StudentTransport {
  route: { id: number; name: string } | null;
  boarding_stage: { id: number; stage_name: string; fee_amount: string } | null;
  destination_stage: { id: number; stage_name: string } | null;
}

export interface StudentMedicalVisit {
  id: number;
  visit_date: string;
  reason: string | null;
  diagnosis: string | null;
  treatment_given: string | null;
  referred_to_hospital: boolean;
  attended_by: { name: string; designation: string | null } | null;
}

export interface FeeSummary {
  total_demand: string;
  total_paid: string;
  total_outstanding: string;
  due_status: "paid" | "partial" | "pending";
}

export interface StudentFeeWorkspace {
  student_profile: {
    student_id: number;
    student_name: string | null;
    register_number: string | null;
    admission_no: string | null;
    student_id_no: string;
    programme: string;
    department: string;
    batch: string;
    quota: string;
    gender: string | null;
    status: string;
  };
  fee_summary: FeeSummary;
  demand_summary: Array<{
    student_fee_demand_mapping_id: number;
    fee_structure_name: string;
    academic_year: string;
    semester: number | null;
    total_amount: string;
    paid_amount: string;
    outstanding_amount: string;
    due_status: "paid" | "partial" | "pending";
  }>;
  payment_summary: {
    payment_count: number;
    total_paid: string;
    last_payment_date: string | null;
  };
}

export interface StudentsListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentsListResponse {
  data: StudentListItem[];
  meta: StudentsListMeta;
}

export interface ListStudentsParams {
  page?: number;
  limit?: number;
  q?: string;
  batch_id?: number;
  course_id?: number;
  class_id?: number;
  quota_id?: number;
  department_id?: number;
  status?: "active" | "inactive";
  student_type?: "hosteller" | "dayscholar";
}
