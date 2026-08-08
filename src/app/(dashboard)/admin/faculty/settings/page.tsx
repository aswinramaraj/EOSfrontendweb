"use client";

import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { FACULTY_LIST_COLUMNS, useFacultyPreferences } from "@/modules/faculty/hooks/useFacultyPreferences";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function FacultySettingsPage() {
  const { show } = useToast();
  const { preferences, updatePreferences, toggleColumn } = useFacultyPreferences();

  return (
    <div>
      <nav className="mb-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <Link href="/admin/faculty" className="hover:text-slate-700">
          Faculty
        </Link>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-slate-700">Settings</span>
      </nav>

      <PageHeader
        title="Faculty Module Settings"
        description="Display preferences for the All Faculty list — stored in this browser."
      />

      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900">List defaults</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Applied the next time you open All Faculty.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Rows per page</label>
              <SelectInput
                value={preferences.pageSize}
                onChange={(e) => {
                  updatePreferences({ pageSize: Number(e.target.value) });
                  show("Saved.", "success");
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Sort by name</label>
              <SelectInput
                value={preferences.sortDirection}
                onChange={(e) => {
                  updatePreferences({ sortDirection: e.target.value as "asc" | "desc" });
                  show("Saved.", "success");
                }}
              >
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </SelectInput>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-slate-900">Visible columns</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Faculty name is always shown. Turn off columns you don&apos;t need.
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            {FACULTY_LIST_COLUMNS.map((col) => (
              <label key={col.key} className="flex items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={!preferences.hiddenColumns.includes(col.key)}
                  onChange={() => {
                    toggleColumn(col.key);
                    show("Saved.", "success");
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                />
                {col.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
