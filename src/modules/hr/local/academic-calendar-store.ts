"use client";

import { createLocalListStore } from "./create-local-store";
import type { CalendarEvent, CalendarEventType } from "./types";

const store = createLocalListStore<CalendarEvent>("hr-academic-calendar");

export function useCalendarEvents(year: number, month: number) {
  const all = store.useItems();
  const data = all.filter((event) => event.year === year && event.month === month);
  return { data, isLoading: false };
}

export function useCreateCalendarEvent() {
  const add = store.useAddItem();
  return function create(input: { year: number; month: number; day: number; title: string; type: CalendarEventType }) {
    add({ ...input, id: `evt-${Date.now()}-${Math.round(Math.random() * 1e6)}`, createdAt: Date.now() });
  };
}
