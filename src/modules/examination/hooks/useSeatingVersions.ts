import { useQuery } from "@tanstack/react-query";
import { seatingPlanVersionsService } from "../services/seating-plan-versions.service";
import { examinationKeys } from "../query-keys";
import type { ListSeatingVersionsParams } from "../types/seating";

export function useSeatingVersions(params: ListSeatingVersionsParams) {
  return useQuery({
    queryKey: examinationKeys.seatingVersions.list(params),
    queryFn: () => seatingPlanVersionsService.list(params),
    enabled: params.exam_id !== undefined,
  });
}

export function useSeatingVersion(id: number | null) {
  return useQuery({
    queryKey: examinationKeys.seatingVersions.detail(id ?? 0),
    queryFn: () => seatingPlanVersionsService.get(id!),
    enabled: id !== null,
  });
}
