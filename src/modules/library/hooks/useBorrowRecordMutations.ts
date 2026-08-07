import { useMutation } from "@tanstack/react-query";
import { borrowRecordsService } from "../services/borrow-records.service";
import { useInvalidateLibrary } from "./useInvalidateLibrary";
import type { CreateBorrowRecordInput, UpdateBorrowRecordInput } from "../types/borrow-records";

export function useCreateBorrowRecord() {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: (input: CreateBorrowRecordInput) => borrowRecordsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateBorrowRecord() {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateBorrowRecordInput }) =>
      borrowRecordsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useCollectFine() {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: (id: number) => borrowRecordsService.collectFine(id),
    onSuccess: invalidate,
  });
}

export function useSettleCharge() {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: (id: number) => borrowRecordsService.settleCharge(id),
    onSuccess: invalidate,
  });
}

export function useDeleteBorrowRecord() {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: (id: number) => borrowRecordsService.remove(id),
    onSuccess: invalidate,
  });
}

export function useSendOverdueReminders() {
  return useMutation({
    mutationFn: () => borrowRecordsService.sendOverdueReminders(),
  });
}

export function useCreateReplacementIndent() {
  const invalidate = useInvalidateLibrary();
  return useMutation({
    mutationFn: (id: number) => borrowRecordsService.createReplacementIndent(id),
    onSuccess: invalidate,
  });
}
