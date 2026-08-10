import { useMutation, useQueryClient } from "@tanstack/react-query";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";
import type { CreateFacultyInput, MarkFacultyAttendanceInput, UpdateFacultyInput } from "../types";

function useInvalidateFaculty() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: facultyKeys.all });
}

export function useCreateFaculty() {
  const invalidate = useInvalidateFaculty();
  return useMutation({
    mutationFn: (input: CreateFacultyInput) => facultyService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateFaculty() {
  const invalidate = useInvalidateFaculty();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateFacultyInput }) =>
      facultyService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useMarkFacultyAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, input }: { id: number; date: string; input: MarkFacultyAttendanceInput }) =>
      facultyService.markAttendance(id, date, input),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: facultyKeys.attendance(id) });
      queryClient.invalidateQueries({ queryKey: [...facultyKeys.all, "attendance-overview"] });
    },
  });
}
