"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRightIcon } from "@/shared/components/icons";
import { useFacultyById } from "@/modules/faculty/hooks/useFacultyById";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { fullName as formatFacultyName } from "@/modules/faculty/lib/faculty-format";
import { FacultyAttendanceDetail } from "@/modules/hr/components/FacultyAttendanceDetail";

export default function HRFacultyAttendanceDetailPage() {
  const { facultyId } = useParams<{ facultyId: string }>();
  const id = Number(facultyId);

  const { data: faculty, isLoading: facultyLoading } = useFacultyById(id);

  if (facultyLoading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!faculty) {
    return (
      <div>
        <p className="text-sm text-slate-500">Faculty not found.</p>
        <Link href="/hr/faculty-attendance" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          ← Back to Faculty Attendance
        </Link>
      </div>
    );
  }

  const fullName = formatFacultyName(faculty);

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/hr/faculty-attendance" className="hover:text-slate-700">
          Faculty Attendance
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-700">{fullName}</span>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <FacultyAvatar faculty={faculty} className="h-14 w-14 rounded-full text-lg" />
        <div>
          <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {faculty.department?.name ?? "—"} · Full academic-year attendance — present, absent, half day and OD in one view.
          </p>
        </div>
      </div>

      <FacultyAttendanceDetail facultyId={id} facultyName={fullName} />
    </div>
  );
}
