import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { studentsService } from "../services/students.service";
import type { ListStudentsParams } from "../types";

export function useStudents(params: ListStudentsParams) {
  return useQuery({
    queryKey: ["students", "list", params],
    queryFn: () => studentsService.findAll(params),
    placeholderData: keepPreviousData,
  });
}
