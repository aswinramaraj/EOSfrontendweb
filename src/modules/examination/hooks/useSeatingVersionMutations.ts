import { useMutation, useQueryClient } from "@tanstack/react-query";
import { seatingPlanVersionsService } from "../services/seating-plan-versions.service";
import { examinationKeys } from "../query-keys";
import type {
  AddVersionVenueInput,
  AllocateVersionVenueInput,
  CreateSeatingVersionInput,
  UpdateVersionVenueInput,
} from "../types/seating";

function useInvalidateSeatingVersions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: examinationKeys.seatingVersions.all() });
}

export function useCreateSeatingVersion() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: (input: CreateSeatingVersionInput) => seatingPlanVersionsService.create(input),
    onSuccess: invalidate,
  });
}

export function useReadyToPublishSeatingVersion() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: (id: number) => seatingPlanVersionsService.readyToPublish(id),
    onSuccess: invalidate,
  });
}

export function useReturnSeatingVersionToDrafts() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: (id: number) => seatingPlanVersionsService.returnToDrafts(id),
    onSuccess: invalidate,
  });
}

export function usePublishSeatingVersion() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: ({ id, force }: { id: number; force?: boolean }) =>
      seatingPlanVersionsService.publish(id, force),
    onSuccess: invalidate,
  });
}

export function useWithdrawSeatingVersion() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: (id: number) => seatingPlanVersionsService.withdraw(id),
    onSuccess: invalidate,
  });
}

export function useDeleteSeatingVersion() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: (id: number) => seatingPlanVersionsService.remove(id),
    onSuccess: invalidate,
  });
}

export function useAddVersionVenue() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: ({ versionId, input }: { versionId: number; input: AddVersionVenueInput }) =>
      seatingPlanVersionsService.addVenue(versionId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateVersionVenue() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: ({
      versionId,
      venueLinkId,
      input,
    }: {
      versionId: number;
      venueLinkId: number;
      input: UpdateVersionVenueInput;
    }) => seatingPlanVersionsService.updateVenue(versionId, venueLinkId, input),
    onSuccess: invalidate,
  });
}

export function useRemoveVersionVenue() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: ({ versionId, venueLinkId }: { versionId: number; venueLinkId: number }) =>
      seatingPlanVersionsService.removeVenue(versionId, venueLinkId),
    onSuccess: invalidate,
  });
}

export function useAllocateVersionVenue() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: ({
      versionId,
      venueLinkId,
      input,
    }: {
      versionId: number;
      venueLinkId: number;
      input: AllocateVersionVenueInput;
    }) => seatingPlanVersionsService.allocateVenue(versionId, venueLinkId, input),
    onSuccess: invalidate,
  });
}

export function useClearVenueAllocation() {
  const invalidate = useInvalidateSeatingVersions();
  return useMutation({
    mutationFn: ({ versionId, venueLinkId }: { versionId: number; venueLinkId: number }) =>
      seatingPlanVersionsService.clearVenueAllocation(versionId, venueLinkId),
    onSuccess: invalidate,
  });
}
