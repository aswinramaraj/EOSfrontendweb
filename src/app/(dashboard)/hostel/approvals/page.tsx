"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { ApiError } from "@/shared/lib/api-client";
import { useOutings } from "@/modules/hostel/hooks/useOutings";
import { OutingsTable } from "@/modules/hostel/components/outings/OutingsTable";

const PAGE_SIZE = 20;

export default function ApprovalsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useOutings({ status: "pending", page, page_size: PAGE_SIZE });

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Leave and outing requests awaiting your decision."
      />

      <OutingsTable
        outings={data?.data ?? []}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load requests." : null}
        emptyMessage="Nothing awaiting a decision."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
