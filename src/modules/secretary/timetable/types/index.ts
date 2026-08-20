export interface TimetableSlot {
  id: number;
  day_of_week: number; // 1 = Monday ... 6 = Saturday
  period_number: number;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  academic_year: string;
  semester: number;
  class: { id: number; section: string; department: { id: number; name: string; code: string } };
  subject: { id: number; name: string; subject_code: string };
  faculty: { id: number; first_name: string; last_name: string; designation: string };
}

export interface SchoolClass {
  id: number;
  batch_id: number;
  department_id: number;
  course_id: number;
  section: string;
  current_semester: number | null;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface Batch {
  id: number;
  name: string;
  start_year: number;
  end_year: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
