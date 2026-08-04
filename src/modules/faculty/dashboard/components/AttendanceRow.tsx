import type { AttendanceMarkStatus } from "../types/dashboard.types";

interface AttendanceRowProps {
  name: string;
  registerNumber?: string | null;
  initials: string;
  status: AttendanceMarkStatus | null;
  onChange?: (status: AttendanceMarkStatus) => void;
  readOnly?: boolean;
}

export function AttendanceRow({ name, registerNumber, initials, status, onChange, readOnly = false }: AttendanceRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg px-2 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{name}</p>
        {registerNumber && <p className="truncate text-xs text-slate-400">{registerNumber}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.("present")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            status === "present"
              ? "bg-indigo-600 text-white shadow-sm"
              : "border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          Present
        </button>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.("absent")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            status === "absent"
              ? "bg-red-500 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          Absent
        </button>
      </div>
    </li>
  );
}
