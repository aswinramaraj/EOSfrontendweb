"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useUpdatePayslipRequest } from "../hooks/usePayslipRequests";
import type { PayslipRequest } from "../types/api";

interface PayslipDecisionModalProps {
  request: PayslipRequest | null;
  action: "processed" | "rejected" | null;
  onClose: () => void;
}

// Approving is just HR's go-ahead on the request — it doesn't generate a
// payslip itself. Once approved, the faculty module (separate, built later)
// is where the faculty generates their own payslip from the underlying
// payroll data; this only needs to pass that gate through.
export function PayslipDecisionModal({ request, action, onClose }: PayslipDecisionModalProps) {
  return request && action ? (
    <PayslipDecisionModalContent key={`${request.id}-${action}`} request={request} action={action} onClose={onClose} />
  ) : null;
}

function PayslipDecisionModalContent({
  request,
  action,
  onClose,
}: {
  request: PayslipRequest;
  action: "processed" | "rejected";
  onClose: () => void;
}) {
  const { show } = useToast();
  const updateRequest = useUpdatePayslipRequest();
  const [fileUrl, setFileUrl] = useState("");

  const isApprove = action === "processed";

  function handleSubmit() {
    updateRequest.mutate(
      { id: request.id, input: { status: action, file_url: isApprove && fileUrl.trim() ? fileUrl.trim() : undefined } },
      {
        onSuccess: () => {
          show(
            isApprove
              ? `Approved — ${fullName(request.faculty)} can now generate this payslip.`
              : "Payslip request rejected.",
            "success",
          );
          onClose();
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to update this request.", "error"),
      },
    );
  }

  return (
    <Modal open onClose={onClose} title={isApprove ? "Approve payslip request" : "Reject payslip request"} subtitle={`${fullName(request.faculty)} · ${request.month}`}>
      <div className="flex flex-col gap-4">
        {isApprove ? (
          <>
            <p className="text-sm text-slate-600">
              Approving lets {fullName(request.faculty)} generate this payslip themselves from their own portal — no
              file needed from you here.
            </p>
            <FormField
              label="Payslip file URL"
              htmlFor="payslip-file-url"
              hint="Optional — only if you already have a direct link to hand over"
            >
              <TextInput
                id="payslip-file-url"
                type="url"
                placeholder="https://..."
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </FormField>
          </>
        ) : (
          <p className="text-sm text-slate-600">
            This will mark the request as rejected. {fullName(request.faculty)} can submit a new request afterward.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateRequest.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isApprove ? "primary" : "dangerSolid"}
            isPending={updateRequest.isPending}
            onClick={handleSubmit}
          >
            {isApprove ? "Approve" : "Reject"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
