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
  batch: { id: number; name: string } | null;
  class: { id: number; section: string } | null;
  course: { id: number; name: string; code: string } | null;
  department: { id: number; name: string } | null;
  quota: { id: number; name: string } | null;
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
