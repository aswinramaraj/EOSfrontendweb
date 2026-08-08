"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { ApiError } from "@/shared/lib/api-client";
import { useOutings } from "@/modules/hostel/hooks/useOutings";
import { OutingsTable } from "@/modules/hostel/components/outings/OutingsTable";
import type { OutingStatus } from "@/modules/hostel/types/outings";

const PAGE_SIZE = 20;
type Tab = "all" | OutingStatus;

export default function LeaveRequestsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useOutings({
    status: tab === "all" ? undefined : tab,
    page,
    page_size: PAGE_SIZE,
  });

  return (
    <div>
      <PageHeader
        title="Leave requests"
        description="Home leave and outstation permissions — days applied for and the stated reason."
      />

      <div className="mb-4">
        <SegmentedControl<Tab>
          options={[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
        />
      </div>

      <OutingsTable
        outings={data?.data ?? []}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load requests." : null}
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
