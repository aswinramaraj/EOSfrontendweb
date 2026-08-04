import { apiClient } from "@/shared/lib/api-client";
import type {
  Assignment,
  CreateAssignmentPayload,
  CreateLmsNotePayload,
  Exam,
  ExamMarkRecord,
  ExamSubjectMapping,
  ExamType,
  EnterExamMarksPayload,
  EnterExamMarksResult,
  LessonPlan,
  LmsNote,
  PaginatedResponse,
  StudentAssignmentStatus,
  UpdateLmsNotePayload,
  UpsertLessonPlanPayload,
  ValidateExamMarksResult,
} from "../types/academics.types";

export const lmsNotesService = {
  list(facultyId: number, token: string) {
    return apiClient.get<PaginatedResponse<LmsNote>>(`/me/lms-notes?faculty_id=${facultyId}&limit=100`, token);
  },

  create(payload: CreateLmsNotePayload, token: string) {
    return apiClient.post<LmsNote>(
      "/me/lms-notes",
      {
        subject_id: payload.subjectId,
        class_id: payload.classId,
        ...(payload.academicYear && { academic_year: payload.academicYear }),
        title: payload.title,
        ...(payload.fileUrl && { file_url: payload.fileUrl }),
      },
      token,
    );
  },

  update(id: number, payload: UpdateLmsNotePayload, token: string) {
    return apiClient.patch<LmsNote>(
      `/me/lms-notes/${id}`,
      { title: payload.title, file_url: payload.fileUrl },
      token,
    );
  },

  remove(id: number, token: string) {
    return apiClient.delete<{ id: number; deleted: boolean }>(`/me/lms-notes/${id}`, token);
  },
};

export const assignmentsService = {
  /** Auto-scoped server-side to the calling faculty — no faculty_id filter needed or accepted. */
  list(token: string) {
    return apiClient.get<PaginatedResponse<Assignment>>("/me/assignments?limit=100", token);
  },

  create(payload: CreateAssignmentPayload, token: string) {
    return apiClient.post<Assignment>(
      "/me/assignments",
      {
        class_id: payload.classId,
        subject_id: payload.subjectId,
        academic_year: payload.academicYear,
        semester: payload.semester,
        sequence_no: payload.sequenceNo,
        ...(payload.title && { title: payload.title }),
      },
      token,
    );
  },

  updateTitle(id: number, title: string, token: string) {
    return apiClient.patch<Assignment>(`/me/assignments/${id}`, { title }, token);
  },

  remove(id: number, token: string) {
    return apiClient.delete<{ id: number; deleted: boolean }>(`/me/assignments/${id}`, token);
  },
};

export const studentAssignmentStatusService = {
  /** No `/me/` prefix on this one — auto-scoped to the caller's own
   * assignments via a `where.assignments = {faculty_id}` join server-side,
   * unlike the other three modules' `/me/...` paths. */
  listForAssignment(assignmentId: number, token: string) {
    return apiClient.get<PaginatedResponse<StudentAssignmentStatus>>(
      `/student-assignment-status?assignment_id=${assignmentId}&limit=100`,
      token,
    );
  },

  create(assignmentId: number, studentId: number, isSubmitted: boolean, token: string) {
    return apiClient.post<StudentAssignmentStatus>(
      "/student-assignment-status",
      { assignment_id: assignmentId, student_id: studentId, is_submitted: isSubmitted },
      token,
    );
  },

  update(id: number, isSubmitted: boolean, token: string) {
    return apiClient.patch<StudentAssignmentStatus>(`/student-assignment-status/${id}`, { is_submitted: isSubmitted }, token);
  },
};

export const examBoardService = {
  /** Public, unauthenticated-by-design read endpoints (no @UseGuards on the
   * GET routes in EOS-backend) — COE-owned reference data that faculty only
   * ever reads, never writes. No pagination or filters exist on any of the
   * three, so each returns its full table; joined and filtered client-side
   * in academics.hooks.ts since no backend endpoint returns this pre-joined. */
  listExams(token: string) {
    return apiClient.get<Exam[]>("/exams", token);
  },

  listExamTypes(token: string) {
    return apiClient.get<ExamType[]>("/exam-types", token);
  },

  listExamSubjectMappings(token: string) {
    return apiClient.get<ExamSubjectMapping[]>("/exam-subject-mapping", token);
  },
};

export const examMarksService = {
  enterMarks(examSubjectMappingId: number, payload: EnterExamMarksPayload, token: string) {
    return apiClient.post<EnterExamMarksResult>(
      `/me/exams/${examSubjectMappingId}/marks`,
      {
        max_marks: payload.maxMarks,
        entries: payload.entries.map((entry) => ({ student_id: entry.studentId, marks_obtained: entry.marksObtained })),
      },
      token,
    );
  },

  validate(examSubjectMappingId: number, token: string) {
    return apiClient.post<ValidateExamMarksResult>(
      "/me/exam-marks/validate",
      { exam_subject_mapping_id: examSubjectMappingId },
      token,
    );
  },

  listForMapping(examSubjectMappingId: number, token: string) {
    return apiClient.get<PaginatedResponse<ExamMarkRecord>>(
      `/me/exam-marks?exam_subject_mapping_id=${examSubjectMappingId}&limit=100`,
      token,
    );
  },

  correctMark(id: number, marksObtained: number, token: string) {
    return apiClient.patch<ExamMarkRecord>(`/me/exam-marks/${id}`, { marks_obtained: marksObtained }, token);
  },
};

export const lessonPlansService = {
  list(facultyId: number, token: string) {
    return apiClient.get<PaginatedResponse<LessonPlan>>(`/me/lesson-plans?faculty_id=${facultyId}&limit=100`, token);
  },

  /** True upsert keyed on (faculty_id, subject_id, class_id, semester) —
   * covers both "create" and "update content" with one call, so the UI never
   * needs to know in advance whether a plan already exists. */
  upsert(payload: UpsertLessonPlanPayload, token: string) {
    return apiClient.put<LessonPlan>(
      "/me/lesson-plans",
      {
        subject_id: payload.subjectId,
        class_id: payload.classId,
        semester: payload.semester,
        content: payload.content,
      },
      token,
    );
  },

  remove(id: number, token: string) {
    return apiClient.delete<{ id: number; deleted: boolean }>(`/me/lesson-plans/${id}`, token);
  },
};
