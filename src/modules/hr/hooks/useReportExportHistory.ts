"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

// Client-only export log for the Reports page — there's no backend table for
// this (and we're not adding one), so "recent exports" lives in localStorage,
// scoped to this browser only. useSyncExternalStore (rather than useState +
// an effect) keeps the SSR snapshot and the real localStorage value in sync
// without a setState-on-mount render.
const STORAGE_KEY = "hr-reports-export-history";
const MAX_ENTRIES = 20;

export interface ReportExportEntry {
  label: string;
  generatedAt: number;
}

let cachedRaw: string | null = null;
let cachedSnapshot: ReportExportEntry[] = [];
const listeners = new Set<() => void>();

function parse(raw: string | null): ReportExportEntry[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ReportExportEntry[]) : [];
  } catch {
    return [];
  }
}

function getSnapshot(): ReportExportEntry[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parse(raw);
  }
  return cachedSnapshot;
}

function getServerSnapshot(): ReportExportEntry[] {
  return [];
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function writeHistory(next: ReportExportEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  for (const listener of listeners) listener();
}

export function useReportExportHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Forces a re-render every 30s so relative labels ("2m ago" -> "3m ago")
  // keep advancing without the user refreshing the page.
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const record = useCallback((label: string) => {
    writeHistory([{ label, generatedAt: Date.now() }, ...getSnapshot()].slice(0, MAX_ENTRIES));
  }, []);

  return { history, record };
}
