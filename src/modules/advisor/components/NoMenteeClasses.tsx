import { PeopleIcon } from "@/shared/components/icons";

export function NoMenteeClasses() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
      <PeopleIcon className="h-8 w-8 text-slate-300" />
      <p className="text-sm font-medium text-slate-700">
        You are not currently assigned as an advisor to any class.
      </p>
      <p className="max-w-sm text-sm text-slate-500">
        Ask your admin to assign you as the class advisor from Admin → Advisors.
      </p>
    </div>
  );
}
