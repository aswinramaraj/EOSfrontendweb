import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { messFeedbackService } from "../services/mess-feedback.service";
import { hostelKeys } from "../query-keys";
import { useInvalidateHostel } from "./useInvalidateHostel";
import type { CreateMessFeedbackInput, MessFeedbackListParams } from "../types/mess-feedback";

export function useMessFeedback(params: MessFeedbackListParams) {
  return useQuery({
    queryKey: hostelKeys.messFeedback.list(params),
    queryFn: () => messFeedbackService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateMessFeedback() {
  const invalidate = useInvalidateHostel();
  return useMutation({
    mutationFn: (input: CreateMessFeedbackInput) => messFeedbackService.create(input),
    onSuccess: invalidate,
  });
}
