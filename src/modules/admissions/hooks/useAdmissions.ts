import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { admissionsService } from "../services/admissions.service";
import type {
  CreatePerfectEntryInput,
  CreateSoaApplicationInput,
  ListSoaApplicationsParams,
  SaveProfileDraftInput,
  SoaStatus,
  UpdateSoaApplicationInput,
} from "../types";

export function useTransportStages(enabled: boolean) {
  return useQuery({
    queryKey: ["transport-stages"],
    queryFn: admissionsService.listTransportStages,
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function useHostelRoomTypes(enabled: boolean) {
  return useQuery({
    queryKey: ["hostel-room-types"],
    queryFn: admissionsService.listHostelRoomTypes,
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function useCertificateTypes(enabled: boolean) {
  return useQuery({
    queryKey: ["certificate-types"],
    queryFn: admissionsService.listCertificateTypes,
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function useUploadApplicationPhoto() {
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => admissionsService.uploadPhoto(id, file),
  });
}

export function useUploadApplicationDocument() {
  return useMutation({
    mutationFn: ({ id, certificateTypeId, file }: { id: number; certificateTypeId: number; file: File }) =>
      admissionsService.uploadDocument(id, certificateTypeId, file),
  });
}

export function useSoaApplications(params: ListSoaApplicationsParams) {
  return useQuery({
    queryKey: ["soa-applications", "list", params],
    queryFn: () => admissionsService.listApplications(params),
    placeholderData: keepPreviousData,
  });
}

export function useSoaApplication(id: number) {
  return useQuery({
    queryKey: ["soa-applications", "detail", id],
    queryFn: () => admissionsService.getApplication(id),
  });
}

export function useCreateSoaApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSoaApplicationInput) => admissionsService.createApplication(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["soa-applications", "list"] }),
  });
}

export function useUpdateSoaApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateSoaApplicationInput }) =>
      admissionsService.updateApplication(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["soa-applications", "list"] });
      queryClient.invalidateQueries({ queryKey: ["soa-applications", "detail", id] });
    },
  });
}

export function useDeleteSoaApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admissionsService.deleteApplication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["soa-applications", "list"] }),
  });
}

export function useUpdateSoaStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: SoaStatus }) => admissionsService.updateStatus(id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["soa-applications", "list"] });
      queryClient.invalidateQueries({ queryKey: ["soa-applications", "detail", id] });
    },
  });
}

/**
 * Loaded once on the Complete Profile wizard's mount. `enabled` gates it on
 * having a real applicationId (mirrors the rest of this module's pattern).
 */
export function useProfileDraft(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ["soa-applications", "draft", id],
    queryFn: () => admissionsService.getDraft(id),
    enabled,
    staleTime: Infinity, // it's this tab's own in-progress edit — never silently refetched out from under the wizard
  });
}

export function useSaveProfileDraft() {
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SaveProfileDraftInput }) =>
      admissionsService.saveDraft(id, input),
  });
}

export function usePerfectEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CreatePerfectEntryInput }) =>
      admissionsService.perfectEntry(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["soa-applications", "list"] });
      queryClient.invalidateQueries({ queryKey: ["soa-applications", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["students", "list"] });
    },
  });
}
