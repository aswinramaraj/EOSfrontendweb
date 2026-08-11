import { PageHeader } from "@/shared/components/ui/PageHeader";
import { FolderIcon } from "@/shared/components/icons";

export default function HRForm16Page() {
  return (
    <div>
      <PageHeader title="Form 16" description="Generate, publish, and track Form 16 for faculty." />

      <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FolderIcon className="h-6 w-6" />
        </span>
        <p className="text-base font-bold text-slate-900">Form 16 isn&apos;t available yet</p>
        <p className="max-w-sm text-sm text-slate-500">
          Form 16 generation depends on tax and salary-component data that isn&apos;t modeled in the backend yet.
          This page will let you generate, verify, and publish Form 16 once that&apos;s in place.
        </p>
      </div>
    </div>
  );
}
