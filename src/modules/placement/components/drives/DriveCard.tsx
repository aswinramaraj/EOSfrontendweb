import Link from "next/link";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import type { PillTone } from "@/shared/components/ui/StatusPill";
import type { PlacementDrive } from "../../types";

const STATUS_LABEL: Record<PlacementDrive["status"], string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<PlacementDrive["status"], PillTone> = {
  scheduled: "blue",
  completed: "slate",
  cancelled: "red",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

interface DriveCardProps {
  drive: PlacementDrive;
}

export function DriveCard({ drive }: DriveCardProps) {
  const isUndisclosed = !drive.isDisclosed;

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
            {isUndisclosed ? "?" : drive.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {isUndisclosed ? `Company #${drive.companyId}` : drive.companyName}
            </p>
            {drive.role && <p className="truncate text-xs text-slate-500">{drive.role}</p>}
          </div>
        </div>
        <StatusPill tone={STATUS_TONE[drive.status]}>{STATUS_LABEL[drive.status]}</StatusPill>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Drive date</p>
          <p className="whitespace-nowrap font-medium text-slate-900">{formatDate(drive.scheduledDate)}</p>
        </div>
        {isUndisclosed && drive.disclosedRevealDate && (
          <div>
            <p className="text-xs text-slate-500">Reveals on</p>
            <p className="whitespace-nowrap font-medium text-slate-900">{formatDate(drive.disclosedRevealDate)}</p>
          </div>
        )}
        {drive.venue && (
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Venue</p>
            <p className="truncate font-medium text-slate-900">{drive.venue}</p>
          </div>
        )}
        {(drive.registrationStart || drive.registrationEnd) && (
          <div>
            <p className="text-xs text-slate-500">Registration</p>
            <p className="whitespace-nowrap font-medium text-slate-900">
              {drive.registrationStart ? formatDate(drive.registrationStart) : "—"} –{" "}
              {drive.registrationEnd ? formatDate(drive.registrationEnd) : "—"}
            </p>
          </div>
        )}
        {drive.packageLpa !== undefined && (
          <div>
            <p className="text-xs text-slate-500">Package</p>
            <p className="whitespace-nowrap font-medium text-slate-900">₹{drive.packageLpa} LPA</p>
          </div>
        )}
        {drive.eligibilityCgpa !== undefined && (
          <div>
            <p className="text-xs text-slate-500">Eligibility</p>
            <p className="whitespace-nowrap font-medium text-slate-900">{drive.eligibilityCgpa} CGPA</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <p className="whitespace-nowrap text-sm text-slate-500">{drive.appliedCount} applied</p>
        <Link
          href={`/placement/rounds?drive=${drive.id}`}
          className="whitespace-nowrap rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
        >
          View Student Database
        </Link>
      </div>
    </div>
  );
}
