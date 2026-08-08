import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marksService } from "../services/marks.service";
import { advisorKeys } from "../query-keys";
import type { BulkMarkInput } from "../types";

export function useBulkUpsertMarks(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkMarkInput) => marksService.bulkUpsert(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...advisorKeys.all, "class-marks", classId] });
    },
  });
}
