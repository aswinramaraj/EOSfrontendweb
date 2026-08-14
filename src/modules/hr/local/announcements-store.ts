"use client";

import { createLocalListStore } from "./create-local-store";
import type { Announcement } from "./types";

const store = createLocalListStore<Announcement>("hr-announcements");

export function useAnnouncements() {
  const data = store.useItems();
  return { data, isLoading: false };
}

export function useCreateAnnouncement() {
  const add = store.useAddItem();
  return function create(input: Omit<Announcement, "id" | "postedAt" | "published">) {
    add({
      ...input,
      id: `ann-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      postedAt: Date.now(),
      published: true,
    });
  };
}
