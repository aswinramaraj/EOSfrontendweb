import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomTypesService } from "../services/room-types.service";
import { hostelKeys } from "../query-keys";

export function useRoomTypes() {
  return useQuery({
    queryKey: hostelKeys.roomTypes.list(),
    queryFn: roomTypesService.list,
  });
}

function useInvalidateRoomTypes() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: hostelKeys.roomTypes.all() });
    queryClient.invalidateQueries({ queryKey: hostelKeys.dashboard() });
  };
}

export function useCreateRoomType() {
  const invalidate = useInvalidateRoomTypes();
  return useMutation({
    mutationFn: (name: string) => roomTypesService.create(name),
    onSuccess: invalidate,
  });
}

export function useUpdateRoomType() {
  const invalidate = useInvalidateRoomTypes();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => roomTypesService.update(id, name),
    onSuccess: invalidate,
  });
}

export function useDeleteRoomType() {
  const invalidate = useInvalidateRoomTypes();
  return useMutation({
    mutationFn: (id: number) => roomTypesService.remove(id),
    onSuccess: invalidate,
  });
}
