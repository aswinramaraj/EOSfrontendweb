"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/shared/components/icons";
import { FacultyCreateWizard } from "@/modules/faculty/components/wizard/FacultyCreateWizard";

export default function AddFacultyPage() {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <nav className="text-sm text-slate-500">
          <Link href="/admin" className="hover:text-slate-700">
            Home
          </Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/faculty" className="hover:text-slate-700">
            Faculty
          </Link>
          <span className="mx-1.5">›</span>
          <span className="font-medium text-slate-700">Add Faculty</span>
        </nav>
        <Link
          href="/admin/faculty"
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back to list
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">Add Faculty</h1>

      <FacultyCreateWizard />
    </div>
  );
}
