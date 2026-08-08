import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceRequestsService } from "../services/service-requests.service";
import { proposalsKeys } from "../query-keys";
import type {
  CreateServiceRequestInput,
  ServiceRequestStatus,
  UpdateServiceRequestInput,
} from "../types/service-request";

export function useServiceRequests(status?: ServiceRequestStatus) {
  return useQuery({
    queryKey: proposalsKeys.serviceRequests.list(status),
    queryFn: () => serviceRequestsService.list(status),
  });
}

function useInvalidateServiceRequests() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: proposalsKeys.serviceRequests.all() });
}

export function useCreateServiceRequest() {
  const invalidate = useInvalidateServiceRequests();
  return useMutation({
    mutationFn: (input: CreateServiceRequestInput) => serviceRequestsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateServiceRequest() {
  const invalidate = useInvalidateServiceRequests();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateServiceRequestInput }) =>
      serviceRequestsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useSubmitServiceRequest() {
  const invalidate = useInvalidateServiceRequests();
  return useMutation({
    mutationFn: (id: number) => serviceRequestsService.submit(id),
    onSuccess: invalidate,
  });
}

export function useDeleteServiceRequest() {
  const invalidate = useInvalidateServiceRequests();
  return useMutation({
    mutationFn: (id: number) => serviceRequestsService.remove(id),
    onSuccess: invalidate,
  });
}
