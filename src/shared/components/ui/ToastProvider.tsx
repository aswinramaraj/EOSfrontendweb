"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangleIcon, CheckIcon, XIcon } from "@/shared/components/icons";

export type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  title?: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
  /** A title + description toast (badge icon, bold title, muted
   *  description) — always rendered on a neutral/white card regardless of
   *  tone, matching a "batch queued"-style confirmation rather than a
   *  plain inline status line. */
  showDetailed: (title: string, message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-slate-200 bg-white text-slate-800",
};

const BADGE_STYLES: Record<ToastTone, string> = {
  success: "bg-green-100 text-green-600",
  error: "bg-red-100 text-red-600",
  info: "bg-blue-100 text-blue-600",
};

const BADGE_ICON: Record<ToastTone, typeof CheckIcon> = {
  success: CheckIcon,
  error: AlertTriangleIcon,
  info: CheckIcon,
};

const DISMISS_AFTER_MS: Record<ToastTone, number> = {
  success: 4000,
  info: 4000,
  error: 6000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Mirrors `toasts` synchronously so a duplicate check can read the current
  // list without waiting for a render — setState updaters must stay pure, so
  // the dedup check and the setTimeout side effect both live out here instead.
  const toastsRef = useRef<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => {
      const next = current.filter((toast) => toast.id !== id);
      toastsRef.current = next;
      return next;
    });
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      // Repeated clicks on the same stubbed/disabled action (or a fast
      // double-click on anything) shouldn't pile up N identical toasts.
      const isDuplicate = toastsRef.current.some(
        (t) => t.message === toast.message && t.tone === toast.tone && t.title === toast.title,
      );
      if (isDuplicate) return;

      const id = nextId.current++;
      const next = [...toastsRef.current, { id, ...toast }];
      toastsRef.current = next;
      setToasts(next);
      setTimeout(() => dismiss(id), DISMISS_AFTER_MS[toast.tone]);
    },
    [dismiss],
  );

  const show = useCallback((message: string, tone: ToastTone = "info") => addToast({ message, tone }), [addToast]);

  const showDetailed = useCallback(
    (title: string, message: string, tone: ToastTone = "success") => addToast({ title, message, tone }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={{ show, showDetailed }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const BadgeIcon = BADGE_ICON[toast.tone];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-md ${
                toast.title ? TONE_STYLES.info : TONE_STYLES[toast.tone]
              }`}
            >
              {toast.title ? (
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${BADGE_STYLES[toast.tone]}`}
                  >
                    <BadgeIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{toast.title}</p>
                    <p className="mt-0.5 text-slate-600">{toast.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  {toast.tone === "success" && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{toast.message}</span>
                </div>
              )}
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-current opacity-60 hover:opacity-100"
                aria-label="Dismiss"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
