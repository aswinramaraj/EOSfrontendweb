"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { TextInput } from "@/shared/components/ui/TextInput";
import { DatePicker } from "@/shared/components/ui/DatePicker";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useUpdateOfferDetails } from "../../hooks/useApplicationMutations";
import type { Offer, OfferResponseStatus } from "../../types";

function lpa(value: number | undefined): string {
  return value == null ? "—" : `₹${value.toFixed(1)} LPA`;
}

interface UpdateOfferModalProps {
  open: boolean;
  offer: Offer | null;
  onClose: () => void;
}

export function UpdateOfferModal({ open, offer, onClose }: UpdateOfferModalProps) {
  const { show } = useToast();
  const updateOfferDetails = useUpdateOfferDetails();
  const [status, setStatus] = useState<OfferResponseStatus>(offer?.offerResponse ?? "pending");
  const [joiningDate, setJoiningDate] = useState(offer?.joiningDate ?? "");
  const [workLocation, setWorkLocation] = useState(offer?.workLocation ?? "");

  // Re-hydrate from the current offer every time the modal opens for a
  // (possibly different) offer — deliberate one-shot hydration on
  // open/offer-change, not the external-sync setState the rule targets.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setStatus(offer?.offerResponse ?? "pending");
    setJoiningDate(offer?.joiningDate ?? "");
    setWorkLocation(offer?.workLocation ?? "");
  }, [offer, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!offer) return null;
  const currentOffer = offer;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateOfferDetails.mutate(
      {
        driveId: currentOffer.driveId,
        studentId: currentOffer.studentId,
        offerResponse: status,
        joiningDate: joiningDate || undefined,
        workLocation: workLocation || undefined,
      },
      {
        onSuccess: () => {
          show("Offer status updated.", "success");
          onClose();
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update offer status"
      subtitle={`${currentOffer.studentName ?? currentOffer.studentIdNo} · ${currentOffer.companyName} · ${lpa(
        currentOffer.offeredPackageLpa ?? currentOffer.packageLpa,
      )}`}
      widthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Status" htmlFor="offer-status">
          <SelectInput
            id="offer-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OfferResponseStatus)}
          >
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </SelectInput>
        </FormField>

        {status === "accepted" && (
          <>
            <FormField label="Joining date" htmlFor="offer-joining-date">
              <DatePicker
                id="offer-joining-date"
                value={joiningDate || undefined}
                onChange={(v) => setJoiningDate(v ?? "")}
                min="2020-01-01"
                max="2030-12-31"
              />
            </FormField>
            <FormField label="Location" htmlFor="offer-location">
              <TextInput
                id="offer-location"
                placeholder="e.g. Chennai"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
              />
            </FormField>
          </>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateOfferDetails.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={updateOfferDetails.isPending}>
            Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}
