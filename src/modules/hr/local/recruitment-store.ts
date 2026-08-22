"use client";

import { createLocalListStore } from "./create-local-store";
import type { Vacancy, VacancyStage } from "./types";

const store = createLocalListStore<Vacancy>("hr-recruitment");

export function useVacancies() {
  const data = store.useItems();
  return { data, isLoading: false };
}

export function useCreateVacancy() {
  const add = store.useAddItem();
  return function create(input: Omit<Vacancy, "id" | "createdAt" | "stage" | "applicants">) {
    add({ ...input, id: `vac-${Date.now()}-${Math.round(Math.random() * 1e6)}`, createdAt: Date.now(), stage: "screening", applicants: 0 });
  };
}

export function useUpdateVacancyStage() {
  const update = store.useUpdateItem();
  return function updateStage(id: string, stage: VacancyStage) {
    update(id, { stage });
  };
}
