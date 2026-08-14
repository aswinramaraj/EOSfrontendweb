"use client";

import { useCallback, useSyncExternalStore } from "react";

// Generic factory for the browser-local (no backend) HR features —
// Announcements, Academic Calendar, Recruitment, Onboarding & Exits. Follows
// the exact useSyncExternalStore + localStorage pattern already established
// by useReportExportHistory.ts (the Reports page's "recent exports" log),
// which explicitly notes there is no backend table for that data and none
// planned. Each list item must carry a stable string `id`.
export function createLocalListStore<T extends { id: string }>(storageKey: string) {
  let cachedRaw: string | null = null;
  let cachedSnapshot: T[] = [];
  const listeners = new Set<() => void>();

  function parse(raw: string | null): T[] {
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  function getSnapshot(): T[] {
    const raw = window.localStorage.getItem(storageKey);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = parse(raw);
    }
    return cachedSnapshot;
  }

  function getServerSnapshot(): T[] {
    return [];
  }

  function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function write(next: T[]) {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    for (const listener of listeners) listener();
  }

  function useItems(): T[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  function useAddItem() {
    return useCallback((item: T) => {
      write([item, ...getSnapshot()]);
    }, []);
  }

  function useUpdateItem() {
    return useCallback((id: string, patch: Partial<T>) => {
      write(getSnapshot().map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }, []);
  }

  function useRemoveItem() {
    return useCallback((id: string) => {
      write(getSnapshot().filter((item) => item.id !== id));
    }, []);
  }

  return { useItems, useAddItem, useUpdateItem, useRemoveItem };
}
