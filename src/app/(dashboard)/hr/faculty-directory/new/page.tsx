"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/shared/components/icons";
import { FacultyCreateWizard } from "@/modules/faculty/components/wizard/FacultyCreateWizard";

export default function HRAddFacultyPage() {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <nav className="text-sm text-slate-500">
          <Link href="/hr" className="hover:text-slate-700">
            Home
          </Link>
          <span className="mx-1.5">›</span>
          <Link href="/hr/faculty-directory" className="hover:text-slate-700">
            Faculty Directory
          </Link>
          <span className="mx-1.5">›</span>
          <span className="font-medium text-slate-700">Add Faculty</span>
        </nav>
        <Link
          href="/hr/faculty-directory"
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back to list
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">Add Faculty</h1>

      <FacultyCreateWizard basePath="/hr/faculty-directory" draftKey="eos.hr.faculty.create.draft" />
    </div>
  );
}
