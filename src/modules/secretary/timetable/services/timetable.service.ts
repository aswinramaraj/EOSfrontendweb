import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Batch, Department, PaginatedResult, SchoolClass, TimetableSlot } from "../types";

interface RawTimetableSlot extends Omit<TimetableSlot, "start_time" | "end_time"> {
  start_time: string;
  end_time: string;
}

function toHHMM(isoTime: string): string {
  return isoTime.slice(11, 16);
}

export const timetableService = {
  async listSlots(params: {
    class_id?: number;
    faculty_id?: number;
    academic_year?: string;
    day_of_week?: number;
  }): Promise<PaginatedResult<TimetableSlot>> {
    const raw = await apiClient.get<PaginatedResult<RawTimetableSlot>>(
      `/me/timetable-slots${buildQuery({ ...params, limit: 100 })}`,
      requireToken(),
    );
    return {
      ...raw,
      data: raw.data.map((slot) => ({
        ...slot,
        start_time: toHHMM(slot.start_time),
        end_time: toHHMM(slot.end_time),
      })),
    };
  },

  listClasses(): Promise<SchoolClass[]> {
    return apiClient.get<SchoolClass[]>("/classes", requireToken());
  },

  listDepartments(): Promise<Department[]> {
    return apiClient.get<Department[]>("/departments", requireToken());
  },

  listBatches(): Promise<Batch[]> {
    return apiClient.get<Batch[]>("/batches", requireToken());
  },
};
