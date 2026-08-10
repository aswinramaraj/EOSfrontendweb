"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { TextInput } from "@/shared/components/ui/TextInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ClipboardIcon, CheckIcon, LockIcon } from "@/shared/components/icons";
import { friendlyError } from "@/modules/admissions/wizard/shared";
import { useResetStudentPassword } from "../hooks/useStudents";

/**
 * There's still no email/SMS delivery to a student (see the admit wizard's
 * own notice) — so a reset, like admission itself, ends with the admin
 * reading a plaintext password off the screen and handing it over directly.
 * The result is shown exactly once: password_hash is one-way, so this
 * response is the only place the plaintext will ever exist again.
 */
export function ResetPasswordModal({
  studentId,
  studentName,
  open,
  onClose,
}: {
  studentId: number;
  studentName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { show } = useToast();
  const resetPassword = useResetStudentPassword();
  const [mode, setMode] = useState<"generate" | "custom">("generate");
  const [customPassword, setCustomPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClose() {
    onClose();
    // Reset after the close animation would run, if this Modal had one —
    // there isn't one, so this is safe to do immediately.
    setMode("generate");
    setCustomPassword("");
    setAdminPassword("");
    setError(null);
    setAdminPasswordError(null);
    setResult(null);
    setCopied(false);
  }

  async function handleSubmit() {
    let hasError = false;
    if (!adminPassword) {
      setAdminPasswordError("Re-enter your password to confirm.");
      hasError = true;
    }
    if (mode === "custom") {
      if (customPassword.length < 6) {
        setError("At least 6 characters.");
        hasError = true;
      } else if (customPassword.length > 72) {
        setError("72 characters or fewer.");
        hasError = true;
      }
    }
    if (hasError) return;
    setError(null);
    setAdminPasswordError(null);
    try {
      const { password } = await resetPassword.mutateAsync({
        id: studentId,
        adminPassword,
        password: mode === "custom" ? customPassword : undefined,
      });
      setResult(password);
    } catch (err) {
      if (err instanceof ApiError && err.errorCode === "ADMIN_PASSWORD_INCORRECT") {
        setAdminPasswordError("That's not your current password.");
        return;
      }
      show(friendlyError(err), "error");
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      show("Couldn't copy — select and copy the password manually.", "error");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Reset password" widthClassName="max-w-md">
      {result ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            New password for <strong>{studentName}</strong>. Copy it now and hand it to the student directly —
            it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
            <LockIcon className="h-4 w-4 shrink-0 text-amber-600" />
            <code className="flex-1 select-all break-all font-mono text-sm text-amber-900">{result}</code>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy to clipboard"
              className="shrink-0 rounded-md p-1.5 text-amber-700 hover:bg-amber-100"
            >
              {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Sets a new password for <strong>{studentName}</strong>&apos;s login. There&apos;s no email/SMS delivery
            yet, so whatever password results here has to be handed to the student directly.
          </p>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                checked={mode === "generate"}
                onChange={() => setMode("generate")}
                className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-500"
              />
              Generate a random password
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                checked={mode === "custom"}
                onChange={() => setMode("custom")}
                className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-500"
              />
              Set a specific password
            </label>
            {mode === "custom" && (
              <div className="ml-6 mt-1">
                <TextInput
                  type="text"
                  value={customPassword}
                  onChange={(e) => {
                    setCustomPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Minimum 6 characters"
                  maxLength={72}
                  hasError={!!error}
                  autoComplete="new-password"
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
            <label className="text-sm font-medium text-slate-700">Confirm your password</label>
            <TextInput
              type="password"
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setAdminPasswordError(null);
              }}
              placeholder="Your own login password"
              hasError={!!adminPasswordError}
              autoComplete="current-password"
            />
            {adminPasswordError ? (
              <p className="text-xs text-red-600">{adminPasswordError}</p>
            ) : (
              <p className="text-xs text-slate-400">Required to confirm it&apos;s really you making this change.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={handleClose} disabled={resetPassword.isPending}>
              Cancel
            </Button>
            <Button variant="primary" isPending={resetPassword.isPending} onClick={handleSubmit}>
              Reset password
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
