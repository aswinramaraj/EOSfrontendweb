"use client";

import { createLocalListStore } from "./create-local-store";
import type { OnboardingCase, OnboardingCaseStage } from "./types";

const store = createLocalListStore<OnboardingCase>("hr-onboarding-exits");

export function useOnboardingCases() {
  const data = store.useItems();
  return { data, isLoading: false };
}

export function useCreateOnboardingCase() {
  const add = store.useAddItem();
  return function create(
    input: Omit<OnboardingCase, "id" | "createdAt" | "stage" | "probationReviewDue" | "clearancePending">,
  ) {
    add({
      ...input,
      id: `case-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      createdAt: Date.now(),
      stage: "ready",
      probationReviewDue: input.type === "onboarding",
      clearancePending: input.type === "exit",
    });
  };
}

export function useUpdateOnboardingCase() {
  const update = store.useUpdateItem();
  return function updateCase(id: string, patch: Partial<Pick<OnboardingCase, "stage" | "probationReviewDue" | "clearancePending">>) {
    update(id, patch);
  };
}

export const ONBOARDING_STAGE_ORDER: OnboardingCaseStage[] = ["ready", "in_progress", "overdue"];
