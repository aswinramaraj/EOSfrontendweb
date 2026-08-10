import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { durationLabel, formatDate } from "../lib/request-format";
import type { ApprovalStatus, HrUnifiedRequest } from "../types/api";

const APPROVAL_TONE: Record<ApprovalStatus, PillTone> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

interface RequestListItemProps {
  request: HrUnifiedRequest;
  index: number;
  onOpen: (request: HrUnifiedRequest) => void;
}

export function RequestListItem({ request, onOpen }: RequestListItemProps) {
  return (
    <button
      onClick={() => onOpen(request)}
      className="flex w-full flex-col gap-2 border-b border-slate-100 px-5 py-4 text-left last:border-b-0 hover:bg-slate-50"
    >
      <div className="flex flex-wrap items-center gap-4">
        <FacultyAvatar faculty={request.faculty} className="h-9 w-9 rounded-full text-sm" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-blue-700">{fullName(request.faculty)}</p>
          <p className="text-xs text-slate-500">
            {request.faculty.department.name} · ID {request.faculty.id}
          </p>
        </div>

        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {request.kind === "leave" ? "Leave" : "OD"}
        </span>
        <span className="text-sm font-medium text-slate-800">
          {durationLabel(request.from_date, request.to_date)}
        </span>
        <span className="text-xs text-slate-500">Applied {formatDate(request.created_at)}</span>

        <div className="ml-auto flex items-center gap-2 text-right">
          <StatusPill tone={APPROVAL_TONE[request.hod_approval_status]}>
            HOD: {APPROVAL_LABEL[request.hod_approval_status]}
          </StatusPill>
          <StatusPill tone={APPROVAL_TONE[request.hr_approval_status]}>
            HR: {APPROVAL_LABEL[request.hr_approval_status]}
          </StatusPill>
        </div>
      </div>

      <p className="pl-13 text-sm text-slate-600">{request.detail ?? "No details provided."}</p>
    </button>
  );
}
