"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useMessFeedback } from "../../hooks/useMessFeedback";
import { MessFeedbackFormModal } from "./MessFeedbackFormModal";
import type { MessFeedback } from "../../types/mess-feedback";

const PAGE_SIZE = 20;

export function MessFeedbackPanel() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, error } = useMessFeedback({ page, page_size: PAGE_SIZE });

  const columns: DataTableColumn<MessFeedback>[] = [
    { key: "rating", header: "Rating", render: (row) => `${row.rating} / 5` },
    { key: "comment", header: "Comment", render: (row) => row.comment ?? "—" },
    { key: "created_at", header: "Submitted", render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader
        title="Mess feedback"
        description={
          data?.average_rating != null
            ? `Average rating: ${data.average_rating} / 5 (${data.total} responses)`
            : "No feedback recorded yet."
        }
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <PlusIcon className="h-4 w-4" /> Record feedback
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load feedback." : null}
        emptyMessage="No mess feedback yet."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <MessFeedbackFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
