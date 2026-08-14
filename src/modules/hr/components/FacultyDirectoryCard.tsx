import { EnvelopeIcon, PhoneIcon } from "@/shared/components/icons";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { HOVERABLE } from "@/modules/hr/components/ui/hoverable";
import type { Faculty } from "@/modules/faculty/types";

function yearsSince(dateString: string | null | undefined): number | null {
  if (!dateString) return null;
  const joined = new Date(dateString);
  if (Number.isNaN(joined.getTime())) return null;
  const years = (Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(years));
}

interface FacultyDirectoryCardProps {
  faculty: Faculty;
  onOpenProfile: (faculty: Faculty) => void;
}

export function FacultyDirectoryCard({ faculty, onOpenProfile }: FacultyDirectoryCardProps) {
  const experience = yearsSince(faculty.date_of_joining);

  return (
    <div className={`flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 ${HOVERABLE}`}>
      <div className="flex items-center gap-3">
        <FacultyAvatar faculty={faculty} className="h-11 w-11 rounded-full text-sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{fullName(faculty)}</p>
          <p className="text-xs text-slate-500">ID {faculty.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Designation</p>
          <p className="mt-0.5 font-medium text-slate-800">{faculty.designation}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Department</p>
          <p className="mt-0.5 font-medium text-slate-800">{faculty.department?.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Experience</p>
          <p className="mt-0.5 font-medium text-slate-800">{experience != null ? `${experience} yrs` : "—"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Joined</p>
          <p className="mt-0.5 font-medium text-slate-800">
            {faculty.date_of_joining ? new Date(faculty.date_of_joining).toLocaleDateString("en-IN") : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3 text-sm text-slate-600">
        <a href={`mailto:${faculty.email}`} className="flex items-center gap-2 hover:text-blue-700">
          <EnvelopeIcon className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{faculty.email}</span>
        </a>
        {faculty.phone && (
          <a href={`tel:${faculty.phone}`} className="flex items-center gap-2 hover:text-blue-700">
            <PhoneIcon className="h-4 w-4 shrink-0 text-slate-400" />
            {faculty.phone}
          </a>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <StatusPill tone={faculty.status === "active" ? "green" : "slate"}>
          {faculty.status === "active" ? "Active" : "Inactive"}
        </StatusPill>
        <button
          onClick={() => onOpenProfile(faculty)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Open Profile
        </button>
      </div>
    </div>
  );
}
