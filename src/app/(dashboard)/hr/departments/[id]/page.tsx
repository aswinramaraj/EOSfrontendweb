"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { ChevronLeftIcon } from "@/shared/components/icons";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { FacultyDirectoryCard } from "@/modules/hr/components/FacultyDirectoryCard";
import { RequestListItem } from "@/modules/hr/components/RequestListItem";
import { RequestDetailDrawer } from "@/modules/hr/components/RequestDetailDrawer";
import { useHrDepartment } from "@/modules/hr/hooks/useHrDepartments";
import { useHrRequests } from "@/modules/hr/hooks/useHrRequests";
import { PercentStatTile } from "@/modules/hr/components/PercentStatTile";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRCard } from "@/modules/hr/components/ui/HRCard";
import { HRPageSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import type { DepartmentAppraisalRollupStatus, HrUnifiedRequest } from "@/modules/hr/types/api";

const APPRAISAL_STATUS_TONE: Record<DepartmentAppraisalRollupStatus, PillTone> = {
  not_started: "slate",
  in_progress: "amber",
  complete: "green",
};

const APPRAISAL_STATUS_LABEL: Record<DepartmentAppraisalRollupStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
};

export default function HRDepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const departmentId = Number(id);
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<HrUnifiedRequest | null>(null);

  const { data: department, isLoading, error } = useHrDepartment(departmentId);
  const { data: facultyData } = useFaculties({ department_id: departmentId, limit: 50 });
  const { data: requestsData } = useHrRequests({ department_id: departmentId, limit: 50 });

  const faculty = facultyData?.data ?? [];
  const requests = requestsData?.data ?? [];

  if (isLoading) {
    return <HRPageSkeleton statCount={4} cardCount={4} cardContentClassName="h-32" blockCount={1} blockContentClassName="h-40" />;
  }

  if (error || !department) {
    return (
      <div>
        <HRPageHeader title="Department not found" description="This department doesn't exist." />
        <Link href="/hr/departments" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          ← Back to Departments
        </Link>
      </div>
    );
  }

  return (
    <div>
      <HRPageHeader
        title={department.name}
        description={`Department code: ${department.code}`}
        actions={
          <Link href="/hr/departments">
            <Button variant="secondary">
              <ChevronLeftIcon className="h-4 w-4" />
              All Departments
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        <HRCard>
          <p className="text-sm text-slate-500">Total Faculty</p>
          <p className="mt-1 text-[26px] font-black text-slate-900">{department.total_faculty}</p>
        </HRCard>
        <PercentStatTile
          label="On Leave Today"
          percent={department.total_faculty ? (department.on_leave_today / department.total_faculty) * 100 : 0}
          subtitle={`${department.on_leave_today} of ${department.total_faculty} faculty`}
        />
        <PercentStatTile
          label="On OD Today"
          percent={department.total_faculty ? (department.on_od_today / department.total_faculty) * 100 : 0}
          subtitle={`${department.on_od_today} of ${department.total_faculty} faculty`}
        />
        <HRCard>
          <p className="text-sm text-slate-500">Pending Requests</p>
          <p className="mt-1 text-[26px] font-black text-slate-900">{department.pending_requests}</p>
        </HRCard>
        <HRCard>
          <p className="text-sm text-slate-500">Appraisal Status</p>
          <div className="mt-2">
            <StatusPill tone={APPRAISAL_STATUS_TONE[department.appraisal_status]}>
              {APPRAISAL_STATUS_LABEL[department.appraisal_status]}
            </StatusPill>
          </div>
        </HRCard>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-base font-bold text-slate-900">Faculty ({faculty.length})</h3>
        {faculty.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
            No faculty records for this department yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {faculty.map((member) => (
              <FacultyDirectoryCard
                key={member.id}
                faculty={member}
                onOpenProfile={(f) => router.push(`/hr/faculty-directory/${f.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-base font-bold text-slate-900">Leave & OD Requests ({requests.length})</h3>
        <div className="rounded-xl border border-slate-200 bg-white">
          {requests.map((request, index) => (
            <RequestListItem key={request.id} request={request} index={index} onOpen={setSelectedRequest} />
          ))}
          {requests.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No requests from this department.</p>
          )}
        </div>
      </div>

      <RequestDetailDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
}
