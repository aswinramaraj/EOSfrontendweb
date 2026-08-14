"use client";

import { useMemo, useState } from "react";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { CopyIcon, LayersIcon, PencilIcon, PeopleIcon, PlusIcon, TargetIcon, TrashIcon } from "@/shared/components/icons";
import { AppraisalCriterionFormModal } from "@/modules/hr/components/AppraisalCriterionFormModal";
import {
  useAppraisalCriteria,
  useAppraisalDivisions,
  useCreateAppraisalCriterion,
  useDeleteAppraisalCriterion,
} from "@/modules/hr/hooks/useAppraisalCriteria";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HRStatGridSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
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
  const { data: facultyCount } = useFaculties({ limit: 1 });

  const allRows = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allRows;
    return allRows.filter((row) => row.criteria_name.toLowerCase().includes(query));
  }, [allRows, search]);

  const totalMaxScore = allRows.reduce((sum, row) => sum + row.max_score, 0);
  const divisionCount = new Set(allRows.map((row) => row.division_id)).size;

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

  function resetFilters() {
    setSearch("");
    setDivisionId(ALL);
    setAcademicYear(ALL);
  }

  return (
    <div>
      <HRPageHeader
        title="Criteria Library"
        description="Define weighted appraisal criteria used across all faculty performance reviews."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingCriterion(null);
              setFormOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            New Criterion
          </Button>
        }
      />

      {isLoading ? (
        <div className="mb-5">
          <HRStatGridSkeleton count={4} />
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HRStatCard icon={LayersIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Active criteria" value={allRows.length} caption={`Across ${divisionCount} divisions`} />
          <HRStatCard icon={TargetIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Total max score" value={totalMaxScore} />
          <HRStatCard icon={PeopleIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Applied to" value={facultyCount?.meta.total ?? 0} caption="All teaching and support staff" />
          <HRStatCard icon={LayersIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Divisions" value={divisionCount} />
        </div>
      )}

      <HRFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search criteria…"
        onReset={resetFilters}
        resultCount={{ showing: filtered.length, total: allRows.length, noun: "records" }}
        filters={
          <>
            <SelectInput className="w-auto" value={divisionId} onChange={(e) => setDivisionId(e.target.value)}>
              <option value={ALL}>All Divisions</option>
              {divisions?.map((division) => (
                <option key={division.id} value={String(division.id)}>
                  {division.name}
                </option>
              ))}
            </SelectInput>
            <SelectInput className="w-auto" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
              <option value={ALL}>All Years</option>
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </SelectInput>
          </>
        }
      />

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

      <p className="mt-5 text-xs text-slate-400">Total weight must equal 100 for a cycle to be published · current total {totalMaxScore}.</p>

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
