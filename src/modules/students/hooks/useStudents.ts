import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "../services/students.service";
import type { ListStudentsParams, UpdateStudentProfileInput } from "../types";

export function useStudents(params: ListStudentsParams) {
  return useQuery({
    queryKey: ["students", "list", params],
    queryFn: () => studentsService.findAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: ["students", "detail", id],
    queryFn: () => studentsService.findOne(id),
  });
}

export function useStudentFeeWorkspace(id: number) {
  return useQuery({
    queryKey: ["students", "fee-workspace", id],
    queryFn: () => studentsService.getFeeWorkspace(id),
  });
}

/** Loaded only while the Edit profile modal is open — `enabled` gates it the same way the section panels do. */
export function useStudentEditProfile(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "edit-profile", id],
    queryFn: () => studentsService.getEditProfile(id),
    enabled,
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateStudentProfileInput }) =>
      studentsService.updateProfile(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["students", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["students", "edit-profile", id] });
      queryClient.invalidateQueries({ queryKey: ["students", "list"] });
    },
  });
}

export function useUploadStudentPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => studentsService.uploadPhoto(id, file),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["students", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["students", "edit-profile", id] });
      queryClient.invalidateQueries({ queryKey: ["students", "list"] });
    },
  });
}

export function useDeleteStudentPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentsService.deletePhoto(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["students", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["students", "edit-profile", id] });
      queryClient.invalidateQueries({ queryKey: ["students", "list"] });
    },
  });
}

// No cache invalidation needed — password_hash isn't part of any cached
// student payload, and the response is only ever shown once, not stored.
export function useResetStudentPassword() {
  return useMutation({
    mutationFn: ({ id, adminPassword, password }: { id: number; adminPassword: string; password?: string }) =>
      studentsService.resetPassword(id, adminPassword, password),
  });
}

/** All remaining per-section fetches are gated on `enabled` — each section's panel is only
    rendered (and thus mounted) once its rail tab is opened, but `enabled` keeps this explicit
    rather than relying on mount timing, and lets React Query cache the result across tab switches. */

export function useStudentProfileDetails(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "profile-details", id],
    queryFn: () => studentsService.getProfileDetails(id),
    enabled,
  });
}

export function useStudentFamily(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "family", id],
    queryFn: () => studentsService.getFamily(id),
    enabled,
  });
}

export function useStudentLifecycle(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "lifecycle", id],
    queryFn: () => studentsService.getLifecycle(id),
    enabled,
  });
}

export function useStudentSubjects(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "subjects", id],
    queryFn: () => studentsService.getSubjects(id),
    enabled,
  });
}

export function useStudentExamMarks(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "exam-marks", id],
    queryFn: () => studentsService.getExamMarks(id),
    enabled,
  });
}

export function useStudentHostelResident(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "hostel-resident", id],
    queryFn: () => studentsService.getHostelResident(id),
    enabled,
  });
}

export function useStudentPlacementHistory(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "placements", id],
    queryFn: () => studentsService.getPlacementHistory(id),
    enabled,
  });
}

export function useStudentBorrowRecords(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "borrow-records", id],
    queryFn: () => studentsService.getBorrowRecords(id),
    enabled,
  });
}

export function useLibrarySettings(enabled: boolean) {
  return useQuery({
    queryKey: ["library", "settings"],
    queryFn: () => studentsService.getLibrarySettings(),
    enabled,
  });
}

export function useStudentProjects(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "projects", id],
    queryFn: () => studentsService.getProjects(id),
    enabled,
  });
}

export function useClassMentor(classId: number | null | undefined) {
  return useQuery({
    queryKey: ["classes", "mentor", classId],
    queryFn: () => studentsService.getClassMentor(classId as number),
    enabled: classId != null,
  });
}

export function useStudentAttendanceSummary(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "attendance-summary", id],
    queryFn: () => studentsService.getAttendanceSummary(id),
    enabled,
  });
}

export function useStudentAttendanceBySemester(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "attendance-by-semester", id],
    queryFn: () => studentsService.getAttendanceBySemester(id),
    enabled,
  });
}

export function useStudentRequests(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "requests", id],
    queryFn: () => studentsService.getRequests(id),
    enabled,
  });
}

export function useStudentAnnouncements(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "announcements", id],
    queryFn: () => studentsService.getAnnouncements(id),
    enabled,
  });
}

export function useStudentCertificates(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "certificates", id],
    queryFn: () => studentsService.getCertificates(id),
    enabled,
  });
}

export function useUpsertCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { student_id: number; certificate_type_id: number; is_available?: boolean; file?: File }) =>
      studentsService.upsertCertificate(input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["students", "certificates", vars.student_id] });
    },
  });
}

export function useVerifyCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ certificateId, verified }: { certificateId: number; verified: boolean; studentId: number }) =>
      studentsService.verifyCertificate(certificateId, verified),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["students", "certificates", vars.studentId] });
    },
  });
}

export function useStudentTransport(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "transport", id],
    queryFn: () => studentsService.getTransport(id),
    enabled,
  });
}

export function useStudentMedicalVisits(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["students", "medical", id],
    queryFn: () => studentsService.getMedicalVisits(id),
    enabled,
  });
}
