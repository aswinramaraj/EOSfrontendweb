export type SectionStatus = "loading" | "error" | "empty" | "ready";

/** Pagination metadata is nested under `meta`, not flat alongside `data`
 * (api-contracts.md describes a flat shape, but that doc is stale relative to
 * the live backend — confirmed by calling the real endpoints). */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FacultyProfileDepartment {
  id: number;
  name: string;
  code: string;
}

/** GET /api/v1/me/faculty-profile — treated as optional enrichment; see dashboard.hooks.ts. */
export interface FacultyProfile {
  first_name: string;
  last_name: string;
  designation: string;
  department: FacultyProfileDepartment;
  date_of_joining: string | null;
  status: string;
  email: string;
  phone: string | null;
}

export interface AuthMeFacultyLink {
  id: number;
  first_name: string;
  last_name: string;
  designation: string;
  departments: FacultyProfileDepartment;
}

/** GET /api/v1/auth/me — only the fields this module reads. */
export interface AuthMeResponse {
  id: number;
  email: string;
  phone: string | null;
  status: string;
  faculty: AuthMeFacultyLink | null;
}

/** GET /api/v1/me/faculty-mapping — confirmed nested shape against the live backend. */
export interface FacultyMappingItem {
  id: number;
  academic_year: string;
  class: {
    id: number;
    section: string;
    department: FacultyProfileDepartment;
  };
  subject: {
    id: number;
    name: string;
    subject_code: string;
  };
}

export interface SubjectHandlingEntry {
  subjectName: string;
  subjectCode: string;
  departmentCode: string;
  section: string;
}

/** Composed view-model for the Faculty Profile dropdown, derived from several endpoints. */
export interface DashboardProfile {
  fullName: string;
  initials: string;
  designation: string;
  departmentName: string;
  departmentCode: string;
  email: string;
  phone: string | null;
  dateJoined: string | null;
  academicYear: string | null;
  semester: number | null;
  subjectsAllocated: number;
  todaysClassesCount: number;
  subjectsHandling: SubjectHandlingEntry[];
}

/** GET /api/v1/me/timetable-slots — generic CRUD response shape (per-slot). */
export interface TimetableSlot {
  id: number;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  academic_year: string;
  semester: number;
  class: {
    id: number;
    section: string;
    department: FacultyProfileDepartment;
  };
  subject: {
    id: number;
    name: string;
    subject_code: string;
  };
  faculty: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

/** Monday(1)..Saturday(6) — matches the backend's own day_of_week convention. This
 * dashboard's grid only ever renders Monday-Friday. */
export type DayOfWeekNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface TimetableCell {
  slotId: number;
  subjectId: number;
  subjectName: string;
  classId: number;
  classSection: string;
  departmentName: string;
  departmentCode: string;
  periodNumber: number;
  /** "HH:MM" (24h), derived client-side from the raw ISO timestamp. */
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: number;
  isCurrentPeriod: boolean;
  /** Only ever computed truthfully for today's row (attendance is only
   * meaningful for today) — always false for other days. */
  isAttendanceMarked: boolean;
}

export interface TimetableDayRow {
  dayOfWeek: DayOfWeekNumber;
  dayLabel: string;
  isToday: boolean;
  /** Keyed by period_number; null where the faculty has no class that period. */
  cellsByPeriod: Record<number, TimetableCell | null>;
}

export interface WeeklyTimetable {
  periodNumbers: number[];
  days: TimetableDayRow[];
  /** "Tuesday, 4 August 2026" — computed once the data has loaded, never during
   * the initial server-rendered pass, so it can never mismatch on hydration. */
  todayLabel: string;
}

export type AttendanceMarkStatus = "present" | "absent";

/** GET /api/v1/me/classes/:class_id/students — raw per-student shape. */
export interface ClassStudentRaw {
  id: number;
  student_id_no: string;
  roll_no: string | null;
  register_no: string | null;
  first_name: string | null;
  last_name: string | null;
}

/** GET /api/v1/me/classes/:class_id/students */
export interface ClassStudentsResponse {
  class_id: number;
  subject_id: number;
  total: number;
  students: ClassStudentRaw[];
}

/** Camel-cased view-model derived from ClassStudentRaw. */
export interface RosterStudent {
  id: number;
  studentIdNo: string;
  rollNo: string | null;
  registerNo: string | null;
  firstName: string | null;
  lastName: string | null;
}

/** GET /api/v1/me/attendance-records — only fields read here (used to detect
 * whether the active session's attendance has already been marked today). */
export interface AttendanceRecordResponse {
  id: number;
  date: string;
  status: AttendanceMarkStatus;
  subject: { id: number; name: string; subject_code: string } | null;
  student: {
    id: number;
    student_id_no: string;
    roll_no: string | null;
    first_name: string;
    last_name: string;
  };
}
