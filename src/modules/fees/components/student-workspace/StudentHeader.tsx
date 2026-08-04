import type { StudentProfile } from "./types";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function StudentHeader({ student }: { student: StudentProfile }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-semibold text-amber-700">
        {getInitials(student.name)}
      </span>

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-zinc-900">{student.name}</h2>
        <p className="text-sm text-zinc-500">{student.registerNumber}</p>
        <p className="text-sm text-zinc-500">
          {student.programme} &middot; {student.department}
        </p>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {student.quota}
        </span>
      </div>
    </div>
  );
}
