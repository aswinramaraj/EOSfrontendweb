import { useQuery } from "@tanstack/react-query";
import { timetableVersionsService } from "../services/exam-timetable-versions.service";
import { examinationKeys } from "../query-keys";
import type { ListTimetableVersionsParams } from "../types/exam-timetable-versions";

export function useTimetableVersions(params: ListTimetableVersionsParams) {
  return useQuery({
    queryKey: examinationKeys.timetableVersions.list(params),
    queryFn: () => timetableVersionsService.list(params),
    enabled: params.exam_id !== undefined,
  });
}

export function useTimetableVersion(id: number | null) {
  return useQuery({
    queryKey: examinationKeys.timetableVersions.detail(id ?? 0),
    queryFn: () => timetableVersionsService.get(id!),
    enabled: id !== null,
  });
}
