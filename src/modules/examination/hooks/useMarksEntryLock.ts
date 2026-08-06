import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { marksEntryLocksService } from "../services/marks-entry-locks.service";
import { examinationKeys } from "../query-keys";

export function useMarksEntryLock(examId: number | null, departmentId: number | null) {
  return useQuery({
    queryKey: examinationKeys.marksLocks(examId ?? 0, departmentId ?? 0),
    queryFn: () => marksEntryLocksService.get(examId!, departmentId!),
    enabled: examId !== null && departmentId !== null,
  });
}

function useInvalidateLock(examId: number | null, departmentId: number | null) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: examinationKeys.marksLocks(examId ?? 0, departmentId ?? 0),
    });
}

export function useSetMarksEntryLock(examId: number | null, departmentId: number | null) {
  const invalidate = useInvalidateLock(examId, departmentId);
  return useMutation({
    mutationFn: (isLocked: boolean) => marksEntryLocksService.setLock(examId!, departmentId!, isLocked),
    onSuccess: invalidate,
  });
}

export function usePublishMarksEntry(examId: number | null, departmentId: number | null) {
  const invalidate = useInvalidateLock(examId, departmentId);
  return useMutation({
    mutationFn: () => marksEntryLocksService.publish(examId!, departmentId!),
    onSuccess: invalidate,
  });
}
