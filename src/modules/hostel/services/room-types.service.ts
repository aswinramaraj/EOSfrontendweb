import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { RoomType } from "../types/rooms";

export const roomTypesService = {
  list(): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>("/hostel-room-types", requireToken());
  },
  create(name: string): Promise<RoomType> {
    return apiClient.post<RoomType>("/hostel-room-types", { name }, requireToken());
  },
  update(id: number, name: string): Promise<RoomType> {
    return apiClient.patch<RoomType>(`/hostel-room-types/${id}`, { name }, requireToken());
  },
  remove(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/hostel-room-types/${id}`, requireToken());
  },
};
