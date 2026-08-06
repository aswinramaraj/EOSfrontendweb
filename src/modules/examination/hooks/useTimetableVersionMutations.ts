import { useMutation, useQueryClient } from "@tanstack/react-query";
import { timetableVersionsService } from "../services/exam-timetable-versions.service";
import { timetableSlotsService } from "../services/exam-timetable.service";
import { examinationKeys } from "../query-keys";
import type {
  CreateTimetableSlotInput,
  CreateTimetableVersionInput,
  UpdateTimetableSlotInput,
} from "../types/exam-timetable-versions";

function useInvalidateVersions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examinationKeys.timetableVersions.all() });
}

export function useCreateTimetableVersion() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: (input: CreateTimetableVersionInput) => timetableVersionsService.create(input),
    onSuccess: invalidate,
  });
}

export function useReadyToPublishVersion() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: (id: number) => timetableVersionsService.readyToPublish(id),
    onSuccess: invalidate,
  });
}

export function useReturnVersionToDrafts() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: (id: number) => timetableVersionsService.returnToDrafts(id),
    onSuccess: invalidate,
  });
}

export function usePublishVersion() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: ({ id, force }: { id: number; force?: boolean }) =>
      timetableVersionsService.publish(id, force),
    onSuccess: invalidate,
  });
}

export function useWithdrawVersion() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: (id: number) => timetableVersionsService.withdraw(id),
    onSuccess: invalidate,
  });
}

export function useDeleteTimetableVersion() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: (id: number) => timetableVersionsService.remove(id),
    onSuccess: invalidate,
  });
}

export function useCreateTimetableSlot() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: (input: CreateTimetableSlotInput) => timetableSlotsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTimetableSlot() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTimetableSlotInput }) =>
      timetableSlotsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTimetableSlot() {
  const invalidate = useInvalidateVersions();
  return useMutation({
    mutationFn: (id: number) => timetableSlotsService.remove(id),
    onSuccess: invalidate,
  });
}
