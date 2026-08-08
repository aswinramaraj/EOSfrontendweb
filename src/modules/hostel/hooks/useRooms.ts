import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomsService } from "../services/rooms.service";
import { hostelKeys } from "../query-keys";
import type { CreateRoomInput, UpdateRoomInput } from "../types/rooms";

export function useRooms(hostelId?: number) {
  return useQuery({
    queryKey: hostelKeys.rooms.list({ hostelId }),
    queryFn: () => roomsService.list(hostelId),
  });
}

function useInvalidateRooms() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: hostelKeys.rooms.all() });
    queryClient.invalidateQueries({ queryKey: hostelKeys.hostels.all() });
    queryClient.invalidateQueries({ queryKey: hostelKeys.dashboard() });
  };
}

export function useCreateRoom() {
  const invalidate = useInvalidateRooms();
  return useMutation({
    mutationFn: (input: CreateRoomInput) => roomsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateRoom() {
  const invalidate = useInvalidateRooms();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateRoomInput }) =>
      roomsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteRoom() {
  const invalidate = useInvalidateRooms();
  return useMutation({
    mutationFn: (id: number) => roomsService.remove(id),
    onSuccess: invalidate,
  });
}
