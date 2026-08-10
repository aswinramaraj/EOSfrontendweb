"use client";

import { useEffect, useRef } from "react";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ChevronRightIcon, EyeIcon, PencilIcon } from "@/shared/components/icons";
import { formatDate, formatFacultyCode, fullName } from "../lib/faculty-format";
import { FacultyAvatar } from "./FacultyAvatar";
import type { Faculty } from "../types";

export type FacultySortDirection = "asc" | "desc";

interface FacultyTableProps {
  rows: Faculty[];
  isLoading?: boolean;
  error?: string | null;
  sortDirection: FacultySortDirection;
  onSortToggle: () => void;
  onView: (faculty: Faculty) => void;
  onEdit: (faculty: Faculty) => void;
  selectedIds: Set<number>;
  onToggleAll: () => void;
  onToggleOne: (id: number) => void;
  footer?: React.ReactNode;
  hiddenColumns?: Set<string>;
}

function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label="Select all faculty on this page"
      className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
    />
  );
}

export function FacultyTable({
  rows,
  isLoading,
  error,
  sortDirection,
  onSortToggle,
  onView,
  onEdit,
  selectedIds,
  onToggleAll,
  onToggleOne,
  footer,
  hiddenColumns,
}: FacultyTableProps) {
  const selectedOnPage = rows.filter((row) => selectedIds.has(row.id)).length;
  const allSelected = rows.length > 0 && selectedOnPage === rows.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const allColumns: DataTableColumn<Faculty>[] = [
    {
      key: "select",
      header: <SelectAllCheckbox checked={allSelected} indeterminate={someSelected} onChange={onToggleAll} />,
      className: "w-10",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => onToggleOne(row.id)}
          aria-label={`Select ${fullName(row)}`}
          className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
        />
      ),
    },
    {
      key: "name",
      header: (
        <button
          onClick={onSortToggle}
          className="flex items-center gap-1 hover:text-slate-600"
          aria-label={`Sort by name, ${sortDirection === "asc" ? "descending" : "ascending"}`}
        >
          Faculty Name
          <ChevronRightIcon
            className={`h-3 w-3 ${sortDirection === "asc" ? "-rotate-90" : "rotate-90"}`}
          />
        </button>
      ),
      render: (row) => (
        <button onClick={() => onView(row)} className="flex items-center gap-3 text-left">
          <FacultyAvatar faculty={row} className="h-9 w-9 rounded-full text-xs" />
          <div>
            <p className="font-medium text-slate-900">{fullName(row)}</p>
            <p className="text-xs text-slate-500">{formatFacultyCode(row.id)}</p>
          </div>
        </button>
      ),
    },
    { key: "designation", header: "Designation" },
    {
      key: "department",
      header: "Department",
      render: (row) => (
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          {row.department?.code ?? row.department?.name ?? "—"}
        </span>
      ),
    },
    { key: "email", header: "Email" },
    {
      key: "date_of_joining",
      header: "Date of joining",
      render: (row) => formatDate(row.date_of_joining),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusPill tone={row.status === "active" ? "green" : "slate"}>
          {row.status === "active" ? "Active" : "Inactive"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onView(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="View faculty"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit faculty"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const columns = hiddenColumns ? allColumns.filter((col) => !hiddenColumns.has(col.key)) : allColumns;

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      isLoading={isLoading}
      error={error}
      emptyMessage="No faculty found."
      footer={footer}
    />
  );
}
