import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type {
  CreateTimetableSlotInput,
  TimetableSlot,
  UpdateTimetableSlotInput,
} from "../types/exam-timetable-versions";

export const timetableSlotsService = {
  create(input: CreateTimetableSlotInput): Promise<TimetableSlot> {
    return apiClient.post<TimetableSlot>("/exam-timetable", input, requireToken());
  },
  update(id: number, input: UpdateTimetableSlotInput): Promise<TimetableSlot> {
    return apiClient.patch<TimetableSlot>(`/exam-timetable/${id}`, input, requireToken());
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/exam-timetable/${id}`, requireToken());
  },
};
