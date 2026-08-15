export type AttendanceMarkStatus = "present" | "absent" | "on_duty";

export interface RosterStudent {
  id: number;
  student_id_no: string;
  roll_no: string | null;
  first_name: string | null;
  last_name: string | null;
}

export interface AttendanceRecordSummary {
  id: number;
  status: AttendanceMarkStatus;
  student: { id: number };
  subject: { id: number; name: string } | null;
}

export interface CreateAttendanceInput {
  class_id: number;
  subject_id?: number;
  date: string;
  records: { student_id: number; status: AttendanceMarkStatus }[];
}

export interface CreateAttendanceResult {
  total_present: number;
  total_absent: number;
  total_on_duty: number;
  records: { id: number; student_id: number; status: AttendanceMarkStatus }[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
