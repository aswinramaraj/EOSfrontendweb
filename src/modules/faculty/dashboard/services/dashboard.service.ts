import { apiClient } from "@/shared/lib/api-client";
import type {
  AttendanceMarkStatus,
  AttendanceRecordResponse,
  AuthMeResponse,
  ClassStudentsResponse,
  FacultyMappingItem,
  FacultyProfile,
  PaginatedResponse,
  TimetableSlot,
} from "../types/dashboard.types";

export const facultyProfileService = {
  getAuthMe(token: string) {
    return apiClient.get<AuthMeResponse>("/auth/me", token);
  },

  /** Optional enrichment only — see dashboard.hooks.ts for why callers must not
   * treat a rejection here as fatal. */
  getMyProfile(token: string) {
    return apiClient.get<FacultyProfile>("/me/faculty-profile", token);
  },

  /** Also used for the "Subjects Handling" list in the profile dropdown, not
   * just the `meta.total` count — confirmed nested subject/class/department
   * shape against the live backend. */
  getFacultyMapping(facultyId: number, token: string) {
    return apiClient.get<PaginatedResponse<FacultyMappingItem>>(
      `/me/faculty-mapping?faculty_id=${facultyId}&limit=50`,
      token,
    );
  },
};

export const timetableService = {
  getMyTimetableSlots(facultyId: number, token: string) {
    return apiClient.get<PaginatedResponse<TimetableSlot>>(
      `/me/timetable-slots?faculty_id=${facultyId}&limit=100`,
      token,
    );
  },
};

export interface MarkAttendancePayload {
  subjectId: number;
  attendanceDate: string;
  records: Array<{ studentId: number; status: AttendanceMarkStatus }>;
}

export const attendanceService = {
  /** No `subject_id` filter exists on this endpoint — callers filter the
   * returned rows by `subject.id` client-side. */
  getAttendanceForClassDate(classId: number, date: string, token: string) {
    return apiClient.get<PaginatedResponse<AttendanceRecordResponse>>(
      `/me/attendance-records?class_id=${classId}&date=${date}&limit=100`,
      token,
    );
  },

  /** Ownership-checked against faculty_subject_class_mapping server-side —
   * rejects with 403 if this faculty doesn't teach `subjectId` for `classId`. */
  getStudentsForClass(classId: number, subjectId: number, token: string, academicYear?: string) {
    const query = new URLSearchParams({ subject_id: String(subjectId) });
    if (academicYear) query.set("academic_year", academicYear);
    return apiClient.get<ClassStudentsResponse>(
      `/me/classes/${classId}/students?${query.toString()}`,
      token,
    );
  },

  /** Strictly create-once server-side — rejects with 409 if any record already
   * exists for (class, subject, date). */
  markClassAttendance(classId: number, payload: MarkAttendancePayload, token: string) {
    return apiClient.post<{ class_id: number; attendance_date: string; marked: number }>(
      `/me/classes/${classId}/attendance`,
      {
        subject_id: payload.subjectId,
        attendance_date: payload.attendanceDate,
        records: payload.records.map((record) => ({ student_id: record.studentId, status: record.status })),
      },
      token,
    );
  },
};
