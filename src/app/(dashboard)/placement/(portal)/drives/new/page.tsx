"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/shared/components/icons";
import { ScheduleDriveForm } from "@/modules/placement/components/drives/ScheduleDriveForm";

export default function ScheduleDrivePage() {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <nav className="text-sm text-slate-500">
          <Link href="/placement" className="hover:text-slate-700">
            Dashboard
          </Link>
          <span className="mx-1.5">›</span>
          <Link href="/placement/drives" className="hover:text-slate-700">
            Placement Drives
          </Link>
          <span className="mx-1.5">›</span>
          <span className="font-medium text-slate-700">Schedule drive</span>
        </nav>
        <Link
          href="/placement/drives"
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back to drives
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">Schedule drive</h1>

      <ScheduleDriveForm />
    </div>
  );
}
