"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { ShieldCheckIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { facultyVerificationService, type OtpChannel } from "../services/faculty-verification.service";

interface OtpVerifyDialogProps {
  open: boolean;
  fieldLabel: string;
  channel: OtpChannel;
  phoneNumber: string;
  onVerified: () => void;
  onClose: () => void;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

// Real Twilio Verify integration — the backend owns OTP generation, expiry,
// and attempt-counting entirely (see faculty-verification.service.ts /
// EOSbackend1's FacultyVerificationService). This component only ever
// renders the existing digit-entry UI and reports send/check results; it
// never generates or stores a code itself.
export function OtpVerifyDialog({ open, fieldLabel, channel, phoneNumber, onVerified, onClose }: OtpVerifyDialogProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(6).fill(""));
  const [codeError, setCodeError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendMutation = useMutation({
    mutationFn: () => facultyVerificationService.send(phoneNumber, channel),
    onSuccess: () => inputRefs.current[0]?.focus(),
  });

  const checkMutation = useMutation({
    mutationFn: (code: string) => facultyVerificationService.check(phoneNumber, code),
    onSuccess: (result) => {
      if (result.valid) onVerified();
      else setCodeError("Incorrect code. Try again.");
    },
  });

  // Resets to a clean slate every time the dialog transitions closed -> open.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDigits(Array(6).fill(""));
    setCodeError(null);
    sendMutation.reset();
    checkMutation.reset();
  }

  useEffect(() => {
    if (open) sendMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setCodeError(null);
    checkMutation.reset();
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleVerify() {
    const entered = digits.join("");
    if (entered.length < 6) {
      setCodeError("Enter all 6 digits.");
      return;
    }
    setCodeError(null);
    checkMutation.mutate(entered);
  }

  function handleResend() {
    setDigits(Array(6).fill(""));
    setCodeError(null);
    checkMutation.reset();
    sendMutation.mutate();
  }

  const isSending = sendMutation.isPending;
  const isVerifying = checkMutation.isPending;
  const sendFailed = sendMutation.isError;

  const checkNetworkError =
    checkMutation.isError ? errorMessage(checkMutation.error, "Couldn't verify that code. Check your connection and try again.") : null;
  const inlineError = codeError ?? checkNetworkError;

  return (
    <Modal open={open} onClose={onClose} title={`Verify ${fieldLabel}`} widthClassName="max-w-sm">
      <div className="flex flex-col items-center gap-4 py-1 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ShieldCheckIcon className="h-6 w-6" />
        </span>

        {isSending ? (
          <p className="text-sm text-slate-600">
            Sending a code to <span className="font-semibold text-slate-900">{phoneNumber}</span> via{" "}
            {channel === "whatsapp" ? "WhatsApp" : "SMS"}…
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            We sent a verification code to <span className="font-semibold text-slate-900">{phoneNumber}</span> via{" "}
            {channel === "whatsapp" ? "WhatsApp" : "SMS"}.
          </p>
        )}

        {sendFailed && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-left text-xs text-red-700">
            {errorMessage(sendMutation.error, "Couldn't reach the verification service. Check your connection and try again.")}
          </div>
        )}

        <div className="flex gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isSending || isVerifying || sendFailed}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`h-12 w-10 rounded-md border text-center text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 ${
                inlineError ? "border-red-300" : "border-slate-300 focus:border-blue-600"
              }`}
            />
          ))}
        </div>

        {inlineError && <p className="text-xs text-red-600">{inlineError}</p>}

        <button
          type="button"
          onClick={handleResend}
          disabled={isSending}
          className="text-xs font-medium text-blue-700 hover:underline disabled:text-slate-400"
        >
          {sendFailed ? "Try sending again" : "Didn't receive a code? Resend"}
        </button>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleVerify}
          isPending={isVerifying}
          disabled={isSending || sendFailed}
        >
          Verify &amp; authenticate
        </Button>
      </div>
    </Modal>
  );
}
