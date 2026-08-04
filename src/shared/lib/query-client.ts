import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-client";
import { tokenStorage } from "./token-storage";

function isClientError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  );
}

// The backend's 4xxs are deterministic business-rule rejections (wrong
// password, over the borrowing cap, duplicate name, ...) — retrying them is
// pure latency, not resilience. 5xx/network errors get a couple of retries.
function retry(failureCount: number, error: unknown): boolean {
  if (isClientError(error)) return false;
  return failureCount < 2;
}

function onError(error: unknown) {
  if (error instanceof ApiError && error.statusCode === 401) {
    tokenStorage.clear();
  }
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
