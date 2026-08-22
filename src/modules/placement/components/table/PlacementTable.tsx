"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export type PlacementCellType = "text" | "mono" | "badge" | "action" | "bar";

export interface PlacementTableCell {
  text: string;
  sub?: string;
}

export interface PlacementRowAction {
  label: string;
  tone?: "primary" | "danger";
  onClick: () => void;
  disabled?: boolean;
  /** Tooltip — most useful paired with `disabled` to explain why an action isn't available yet. */
  title?: string;
}

export interface PlacementTableColumn<T> {
  key: string;
  label: string;
  /** fr unit passed straight into the column's grid-template-columns track, e.g. "1.3fr". */
  width: string;
  type?: PlacementCellType;
  align?: "right";
  /** Bold, dark "identity" column (name/company/etc.) — matches the reference's `strong` list. */
  strong?: boolean;
  /** Required when type is "action"; ignored otherwise. */
  actions?: (row: T) => PlacementRowAction[];
  /** Required when type is "bar" (0-100); ignored otherwise. */
  barValue?: (row: T) => number;
  /** Small fixed-size element (e.g. an avatar) rendered before the cell's text — ignored for "badge"/"bar"/"action" types. */
  leading?: (row: T) => ReactNode;
  render?: (row: T) => PlacementTableCell;
  sortValue?: (row: T) => string | number;
}

export interface PlacementTableSort {
  key: string;
  dir: "asc" | "desc";
}

interface PlacementTableProps<T> {
  toolbar: ReactNode;
  columns: PlacementTableColumn<T>[];
  /** Already filtered and search-matched — this component only sorts and paginates. */
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  sort: PlacementTableSort | null;
  onSortChange: (sort: PlacementTableSort | null) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  emptyMessage?: string;
  /**
   * Set when `rows` is already just the current server-paginated page (not
   * the full filtered set) — e.g. a backend that caps page size. Switches
   * the footer's page count/"Showing X–Y of Z" off `rows.length` and onto
   * this instead, and skips the client-side re-slice since `rows` is
   * already the slice to render.
   */
  totalCount?: number;
}

/** Exact color pairs transcribed from Placement Module v2.dc.html's `BADGE` map — falls back to the same neutral slate tone the source uses for any value it doesn't recognize. */
const BADGE_COLORS: Record<string, [string, string]> = {
  Eligible: ["#e8f0fe", "#1f4fd8"],
  "Not eligible": ["#eef1f6", "#16224a"],
  Placed: ["#e8f0fe", "#1f4fd8"],
  "In process": ["#eaf0fe", "#1f4fd8"],
  "Not placed": ["#f1f3f7", "#5b6577"],
  "Opted out": ["#f1f3f7", "#5b6577"],
  Returning: ["#eaf0fe", "#1f4fd8"],
  New: ["#eef3fe", "#5b7fdf"],
  Applied: ["#f1f3f7", "#5b6577"],
  Shortlisted: ["#eaf0fe", "#1f4fd8"],
  Selected: ["#e8f0fe", "#1f4fd8"],
  Rejected: ["#eef1f6", "#16224a"],
  Pending: ["#f1f3f7", "#5b6577"],
  Accepted: ["#e8f0fe", "#1f4fd8"],
  Declined: ["#eef1f6", "#16224a"],
  "Not applied": ["#f1f3f7", "#5b6577"],
  "Not tracked": ["#f1f3f7", "#5b6577"],
  Upcoming: ["#eaf0fe", "#1f4fd8"],
  Ongoing: ["#eef3fe", "#5b7fdf"],
  Completed: ["#e8f0fe", "#1f4fd8"],
  Cancelled: ["#eef1f6", "#16224a"],
  Scheduled: ["#eaf0fe", "#1f4fd8"],
  "In progress": ["#eef3fe", "#5b7fdf"],
  Active: ["#e6f4ea", "#1e7e34"],
  Hosteller: ["#e8f0fe", "#1f4fd8"],
  Complete: ["#dcfce7", "#166534"],
  Partial: ["#fef08a", "#854d0e"],
  "Not Started": ["#f1f5f9", "#64748b"],
  Adequate: ["#dcfce7", "#166534"],
  Shortage: ["#fecaca", "#991b1b"],
  "Top performer": ["#dcfce7", "#166534"],
  "At risk": ["#fecaca", "#991b1b"],
  "On track": ["#dbeafe", "#1e40af"],
  "No results yet": ["#f1f5f9", "#64748b"],
  Draft: ["#f1f3f7", "#5b6577"],
  Published: ["#dcfce7", "#166534"],
};

export function placementBadgeStyle(value: string): CSSProperties {
  const [bg, fg] = BADGE_COLORS[value] ?? ["#f1f3f7", "#5b6577"];
  return {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 600,
    padding: "3.5px 9px",
    borderRadius: 5,
    whiteSpace: "nowrap",
    background: bg,
    color: fg,
  };
}

function minFor<T>(col: PlacementTableColumn<T>, sampleRow: T | undefined): number {
  if (col.type === "action") {
    const count = sampleRow ? (col.actions?.(sampleRow).length ?? 0) : 0;
    return count > 1 ? 190 : 96;
  }
  if (col.type === "badge") return 112;
  if (col.type === "bar") return 118;
  if (col.type === "mono") return 84;
  return 104;
}

/** Reference's `p>=70?C.green:p>=35?C.blue:C.amber` — C.green and C.blue are the same hex, so only the sub-35% tier reads visually distinct. */
function barColor(percent: number): string {
  return percent >= 35 ? "#1f4fd8" : "#5b7fdf";
}

export function placementSearchInputStyle(focused: boolean): CSSProperties {
  return {
    flex: 1,
    minWidth: 220,
    height: 34,
    border: `1px solid ${focused ? "#1f4fd8" : "#dfe4ec"}`,
    borderRadius: 8,
    background: focused ? "#fff" : "#f7f9fc",
    padding: "0 12px",
    fontSize: 12.5,
    outline: "none",
  };
}

export const placementSelectStyle: CSSProperties = {
  height: 34,
  border: "1px solid #dfe4ec",
  borderRadius: 8,
  background: "#fff",
  fontSize: 12,
  padding: "0 9px",
  color: "#2c3542",
  minWidth: 126,
};

export function placementResetButtonStyle(hover: boolean): CSSProperties {
  return {
    height: 34,
    border: "1px solid #dfe4ec",
    background: hover ? "#f3f6fb" : "#fff",
    borderRadius: 8,
    padding: "0 12px",
    fontSize: 12,
    cursor: "pointer",
    color: "#77808f",
  };
}

/** Exact small-button style transcribed from Placement Module v2.dc.html's `smallBtn()` helper — the source has no distinct "danger" tone, so this adds one consistent with the rest of the app's destructive-action red for the Edit/Delete actions this table needs but the reference doesn't render. */
function rowActionButtonStyle(tone: PlacementRowAction["tone"], disabled?: boolean): CSSProperties {
  const base: CSSProperties = {
    height: 29,
    borderRadius: 6,
    padding: "0 10px",
    fontSize: 11.5,
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: disabled ? "not-allowed" : "pointer",
  };
  if (disabled) return { ...base, border: "1px solid #eef1f6", background: "#fff", color: "#c3cad4" };
  if (tone === "primary") return { ...base, border: "1px solid #1f4fd8", background: "#1f4fd8", color: "#fff" };
  if (tone === "danger") return { ...base, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c" };
  return { ...base, border: "1px solid #dfe4ec", background: "#fff", color: "#2c3542" };
}

function TableRow<T>({
  row,
  columns,
  gridTemplate,
  minWidth,
  onClick,
}: {
  row: T;
  columns: PlacementTableColumn<T>[];
  gridTemplate: string;
  minWidth: number;
  onClick?: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplate,
        gap: 14,
        alignItems: "center",
        padding: "12px 20px",
        minWidth,
        borderBottom: "1px solid #f3f5f9",
        cursor: onClick ? "pointer" : undefined,
        transition: "transform .16s ease, box-shadow .16s ease, background .16s ease",
        transform: hover ? "translateY(-3px)" : undefined,
        background: hover ? "#f3f7ff" : undefined,
        boxShadow: hover ? "0 10px 22px rgba(31,79,216,.14)" : undefined,
        position: hover ? "relative" : undefined,
        zIndex: hover ? 2 : undefined,
      }}
    >
      {columns.map((c) => {
        if (c.type === "action") {
          return (
            <div key={c.key} style={{ minWidth: 0, display: "flex", gap: 7, justifyContent: "flex-end" }}>
              {c.actions?.(row).map((a) => (
                <button
                  key={a.label}
                  type="button"
                  disabled={a.disabled}
                  title={a.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!a.disabled) a.onClick();
                  }}
                  style={rowActionButtonStyle(a.tone, a.disabled)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          );
        }
        if (c.type === "bar") {
          const percent = Math.max(0, Math.min(100, Math.round(c.barValue?.(row) ?? 0)));
          return (
            <div key={c.key} style={{ minWidth: 0, fontSize: 12.5, color: "#3a4351", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 4, background: "#eceff5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${percent}%`, borderRadius: 4, background: barColor(percent) }} />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono)",
                    fontSize: 11,
                    color: "#77808f",
                    width: 32,
                    textAlign: "right",
                  }}
                >
                  {percent}%
                </span>
              </div>
            </div>
          );
        }
        const cell = c.render?.(row) ?? { text: "" };
        return (
          <div key={c.key} style={{ minWidth: 0, fontSize: 12.5, color: "#3a4351", overflow: "hidden" }}>
            {c.type === "badge" ? (
              <span style={placementBadgeStyle(cell.text)}>{cell.text}</span>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {c.leading?.(row)}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: c.type === "mono" ? "var(--font-ibm-plex-mono)" : undefined,
                      fontSize: c.type === "mono" ? 12 : undefined,
                      fontWeight: c.strong ? 600 : undefined,
                      color: c.strong ? "#14181f" : undefined,
                    }}
                  >
                    {cell.text}
                  </div>
                  {cell.sub && <div style={{ fontSize: 10.5, color: "#96a0b0", marginTop: 2 }}>{cell.sub}</div>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Exact generic table engine transcribed from Placement Module v2.dc.html's `isTable` block — column widths via its `minFor` algorithm, row hover, Previous/Next-only pagination footer. */
export function PlacementTable<T>({
  toolbar,
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSortChange,
  page,
  pageSize,
  onPageChange,
  emptyMessage = "No records match these filters.",
  totalCount,
}: PlacementTableProps<T>) {
  const serverPaginated = totalCount != null;

  const sorted = sort
    ? [...rows].sort((a, b) => {
        const col = columns.find((c) => c.key === sort.key);
        if (!col?.sortValue) return 0;
        const x = col.sortValue(a);
        const y = col.sortValue(b);
        const n = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return sort.dir === "asc" ? n : -n;
      })
    : rows;

  const totalRows = totalCount ?? sorted.length;
  const pages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, pages);
  const slice = serverPaginated ? sorted : sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const sampleRow = slice[0];
  const gridTemplate = columns.map((c) => `minmax(${minFor(c, sampleRow)}px,${c.width})`).join(" ");
  const minWidth = columns.reduce((a, c) => a + minFor(c, sampleRow) + 14, 40);

  const pageInfo =
    totalRows === 0
      ? "No records"
      : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalRows)} of ${totalRows} records`;

  function pageButtonStyle(enabled: boolean): CSSProperties {
    return {
      height: 30,
      borderRadius: 7,
      padding: "0 12px",
      fontSize: 12,
      border: "1px solid #dfe4ec",
      background: "#fff",
      color: enabled ? "#2c3542" : "#c3cad4",
      cursor: enabled ? "pointer" : "default",
    };
  }

  function toggleSort(key: string) {
    onSortChange(sort?.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          gap: 9,
          flexWrap: "wrap",
          alignItems: "center",
          padding: "13px 18px",
          borderBottom: "1px solid #eef1f6",
        }}
      >
        {toolbar}
      </div>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridTemplate,
            gap: 14,
            alignItems: "center",
            padding: "12px 20px",
            minWidth,
            background: "#f8fafc",
            borderBottom: "1px solid #eaeef4",
          }}
        >
          {columns.map((c) => (
            <div
              key={c.key}
              onClick={c.sortValue ? () => toggleSort(c.key) : undefined}
              style={{
                fontSize: 11,
                fontWeight: 650,
                color: "#77808f",
                letterSpacing: ".3px",
                cursor: c.sortValue ? "pointer" : undefined,
                textAlign: c.align === "right" ? "right" : undefined,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.label}
              <span style={{ color: "#1f4fd8", fontSize: 9 }}>
                {" "}
                {sort?.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : ""}
              </span>
            </div>
          ))}
        </div>

        {slice.map((row) => (
          <TableRow
            key={rowKey(row)}
            row={row}
            columns={columns}
            gridTemplate={gridTemplate}
            minWidth={minWidth}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          />
        ))}

        {slice.length === 0 && (
          <div style={{ padding: 56, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>{emptyMessage}</div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          borderTop: "1px solid #eef1f6",
        }}
      >
        <span style={{ fontSize: 11.5, color: "#8b95a6" }}>{pageInfo}</span>
        <div style={{ display: "flex", gap: 7 }}>
          <button
            type="button"
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            style={pageButtonStyle(currentPage > 1)}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => currentPage < pages && onPageChange(currentPage + 1)}
            style={pageButtonStyle(currentPage < pages)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
