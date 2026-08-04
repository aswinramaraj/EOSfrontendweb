import type { AcademicsMappingOption } from "../types/academics.types";

interface ClassSubjectSelectorProps {
  mappingOptions: AcademicsMappingOption[];
  selectedId: number | null;
  onSelect: (option: AcademicsMappingOption) => void;
}

/** Real substitute for a faceted Batch/Year/Department/Section filter: the
 * backend has no such generic filter for faculty, only their own
 * (subject, class, academic_year) mappings — so this single dropdown lists
 * exactly those, and picking one supplies every id the Assignments/LMS
 * Notes/Lesson Plans tabs need. */
export function ClassSubjectSelector({ mappingOptions, selectedId, onSelect }: ClassSubjectSelectorProps) {
  const selected = mappingOptions.find((option) => option.id === selectedId) ?? null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <label className="block">
        <span className="text-xs font-semibold text-slate-500">Class &amp; Subject</span>
        <select
          value={selectedId ?? ""}
          onChange={(e) => {
            const option = mappingOptions.find((candidate) => candidate.id === Number(e.target.value));
            if (option) onSelect(option);
          }}
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        >
          {mappingOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.subjectName} ({option.subjectCode}) — {option.departmentCode} {option.classSection} · AY{" "}
              {option.academicYear}
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-indigo-50 px-4 py-3 text-sm">
          <span className="text-xs font-bold tracking-wide text-indigo-700 uppercase">Selected Class:</span>
          <span className="font-semibold text-slate-800">
            {selected.departmentCode} {selected.classSection} · AY {selected.academicYear}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-700">{selected.subjectName}</span>
          <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
            {selected.subjectCode}
          </span>
        </div>
      )}
    </div>
  );
}
