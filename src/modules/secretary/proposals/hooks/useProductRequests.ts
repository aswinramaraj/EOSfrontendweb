import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productRequestsService } from "../services/product-requests.service";
import { proposalsKeys } from "../query-keys";
import type {
  CreateProductRequestInput,
  ProductRequestStatus,
  UpdateProductRequestInput,
} from "../types/product-request";

export function useProductRequests(status?: ProductRequestStatus) {
  return useQuery({
    queryKey: proposalsKeys.productRequests.list(status),
    queryFn: () => productRequestsService.list(status),
  });
}

function useInvalidateProductRequests() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: proposalsKeys.productRequests.all() });
}

export function useCreateProductRequest() {
  const invalidate = useInvalidateProductRequests();
  return useMutation({
    mutationFn: (input: CreateProductRequestInput) => productRequestsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateProductRequest() {
  const invalidate = useInvalidateProductRequests();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProductRequestInput }) =>
      productRequestsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useSubmitProductRequest() {
  const invalidate = useInvalidateProductRequests();
  return useMutation({
    mutationFn: (id: number) => productRequestsService.submit(id),
    onSuccess: invalidate,
  });
}

export function useDeleteProductRequest() {
  const invalidate = useInvalidateProductRequests();
  return useMutation({
    mutationFn: (id: number) => productRequestsService.remove(id),
    onSuccess: invalidate,
  });
}
