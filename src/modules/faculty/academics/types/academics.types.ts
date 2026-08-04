import type { PaginatedResponse } from "../../dashboard/types/dashboard.types";

export type { PaginatedResponse };

/** A single (subject, class, academic_year) combination this faculty teaches
 * — the same shape as `FacultyMappingItem` from the dashboard module, reused
 * here as the source of truth for every "which class/subject" dropdown in
 * this module, so faculty can only ever create records for classes they
 * actually teach (the backend enforces this too; this just avoids a
 * guaranteed-403 round trip). */
export interface AcademicsMappingOption {
  id: number;
  academicYear: string;
  classId: number;
  classSection: string;
  departmentCode: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
}

// ───────────────────────────── LMS Notes ─────────────────────────────

export interface LmsNoteClassInfo {
  id: number;
  section: string;
  department: { id: number; name: string; code: string };
}

export interface LmsNoteSubjectInfo {
  id: number;
  name: string;
  subject_code: string;
}

export interface LmsNoteFacultyInfo {
  id: number;
  first_name: string;
  last_name: string;
  designation: string;
}

/** GET/POST/PATCH /api/v1/me/lms-notes(/:id) response shape. */
export interface LmsNote {
  id: number;
  title: string;
  file_url: string | null;
  uploaded_at: string;
  class: LmsNoteClassInfo;
  subject: LmsNoteSubjectInfo;
  faculty: LmsNoteFacultyInfo;
}

export interface CreateLmsNotePayload {
  subjectId: number;
  classId: number;
  academicYear?: string;
  title: string;
  fileUrl?: string;
}

export interface UpdateLmsNotePayload {
  title?: string;
  fileUrl?: string;
}

// ───────────────────────────── Assignments ─────────────────────────────

export interface AssignmentClassInfo {
  id: number;
  section: string;
}

export interface AssignmentSubjectInfo {
  id: number;
  name: string;
  subject_code: string;
}

/** GET/POST/PATCH /api/v1/me/assignments(/:id) response shape — auto-scoped
 * to the calling faculty server-side. */
export interface Assignment {
  id: number;
  academic_year: string;
  semester: number;
  sequence_no: number;
  title: string | null;
  class: AssignmentClassInfo;
  subject: AssignmentSubjectInfo;
}

export interface CreateAssignmentPayload {
  classId: number;
  subjectId: number;
  academicYear: string;
  semester: number;
  sequenceNo: number;
  title?: string;
}

/** GET/POST/PATCH /api/v1/student-assignment-status(/:id) response shape —
 * one row per (assignment, student) once a faculty has marked it; there is
 * no bulk-create, each is created/updated individually. Note: no `/me/`
 * prefix on this controller, unlike the other three modules. */
export interface StudentAssignmentStatus {
  id: number;
  is_submitted: boolean;
  marked_at: string | null;
  assignment: {
    id: number;
    sequence_no: number;
    title: string | null;
    academic_year: string;
    semester: number;
    class: { id: number; section: string };
    subject: { id: number; name: string; subject_code: string };
  };
  student: { id: number; student_id_no: string; name: string };
  marked_by_faculty: { id: number; first_name: string; last_name: string } | null;
}

// ───────────────────────────── CA Marks (Exam Marks) ─────────────────────────────

/** GET /api/v1/exam-types — public, no faculty scoping. */
export interface ExamType {
  id: number;
  name: string;
}

/** GET /api/v1/exams — public, no faculty scoping. */
export interface Exam {
  id: number;
  exam_type_id: number;
  batch_id: number;
  academic_year: string;
  semester: number;
  status: string;
}

/** GET /api/v1/exam-subject-mapping — public, no faculty scoping, no joins
 * (bare foreign keys only) — COE-created, faculty only ever reads these. */
export interface ExamSubjectMapping {
  id: number;
  exam_id: number;
  class_id: number;
  subject_id: number;
}

/** Client-side composition of the three read-only endpoints above, filtered
 * down to just the mappings whose (subject_id, class_id) this faculty
 * actually teaches — there is no backend endpoint that returns this joined
 * view directly. */
export interface FacultyExamBoardRow {
  examSubjectMappingId: number;
  examId: number;
  examTypeName: string;
  academicYear: string;
  semester: number;
  classId: number;
  classSection: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  examStatus: string;
}

export interface EnterExamMarksEntry {
  studentId: number;
  marksObtained: number;
}

export interface EnterExamMarksPayload {
  maxMarks: number;
  entries: EnterExamMarksEntry[];
}

/** POST /api/v1/me/exams/:exam_subject_mapping_id/marks response. */
export interface EnterExamMarksResult {
  exam_subject_mapping_id: number;
  entered: number;
}

/** POST /api/v1/me/exam-marks/validate response — stateless completeness
 * check only, nothing is persisted server-side. */
export interface ValidateExamMarksResult {
  exam_subject_mapping_id: number;
  total_students: number;
  entered: number;
  validated: boolean;
  missing_student_ids: number[];
}

export interface ExamMarkExamInfo {
  id: number;
  type: string;
  academic_year: string;
  semester: number;
}

/** GET/PATCH /api/v1/me/exam-marks(/:id) response shape — marks_obtained and
 * max_marks are Prisma Decimal columns, which serialize to JSON as strings. */
export interface ExamMarkRecord {
  id: number;
  marks_obtained: string;
  max_marks: string;
  entered_at: string;
  student: { id: number; student_id_no: string; name: string };
  exam_subject_mapping_id: number;
  class: { id: number; section: string };
  subject: { id: number; name: string; subject_code: string };
  exam: ExamMarkExamInfo;
}

// ───────────────────────────── Lesson Plans ─────────────────────────────

export interface LessonPlanClassInfo {
  id: number;
  section: string;
  department: { id: number; name: string; code: string };
}

export interface LessonPlanSubjectInfo {
  id: number;
  name: string;
  subject_code: string;
}

export interface LessonPlanFacultyInfo {
  id: number;
  first_name: string;
  last_name: string;
  designation: string;
}

/** GET/POST/PUT/PATCH /api/v1/me/lesson-plans(/:id) response shape. Content
 * is a single evolving free-text document per (faculty, subject, class,
 * semester) — there are no unit/topic sub-records on this backend. */
export interface LessonPlan {
  id: number;
  semester: number;
  content: string | null;
  updated_at: string;
  class: LessonPlanClassInfo;
  subject: LessonPlanSubjectInfo;
  faculty: LessonPlanFacultyInfo;
}

export interface UpsertLessonPlanPayload {
  subjectId: number;
  classId: number;
  semester: number;
  content: string;
}
