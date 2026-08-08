"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PlusIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCompanies } from "@/modules/placement/hooks/useCompanies";
import { useDeleteCompany } from "@/modules/placement/hooks/useCompanyMutations";
import { CompanyFormModal } from "@/modules/placement/components/companies/CompanyFormModal";
import { CompanyDetailModal } from "@/modules/placement/components/companies/CompanyDetailModal";
import type { Company } from "@/modules/placement/types";

const PAGE_SIZE = 10;

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function CompaniesPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<Company | "new" | null>(null);
  const [viewTarget, setViewTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useCompanies({
    q: debouncedQuery || undefined,
    page,
    page_size: PAGE_SIZE,
  });
  const deleteCompany = useDeleteCompany();

  const columns: DataTableColumn<Company>[] = [
    {
      key: "name",
      header: "Company",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
            {initials(row.name)}
          </span>
          <p className="font-medium text-slate-900">{row.name}</p>
        </div>
      ),
    },
    {
      key: "profileInfo",
      header: "Profile info",
      render: (row) => <p className="max-w-md truncate text-slate-600">{row.profileInfo || "—"}</p>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setViewTarget(row)}>
            View
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setFormTarget(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteCompany.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Company deleted.", "success");
        setDeleteTarget(null);
      },
      onError: (err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      },
    });
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        actions={
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            <PlusIcon className="h-4 w-4" /> Add company
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Registered recruiters</h3>
          <p className="text-xs text-slate-500">
            {data ? `${data.data.length} of ${data.total} companies` : "Loading…"}
          </p>
        </div>
        <div className="max-w-sm flex-1">
          <SearchInput
            placeholder="Search companies"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load companies." : null}
        emptyMessage="No companies found."
        footer={
          data && (
            <PaginationBar page={data.page} pageSize={data.page_size} total={data.total} onPageChange={setPage} />
          )
        }
      />

      <CompanyFormModal
        open={formTarget !== null}
        company={formTarget === "new" ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <CompanyDetailModal open={viewTarget !== null} company={viewTarget} onClose={() => setViewTarget(null)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete company"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteCompany.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
