import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { marksService } from "../services/marks.service";
import { examinationKeys } from "../query-keys";
import type { CreateMarkInput, UpdateMarkInput } from "../types/marks";

export function useMarks() {
  return useQuery({
    queryKey: examinationKeys.marks.list(),
    queryFn: marksService.list,
  });
}

function useInvalidateMarks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examinationKeys.marks.all() });
}

export function useCreateMark() {
  const invalidate = useInvalidateMarks();
  return useMutation({
    mutationFn: (input: CreateMarkInput) => marksService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateMark() {
  const invalidate = useInvalidateMarks();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateMarkInput }) => marksService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteMark() {
  const invalidate = useInvalidateMarks();
  return useMutation({
    mutationFn: (id: number) => marksService.remove(id),
    onSuccess: invalidate,
  });
}
