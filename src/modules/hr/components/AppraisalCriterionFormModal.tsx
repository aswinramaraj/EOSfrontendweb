"use client";

import { useEffect, useState } from "react";
import { useForm, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import {
  useAppraisalDivisions,
  useCreateAppraisalCriterion,
  useCreateAppraisalDivision,
  useUpdateAppraisalCriterion,
} from "../hooks/useAppraisalCriteria";
import {
  appraisalCriterionFormSchema,
  type AppraisalCriterionFormValues,
} from "../schemas/appraisal-criterion-form.schema";
import type { AppraisalCriterion, AppraisalDivision } from "../types/api";

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_ACADEMIC_YEAR = `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`;

interface DivisionFieldProps {
  divisions: AppraisalDivision[] | undefined;
  hasError: boolean;
  register: UseFormRegister<AppraisalCriterionFormValues>;
  setValue: UseFormSetValue<AppraisalCriterionFormValues>;
}

// Its own component (rather than state hoisted into the parent) so that
// remounting via `key` on criterion/open change resets addingDivision without
// a setState-in-effect.
function DivisionField({ divisions, hasError, register, setValue }: DivisionFieldProps) {
  const { show } = useToast();
  const createDivision = useCreateAppraisalDivision();
  const [addingDivision, setAddingDivision] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState("");

  function handleAddDivision() {
    const name = newDivisionName.trim();
    if (!name) return;
    createDivision.mutate(name, {
      onSuccess: (division) => {
        setValue("division_id", division.id);
        setAddingDivision(false);
        setNewDivisionName("");
      },
      onError: (err: unknown) => {
        show(err instanceof ApiError ? err.message : "Could not add division.", "error");
      },
    });
  }

  if (addingDivision) {
    return (
      <div className="flex items-center gap-2">
        <TextInput
          id="criterion-division-new"
          autoFocus
          placeholder="Division name"
          value={newDivisionName}
          onChange={(e) => setNewDivisionName(e.target.value)}
        />
        <Button type="button" size="sm" onClick={handleAddDivision} isPending={createDivision.isPending}>
          Add
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setAddingDivision(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SelectInput
        id="criterion-division"
        hasError={hasError}
        {...register("division_id", { setValueAs: (v: string) => (v === "" ? undefined : Number(v)) })}
      >
        <option value="">Select division</option>
        {divisions?.map((division) => (
          <option key={division.id} value={division.id}>
            {division.name}
          </option>
        ))}
      </SelectInput>
      <Button type="button" size="sm" variant="secondary" onClick={() => setAddingDivision(true)}>
        New
      </Button>
    </div>
  );
}

interface AppraisalCriterionFormModalProps {
  open: boolean;
  criterion: AppraisalCriterion | null;
  onClose: () => void;
}

export function AppraisalCriterionFormModal({ open, criterion, onClose }: AppraisalCriterionFormModalProps) {
  const { show } = useToast();
  const { data: divisions } = useAppraisalDivisions();
  const createCriterion = useCreateAppraisalCriterion();
  const updateCriterion = useUpdateAppraisalCriterion();
  const isEditing = criterion !== null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AppraisalCriterionFormValues>({
    resolver: zodResolver(appraisalCriterionFormSchema),
    defaultValues: {
      division_id: criterion?.division_id,
      criteria_name: criterion?.criteria_name ?? "",
      max_score: criterion?.max_score,
      academic_year: criterion?.academic_year ?? DEFAULT_ACADEMIC_YEAR,
    },
  });

  useEffect(() => {
    reset({
      division_id: criterion?.division_id,
      criteria_name: criterion?.criteria_name ?? "",
      max_score: criterion?.max_score,
      academic_year: criterion?.academic_year ?? DEFAULT_ACADEMIC_YEAR,
    });
  }, [criterion, open, reset]);

  function onSubmit(values: AppraisalCriterionFormValues) {
    const mutation = isEditing
      ? updateCriterion.mutateAsync({ id: criterion.id, input: values })
      : createCriterion.mutateAsync(values);

    mutation
      .then(() => {
        show(isEditing ? "Criterion updated." : "Criterion added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createCriterion.isPending || updateCriterion.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit criterion" : "New criterion"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Division" htmlFor="criterion-division" required error={errors.division_id?.message}>
          <DivisionField
            key={open ? (criterion?.id ?? "new") : "closed"}
            divisions={divisions}
            hasError={!!errors.division_id}
            register={register}
            setValue={setValue}
          />
        </FormField>

        <FormField label="Criteria name" htmlFor="criterion-name" required error={errors.criteria_name?.message}>
          <TextInput id="criterion-name" hasError={!!errors.criteria_name} {...register("criteria_name")} />
        </FormField>

        <FormField label="Max score" htmlFor="criterion-max-score" required error={errors.max_score?.message}>
          <NumberInput
            id="criterion-max-score"
            hasError={!!errors.max_score}
            {...register("max_score", { setValueAs: (v: string) => (v === "" ? undefined : Number(v)) })}
          />
        </FormField>

        <FormField
          label="Academic year"
          htmlFor="criterion-academic-year"
          required
          hint="e.g. 2026-2027"
          error={errors.academic_year?.message}
        >
          <TextInput id="criterion-academic-year" hasError={!!errors.academic_year} {...register("academic_year")} />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add criterion"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
