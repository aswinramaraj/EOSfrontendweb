"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { CopyIcon, PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { AppraisalCriterionFormModal } from "@/modules/hr/components/AppraisalCriterionFormModal";
import {
  useAppraisalCriteria,
  useAppraisalDivisions,
  useCreateAppraisalCriterion,
  useDeleteAppraisalCriterion,
} from "@/modules/hr/hooks/useAppraisalCriteria";
import type { AppraisalCriterion } from "@/modules/hr/types/api";

const ALL = "all";
const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const startYear = CURRENT_YEAR - i;
  return `${startYear}-${startYear + 1}`;
});

export default function HRCriteriaLibraryPage() {
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [divisionId, setDivisionId] = useState(ALL);
  const [academicYear, setAcademicYear] = useState(ALL);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<AppraisalCriterion | null>(null);
  const [deletingCriterion, setDeletingCriterion] = useState<AppraisalCriterion | null>(null);

  const { data: divisions } = useAppraisalDivisions();
  const { data, isLoading, error } = useAppraisalCriteria({
    division_id: divisionId !== ALL ? Number(divisionId) : undefined,
    academic_year: academicYear !== ALL ? academicYear : undefined,
    limit: 100,
  });
  const createCriterion = useCreateAppraisalCriterion();
  const deleteCriterion = useDeleteAppraisalCriterion();

  const filtered = useMemo(() => {
    const rows = data?.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.criteria_name.toLowerCase().includes(query));
  }, [data, search]);

  function handleDuplicate(row: AppraisalCriterion) {
    createCriterion.mutate(
      {
        division_id: row.division_id,
        criteria_name: `${row.criteria_name} (Copy)`,
        max_score: row.max_score,
        academic_year: row.academic_year,
      },
      {
        onSuccess: () => show(`Duplicated "${row.criteria_name}".`, "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Could not duplicate.", "error"),
      },
    );
  }

  function handleDelete() {
    if (!deletingCriterion) return;
    deleteCriterion.mutate(deletingCriterion.id, {
      onSuccess: () => {
        show("Criterion deleted.", "success");
        setDeletingCriterion(null);
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Could not delete.", "error"),
    });
  }

  return (
    <div>
      <PageHeader
        title="Criteria Library"
        description="Define and manage appraisal criteria for faculty performance reviews."
        actions={
          <button
            onClick={() => {
              setEditingCriterion(null);
              setFormOpen(true);
            }}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            <PlusIcon className="h-4 w-4" />
            New Criterion
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            placeholder="Search criteria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <SelectInput className="sm:w-44" value={divisionId} onChange={(e) => setDivisionId(e.target.value)}>
          <option value={ALL}>All Divisions</option>
          {divisions?.map((division) => (
            <option key={division.id} value={String(division.id)}>
              {division.name}
            </option>
          ))}
        </SelectInput>

        <SelectInput className="sm:w-36" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
          <option value={ALL}>All Years</option>
          {ACADEMIC_YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </SelectInput>
      </div>

      <DataTable<AppraisalCriterion>
        isLoading={isLoading}
        error={error ? (error instanceof ApiError ? error.message : "Failed to load criteria.") : null}
        columns={[
          {
            key: "criteria_name",
            header: "Title",
            render: (row) => <span className="font-semibold text-slate-900">{row.criteria_name}</span>,
          },
          { key: "division", header: "Division", render: (row) => row.appraisal_divisions.name },
          { key: "max_score", header: "Max Score" },
          { key: "academic_year", header: "Academic Year" },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingCriterion(row);
                    setFormOpen(true);
                  }}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDuplicate(row)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Duplicate"
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeletingCriterion(row)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="No criteria match these filters."
      />

      <AppraisalCriterionFormModal open={formOpen} criterion={editingCriterion} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={deletingCriterion !== null}
        title="Delete criterion"
        message={`Are you sure you want to delete "${deletingCriterion?.criteria_name}"? This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteCriterion.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeletingCriterion(null)}
      />
    </div>
  );
}
