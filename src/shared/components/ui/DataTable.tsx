import { useEffect, useRef } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export interface DataTableSelection<T> {
  isSelected: (row: T) => boolean;
  onToggle: (row: T) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  selection?: DataTableSelection<T>;
}

const SKELETON_ROWS = 5;
const CHECKBOX_CLASS = "h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500";

function HeaderCheckbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className={CHECKBOX_CLASS}
      checked={checked}
      onChange={onChange}
      aria-label="Select all rows"
    />
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  error = null,
  emptyMessage = "No records found.",
  selection,
}: DataTableProps<T>) {
  const colCount = columns.length + (selection ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {selection && (
              <th className="w-10 px-4 py-3">
                <HeaderCheckbox
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected && !selection.allSelected}
                  onChange={selection.onToggleAll}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-slate-400 ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-slate-100">
                {selection && <td className="px-4 py-3.5" />}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && error && (
            <tr>
              <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-red-600">
                {error}
              </td>
            </tr>
          )}

          {!isLoading && !error && rows.length === 0 && (
            <tr>
              <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            !error &&
            rows.map((row, index) => (
              <tr key={rowKey(row, index)} className="border-b border-slate-100 last:border-b-0">
                {selection && (
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      className={CHECKBOX_CLASS}
                      checked={selection.isSelected(row)}
                      onChange={() => selection.onToggle(row)}
                      aria-label="Select row"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-slate-700 ${col.align === "right" ? "text-right" : "text-left"} ${col.className ?? ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
