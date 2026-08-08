import { useQuery } from "@tanstack/react-query";
import { studentsService } from "../services/students.service";
import { advisorKeys } from "../query-keys";

export function useMenteeClasses() {
  return useQuery({
    queryKey: advisorKeys.menteeClasses.all(),
    queryFn: () => studentsService.listMenteeClasses(),
  });
}

export function useClassResult(classId: number | undefined) {
  return useQuery({
    queryKey: advisorKeys.classResult(classId ?? -1),
    queryFn: () => studentsService.getClassResult(classId!),
    enabled: classId !== undefined,
  });
}

export function useClassMarks(classId: number | undefined, examTypeId?: number) {
  return useQuery({
    queryKey: advisorKeys.classMarks(classId ?? -1, examTypeId),
    queryFn: () => studentsService.getClassMarks(classId!, examTypeId),
    enabled: classId !== undefined,
  });
}

export function useStudentProfile(studentId: number | undefined) {
  return useQuery({
    queryKey: advisorKeys.studentProfile(studentId ?? -1),
    queryFn: () => studentsService.getProfile(studentId!),
    enabled: studentId !== undefined,
  });
}

export function useStudentReport(studentId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: advisorKeys.studentReport(studentId ?? -1),
    queryFn: () => studentsService.getReport(studentId!),
    enabled: studentId !== undefined && enabled,
  });
}

export function useStudentPlacements(studentId: number | undefined) {
  return useQuery({
    queryKey: advisorKeys.studentPlacements(studentId ?? -1),
    queryFn: () => studentsService.getPlacements(studentId!),
    enabled: studentId !== undefined,
  });
}
