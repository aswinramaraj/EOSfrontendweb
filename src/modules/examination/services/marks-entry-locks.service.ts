import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { MarksEntryLock } from "../types/marks";

export const marksEntryLocksService = {
  get(examId: number, departmentId: number): Promise<MarksEntryLock> {
    return apiClient.get<MarksEntryLock>(
      `/marks-entry-locks${buildQuery({ exam_id: examId, department_id: departmentId })}`,
      requireToken(),
    );
  },
  setLock(examId: number, departmentId: number, isLocked: boolean): Promise<MarksEntryLock> {
    return apiClient.patch<MarksEntryLock>(
      `/marks-entry-locks${buildQuery({ exam_id: examId, department_id: departmentId })}`,
      { is_locked: isLocked },
      requireToken(),
    );
  },
  publish(examId: number, departmentId: number): Promise<MarksEntryLock> {
    return apiClient.patch<MarksEntryLock>(
      `/marks-entry-locks/publish${buildQuery({ exam_id: examId, department_id: departmentId })}`,
      undefined,
      requireToken(),
    );
  },
};
