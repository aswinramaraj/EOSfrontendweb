"use client";

import { useCallback, useSyncExternalStore } from "react";

// PF-active / Form-16-issued are per-faculty flags HR can record manually —
// there's no PF/Form-16 backend field (confirmed: payroll only has a
// `pf_deduction` line-item, and hr/form-16 was previously a bare "not
// available yet" stub). Kept as a browser-local map, same pattern as
// useReportExportHistory.ts, keyed by faculty id.
const STORAGE_KEY = "hr-documents-pf-status";

export interface DocumentsPfStatus {
  docsComplete: boolean;
  pfActive: boolean;
  form16Issued: boolean;
}

type StatusMap = Record<number, DocumentsPfStatus>;

let cachedRaw: string | null = null;
let cachedSnapshot: StatusMap = {};
const listeners = new Set<() => void>();

function parse(raw: string | null): StatusMap {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as StatusMap) : {};
  } catch {
    return {};
  }
}

function getSnapshot(): StatusMap {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parse(raw);
  }
  return cachedSnapshot;
}

function getServerSnapshot(): StatusMap {
  return {};
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function write(next: StatusMap) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  for (const listener of listeners) listener();
}

export function useDocumentsPfStatusMap(): StatusMap {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSetDocumentsPfStatus() {
  return useCallback((facultyId: number, patch: Partial<DocumentsPfStatus>) => {
    const current = getSnapshot();
    const existing = current[facultyId] ?? { docsComplete: false, pfActive: false, form16Issued: false };
    write({ ...current, [facultyId]: { ...existing, ...patch } });
  }, []);
}
