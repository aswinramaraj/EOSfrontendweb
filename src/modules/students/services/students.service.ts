import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  ListStudentsParams,
  StudentAnnouncement,
  StudentAttendanceSummary,
  StudentAttendanceTerm,
  StudentBorrowRecord,
  StudentCertificate,
  StudentExamMark,
  StudentFamily,
  StudentFeeWorkspace,
  StudentHostelResident,
  StudentLifecycle,
  StudentEditProfile,
  StudentListItem,
  StudentMedicalVisit,
  StudentPlacementHistoryItem,
  StudentProfileDetails,
  StudentProjectsResponse,
  StudentRequestItem,
  StudentSubject,
  StudentsListResponse,
  StudentTransport,
  UpdateStudentProfileInput,
} from "../types";

interface PaginatedData<T> {
  page: number;
  page_size: number;
  total: number;
  data: T[];
}

export const studentsService = {
  findAll(params: ListStudentsParams = {}): Promise<StudentsListResponse> {
    return apiClient.get<StudentsListResponse>(`/students${buildQuery(params)}`, requireToken());
  },
  findOne(id: number): Promise<StudentListItem> {
    return apiClient.get<StudentListItem>(`/students/${id}`, requireToken());
  },
  getEditProfile(id: number): Promise<StudentEditProfile> {
    return apiClient.get<StudentEditProfile>(`/students/${id}/edit-profile`, requireToken());
  },
  updateProfile(id: number, input: UpdateStudentProfileInput): Promise<StudentListItem> {
    return apiClient.patch<StudentListItem>(`/students/${id}`, input, requireToken());
  },
  uploadPhoto(id: number, file: File): Promise<{ photo_url: string; photo_uploaded_at: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.uploadFile<{ photo_url: string; photo_uploaded_at: string }>(
      `/students/${id}/photo`,
      formData,
      requireToken(),
    );
  },
  deletePhoto(id: number): Promise<{ photo_url: string | null; photo_uploaded_at: string | null }> {
    return apiClient.delete<{ photo_url: string | null; photo_uploaded_at: string | null }>(
      `/students/${id}/photo`,
      requireToken(),
    );
  },
  /**
   * `adminPassword` is the calling admin's own login password — a step-up
   * confirmation the backend checks before doing anything else. Omit
   * `password` to have the server generate one — either way the plaintext
   * comes back once in the response.
   */
  resetPassword(id: number, adminPassword: string, password?: string): Promise<{ password: string }> {
    return apiClient.post<{ password: string }>(
      `/students/${id}/reset-password`,
      password ? { adminPassword, password } : { adminPassword },
      requireToken(),
    );
  },
  getFeeWorkspace(id: number): Promise<StudentFeeWorkspace> {
    return apiClient.get<StudentFeeWorkspace>(`/fee-payments/students/${id}/workspace`, requireToken());
  },
  getProfileDetails(id: number): Promise<StudentProfileDetails> {
    return apiClient.get<StudentProfileDetails>(`/students/${id}/profile-details`, requireToken());
  },
  getFamily(id: number): Promise<StudentFamily | null> {
    return apiClient.get<StudentFamily | null>(`/students/${id}/family`, requireToken());
  },
  getLifecycle(id: number): Promise<StudentLifecycle> {
    return apiClient.get<StudentLifecycle>(`/students/${id}/lifecycle`, requireToken());
  },
  getSubjects(id: number): Promise<StudentSubject[]> {
    return apiClient.get<StudentSubject[]>(`/students/${id}/subjects`, requireToken());
  },
  getExamMarks(id: number): Promise<StudentExamMark[]> {
    return apiClient.get<StudentExamMark[]>(`/exam-marks${buildQuery({ student_id: id })}`, requireToken());
  },
  async getHostelResident(id: number): Promise<StudentHostelResident | null> {
    const res = await apiClient.get<PaginatedData<StudentHostelResident>>(
      `/hostel/residents${buildQuery({ student_id: id })}`,
      requireToken(),
    );
    return res.data[0] ?? null;
  },
  getPlacementHistory(id: number): Promise<StudentPlacementHistoryItem[]> {
    return apiClient.get<StudentPlacementHistoryItem[]>(`/drives/students/${id}/history`, requireToken());
  },
  async getBorrowRecords(id: number): Promise<StudentBorrowRecord[]> {
    const res = await apiClient.get<PaginatedData<StudentBorrowRecord>>(
      `/library/borrow-records${buildQuery({ student_id: id })}`,
      requireToken(),
    );
    return res.data;
  },
  getProjects(id: number): Promise<StudentProjectsResponse> {
    return apiClient.get<StudentProjectsResponse>(`/student-profiles/${id}`, requireToken());
  },
  async getClassMentor(classId: number): Promise<ClassMentor | null> {
    const history = await apiClient.get<ClassMentor[]>(`/classes/${classId}/mentor`, requireToken());
    return history[0] ?? null;
  },
  getAttendanceSummary(id: number): Promise<StudentAttendanceSummary> {
    return apiClient.get<StudentAttendanceSummary>(`/students/${id}/attendance-summary`, requireToken());
  },
  getAttendanceBySemester(id: number): Promise<StudentAttendanceTerm[]> {
    return apiClient.get<StudentAttendanceTerm[]>(`/students/${id}/attendance-by-semester`, requireToken());
  },
  getRequests(id: number): Promise<StudentRequestItem[]> {
    return apiClient.get<StudentRequestItem[]>(`/students/${id}/requests`, requireToken());
  },
  getAnnouncements(id: number): Promise<StudentAnnouncement[]> {
    return apiClient.get<StudentAnnouncement[]>(`/students/${id}/announcements`, requireToken());
  },
  getCertificates(id: number): Promise<StudentCertificate[]> {
    return apiClient.get<StudentCertificate[]>(`/students/${id}/certificates`, requireToken());
  },
  /** Upsert-by-(student_id, certificate_type_id) — same POST whether this is the first row for a type or a replacement scan. */
  upsertCertificate(input: {
    student_id: number;
    certificate_type_id: number;
    is_available?: boolean;
    file?: File;
  }): Promise<StudentCertificate> {
    const formData = new FormData();
    formData.append("student_id", String(input.student_id));
    formData.append("certificate_type_id", String(input.certificate_type_id));
    if (input.is_available !== undefined) formData.append("is_available", String(input.is_available));
    if (input.file) formData.append("file", input.file);
    return apiClient.uploadFile<StudentCertificate>("/certificates", formData, requireToken());
  },
  verifyCertificate(certificateId: number, verified: boolean): Promise<StudentCertificate> {
    return apiClient.patch<StudentCertificate>(`/certificates/${certificateId}`, { verified }, requireToken());
  },
  getTransport(id: number): Promise<StudentTransport | null> {
    return apiClient.get<StudentTransport | null>(`/students/${id}/transport`, requireToken());
  },
  getMedicalVisits(id: number): Promise<StudentMedicalVisit[]> {
    return apiClient.get<StudentMedicalVisit[]>(`/students/${id}/medical`, requireToken());
  },
  getLibrarySettings(): Promise<{ books_per_student: number }> {
    return apiClient.get<{ books_per_student: number }>(`/library/settings`, requireToken());
  },
};

export interface ClassMentor {
  id: number;
  class_id: number;
  faculty_id: number;
  academic_year: string;
  assigned_by_user_id: number | null;
  faculty: { id: number; first_name: string; last_name: string; designation: string | null };
}
