"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useHrDepartments } from "@/modules/hr/hooks/useHrDepartments";
import { useCreateVacancy } from "@/modules/hr/local/recruitment-store";

interface PostVacancyModalProps {
  open: boolean;
  onClose: () => void;
}

export function PostVacancyModal({ open, onClose }: PostVacancyModalProps) {
  const { show } = useToast();
  const { data: departments } = useHrDepartments();
  const createVacancy = useCreateVacancy();

  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positions, setPositions] = useState("1");
  const [employmentType, setEmploymentType] = useState<"teaching" | "non-teaching">("teaching");

  function reset() {
    setRole("");
    setDepartmentId("");
    setPositions("1");
    setEmploymentType("teaching");
  }

  function handleSave() {
    const dept = departments?.find((d) => String(d.id) === departmentId);
    if (!role.trim() || !dept || !Number(positions)) {
      show("Role, department and positions are required.", "error");
      return;
    }
    createVacancy({
      role: role.trim(),
      departmentId: dept.id,
      departmentName: dept.name,
      positions: Number(positions),
      employmentType,
    });
    show("Vacancy posted.", "success");
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Post vacancy" widthClassName="max-w-md">
      <div className="flex flex-col gap-4">
        <FormField label="Role" htmlFor="vac-role" required>
          <TextInput id="vac-role" placeholder="e.g. Assistant Professor · Data Science" value={role} onChange={(e) => setRole(e.target.value)} />
        </FormField>
        <FormField label="Department" htmlFor="vac-dept" required>
          <SelectInput id="vac-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">Select department</option>
            {departments?.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Positions" htmlFor="vac-positions" required>
            <NumberInput id="vac-positions" min={1} value={positions} onChange={(e) => setPositions(e.target.value)} />
          </FormField>
          <FormField label="Type" htmlFor="vac-type">
            <SelectInput id="vac-type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value as "teaching" | "non-teaching")}>
              <option value="teaching">Teaching</option>
              <option value="non-teaching">Non-teaching</option>
            </SelectInput>
          </FormField>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Post vacancy
          </Button>
        </div>
      </div>
    </Modal>
  );
}
