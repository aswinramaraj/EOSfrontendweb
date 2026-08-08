export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  /** Rendered inside this same bordered card, below the table — e.g. a
   *  pagination bar that should read as part of the table rather than a
   *  second, disconnected block underneath it. Bring your own border-t
   *  (PaginationBar already does) — this wrapper doesn't add one, to avoid
   *  a doubled-up divider. */
  footer?: React.ReactNode;
  /** When set, rows become clickable (pointer cursor + hover highlight) — e.g. to open a detail view. */
  onRowClick?: (row: T) => void;
}

const SKELETON_ROWS = 5;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  error = null,
  emptyMessage = "No records found.",
  footer,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200">
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
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && error && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-red-600">
                  {error}
                </td>
              </tr>
            )}

            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              rows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-slate-100 last:border-b-0 ${
                    onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                  }`}
                >
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
      {footer}
    </div>
  );
}
