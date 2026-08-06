import { useQuery } from "@tanstack/react-query";
import { hallPlansService } from "../services/hall-plans.service";
import type { FindHallPlansParams } from "../types/invigilation";

export function useHallPlans(params: FindHallPlansParams) {
  return useQuery({
    queryKey: ["examination", "hall-plans", "list", params],
    queryFn: () => hallPlansService.list(params),
    enabled: params.exam_id !== undefined,
  });
}
