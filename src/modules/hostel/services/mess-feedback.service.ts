import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { CreateMessFeedbackInput, MessFeedbackList, MessFeedbackListParams } from "../types/mess-feedback";

export const messFeedbackService = {
  list(params: MessFeedbackListParams = {}): Promise<MessFeedbackList> {
    return apiClient.get<MessFeedbackList>(
      `/hostel/mess-feedback${buildQuery(params)}`,
      requireToken(),
    );
  },
  create(input: CreateMessFeedbackInput) {
    return apiClient.post("/hostel/mess-feedback", input, requireToken());
  },
};
