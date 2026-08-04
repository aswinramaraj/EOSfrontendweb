import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { borrowRecordsService } from "../services/borrow-records.service";
import { libraryKeys } from "../query-keys";
import type { BorrowRecordListParams } from "../types/borrow-records";

export function useBorrowRecords(params: BorrowRecordListParams) {
  return useQuery({
    queryKey: libraryKeys.borrowRecords.list(params),
    queryFn: () => borrowRecordsService.list(params),
    placeholderData: keepPreviousData,
  });
}
