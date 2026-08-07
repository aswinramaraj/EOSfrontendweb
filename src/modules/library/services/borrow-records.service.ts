import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type {
  BorrowRecord,
  BorrowRecordListParams,
  CreateBorrowRecordInput,
  UpdateBorrowRecordInput,
} from "../types/borrow-records";

export const borrowRecordsService = {
  list(params: BorrowRecordListParams = {}): Promise<Paginated<BorrowRecord>> {
    return apiClient.get<Paginated<BorrowRecord>>(
      `/library/borrow-records${buildQuery(params)}`,
      requireToken(),
    );
  },
  get(id: number): Promise<BorrowRecord> {
    return apiClient.get<BorrowRecord>(`/library/borrow-records/${id}`, requireToken());
  },
  create(input: CreateBorrowRecordInput): Promise<BorrowRecord> {
    return apiClient.post<BorrowRecord>("/library/borrow-records", input, requireToken());
  },
  update(id: number, input: UpdateBorrowRecordInput): Promise<BorrowRecord> {
    return apiClient.patch<BorrowRecord>(
      `/library/borrow-records/${id}`,
      input,
      requireToken(),
    );
  },
  collectFine(id: number): Promise<BorrowRecord> {
    return apiClient.patch<BorrowRecord>(
      `/library/borrow-records/${id}/collect-fine`,
      undefined,
      requireToken(),
    );
  },
  settleCharge(id: number): Promise<BorrowRecord> {
    return apiClient.patch<BorrowRecord>(
      `/library/borrow-records/${id}/settle-charge`,
      undefined,
      requireToken(),
    );
  },
  remove(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `/library/borrow-records/${id}`,
      requireToken(),
    );
  },
  sendOverdueReminders(): Promise<{ message: string; sent: number; checked: number }> {
    return apiClient.post<{ message: string; sent: number; checked: number }>(
      "/library/borrow-records/send-overdue-reminders",
      undefined,
      requireToken(),
    );
  },
  createReplacementIndent(
    id: number,
  ): Promise<{ message: string; purchase_indent_id: number }> {
    return apiClient.patch<{ message: string; purchase_indent_id: number }>(
      `/library/borrow-records/${id}/create-replacement-indent`,
      undefined,
      requireToken(),
    );
  },
};
