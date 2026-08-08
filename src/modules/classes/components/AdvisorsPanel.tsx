"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/Button";
import { useClasses } from "../hooks/useClasses";
import { AssignAdvisorModal } from "./AssignAdvisorModal";
import type { ClassSummary } from "../types";

export function AdvisorsPanel() {
  const { data, isLoading, error } = useClasses();
  const [target, setTarget] = useState<ClassSummary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openAssign(klass: ClassSummary) {
    setTarget(klass);
    setModalOpen(true);
  }

  const columns: DataTableColumn<ClassSummary>[] = [
    {
      key: "class",
      header: "Class",
      render: (row) => `${row.course.code}-${row.section}`,
    },
    { key: "department", header: "Department", render: (row) => row.department.name },
    { key: "batch", header: "Batch", render: (row) => row.batch.name },
    {
      key: "advisor",
      header: "Advisor",
      render: (row) =>
        row.mentor ? (
          <span>
            {row.mentor.name} <span className="text-slate-400">({row.mentor.academic_year})</span>
          </span>
        ) : (
          <StatusPill tone="slate">Unassigned</StatusPill>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Button size="sm" variant={row.mentor ? "secondary" : "primary"} onClick={() => openAssign(row)}>
          {row.mentor ? "Reassign" : "Assign advisor"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Advisors"
        description="Assign a faculty member as class mentor (Advisor) for each class."
      />

      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load classes." : null}
        emptyMessage="No classes found."
      />

      <AssignAdvisorModal
        open={modalOpen}
        klass={target}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
