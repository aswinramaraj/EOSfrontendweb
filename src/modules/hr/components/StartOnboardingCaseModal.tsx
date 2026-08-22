"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useHrDepartments } from "@/modules/hr/hooks/useHrDepartments";
import { useCreateOnboardingCase } from "@/modules/hr/local/onboarding-exits-store";
import type { OnboardingCaseType } from "@/modules/hr/local/types";

interface StartOnboardingCaseModalProps {
  open: boolean;
  type: OnboardingCaseType;
  onClose: () => void;
}

export function StartOnboardingCaseModal({ open, type, onClose }: StartOnboardingCaseModalProps) {
  const { show } = useToast();
  const { data: departments } = useHrDepartments();
  const createCase = useCreateOnboardingCase();

  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designation, setDesignation] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  function reset() {
    setName("");
    setDepartmentId("");
    setDesignation("");
    setEffectiveDate("");
  }

  function handleSave() {
    const dept = departments?.find((d) => String(d.id) === departmentId);
    if (!name.trim() || !dept || !designation.trim() || !effectiveDate) {
      show("All fields are required.", "error");
      return;
    }
    createCase({
      type,
      name: name.trim(),
      departmentId: dept.id,
      departmentName: dept.name,
      designation: designation.trim(),
      effectiveDate,
    });
    show(type === "onboarding" ? "Onboarding case started." : "Exit case started.", "success");
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={type === "onboarding" ? "Start onboarding" : "Start exit"} widthClassName="max-w-md">
      <div className="flex flex-col gap-4">
        <FormField label="Name" htmlFor="case-name" required>
          <TextInput id="case-name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Department" htmlFor="case-dept" required>
          <SelectInput id="case-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">Select department</option>
            {departments?.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Designation" htmlFor="case-designation" required>
          <TextInput id="case-designation" placeholder="e.g. Assistant Professor" value={designation} onChange={(e) => setDesignation(e.target.value)} />
        </FormField>
        <FormField label={type === "onboarding" ? "Joining date" : "Last working day"} htmlFor="case-date" required>
          <TextInput id="case-date" type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {type === "onboarding" ? "Start onboarding" : "Start exit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
