"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useDrives } from "@/modules/placement/hooks/useDrives";
import { DriveCard } from "@/modules/placement/components/drives/DriveCard";
import type { DriveStatus } from "@/modules/placement/types";

export default function PlacementDrivesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<DriveStatus | "">("");
  const { data, isLoading, error } = useDrives({ status: status || undefined });

  return (
    <div>
      <PageHeader
        title="Placement Drives"
        actions={
          <>
            <SelectInput value={status} onChange={(e) => setStatus(e.target.value as DriveStatus | "")} className="w-40">
              <option value="">All drives</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </SelectInput>
            <Button variant="primary" onClick={() => router.push("/placement/drives/new")}>
              <PlusIcon className="h-4 w-4" /> Schedule drive
            </Button>
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load drives."}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((drive) => <DriveCard key={drive.id} drive={drive} />)}
          {data?.length === 0 && <p className="text-sm text-slate-500">No drives match this filter.</p>}
        </div>
      )}
    </div>
  );
}
