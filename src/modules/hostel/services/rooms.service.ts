import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { CreateRoomInput, Room, UpdateRoomInput } from "../types/rooms";

export const roomsService = {
  list(hostelId?: number): Promise<Room[]> {
    return apiClient.get<Room[]>(
      `/hostel-rooms${buildQuery({ hostel_id: hostelId })}`,
      requireToken(),
    );
  },
  create(input: CreateRoomInput): Promise<Room> {
    return apiClient.post<Room>("/hostel-rooms", input, requireToken());
  },
  update(id: number, input: UpdateRoomInput): Promise<Room> {
    return apiClient.patch<Room>(`/hostel-rooms/${id}`, input, requireToken());
  },
  remove(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/hostel-rooms/${id}`, requireToken());
  },
};
