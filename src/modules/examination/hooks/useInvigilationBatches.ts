import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invigilationBatchesService } from "../services/invigilation-allocation-batches.service";
import { examinationKeys } from "../query-keys";
import type { CreateAllocationBatchInput, ListAllocationBatchesParams } from "../types/invigilation";

export function useInvigilationBatches(params: ListAllocationBatchesParams) {
  return useQuery({
    queryKey: examinationKeys.invigilationBatches.list(params),
    queryFn: () => invigilationBatchesService.list(params),
    enabled: params.exam_id !== undefined,
  });
}

function useInvalidateBatches() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examinationKeys.invigilationBatches.all() });
}

export function useFindOrCreateInvigilationBatch() {
  const invalidate = useInvalidateBatches();
  return useMutation({
    mutationFn: (input: CreateAllocationBatchInput) => invigilationBatchesService.findOrCreate(input),
    onSuccess: invalidate,
  });
}

export function useSubmitInvigilationBatch() {
  const invalidate = useInvalidateBatches();
  return useMutation({
    mutationFn: (id: number) => invigilationBatchesService.submit(id),
    onSuccess: invalidate,
  });
}

export function usePublishInvigilationBatch() {
  const invalidate = useInvalidateBatches();
  return useMutation({
    mutationFn: (id: number) => invigilationBatchesService.publish(id),
    onSuccess: invalidate,
  });
}

export function useDeleteInvigilationBatch() {
  const invalidate = useInvalidateBatches();
  return useMutation({
    mutationFn: (id: number) => invigilationBatchesService.remove(id),
    onSuccess: invalidate,
  });
}
