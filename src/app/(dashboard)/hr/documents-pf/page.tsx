"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/shared/lib/api-client";
import { ChevronRightIcon, FileTextIcon } from "@/shared/components/icons";
import { facultyService } from "@/modules/faculty/services/faculty.service";
import { fetchAllPages } from "@/modules/faculty/lib/report-export";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useDocumentsPfStatusMap, useSetDocumentsPfStatus } from "@/modules/hr/local/documents-pf-store";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HRListRowsSkeleton, HRStatGridSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import type { Faculty } from "@/modules/faculty/types";

type Tab = "all" | "complete" | "incomplete" | "action";

export default function HRDocumentsPfPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  // The backend caps `limit` at 100 per page — with 642+ faculty, a single
  // request can't return the whole roster, so this pages through all of it
  // (same fetchAllPages helper the Reports page's exports already use)
  // rather than silently truncating to the first 100.
  const { data, isLoading, error } = useQuery({
    queryKey: ["hr", "documents-pf", "faculty", search],
    queryFn: () => fetchAllPages((page, limit) => facultyService.list({ search: search || undefined, page, limit })),
  });
  const statusMap = useDocumentsPfStatusMap();
  const setStatus = useSetDocumentsPfStatus();

  const faculty = data?.rows ?? [];

  function statusFor(id: number) {
    return statusMap[id] ?? { docsComplete: false, pfActive: false, form16Issued: false };
  }

  const filtered = useMemo(() => {
    if (tab === "all") return faculty;
    return faculty.filter((member) => {
      const status = statusFor(member.id);
      if (tab === "complete") return status.docsComplete;
      if (tab === "incomplete") return !status.docsComplete;
      if (tab === "action") return !status.docsComplete || !status.pfActive || !status.form16Issued;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faculty, tab, statusMap]);

  const filesComplete = faculty.filter((m) => statusFor(m.id).docsComplete).length;
  const pfActive = faculty.filter((m) => statusFor(m.id).pfActive).length;
  const form16Issued = faculty.filter((m) => statusFor(m.id).form16Issued).length;

  return (
    <div>
      <HRPageHeader
        title="Documents & PF"
        description="Personnel file completeness, PF status and Form 16 issuance — recorded by HR per faculty."
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load faculty."}
        </p>
      )}

      {isLoading ? (
        <div className="mb-5">
          <HRStatGridSkeleton count={4} />
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HRStatCard
            icon={FileTextIcon}
            iconClassName="bg-[#EEF2FF] text-[#2655DA]"
            label="Files Complete"
            value={`${filesComplete} / ${faculty.length}`}
            caption="Marked complete by HR"
          />
          <HRStatCard
            icon={FileTextIcon}
            iconClassName="bg-[#EEF2FF] text-[#2655DA]"
            label="Missing Documents"
            value={faculty.length - filesComplete}
          />
          <HRStatCard
            icon={FileTextIcon}
            iconClassName="bg-[#EEF2FF] text-[#2655DA]"
            label="PF Accounts Active"
            value={pfActive}
          />
          <HRStatCard
            icon={FileTextIcon}
            iconClassName="bg-[#EEF2FF] text-[#2655DA]"
            label="Form 16 Issued"
            value={`${form16Issued} / ${faculty.length}`}
          />
        </div>
      )}

      <div className="mb-5">
        <HRSegmentedTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: faculty.length },
            { value: "complete", label: "Complete", count: filesComplete },
            { value: "incomplete", label: "Incomplete", count: faculty.length - filesComplete },
            {
              value: "action",
              label: "Action needed",
              count: faculty.filter((m) => {
                const s = statusFor(m.id);
                return !s.docsComplete || !s.pfActive || !s.form16Issued;
              }).length,
            },
          ]}
        />
      </div>

      <HRFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employee or document type…"
        onReset={() => {
          setSearch("");
          setTab("all");
        }}
        resultCount={{ showing: filtered.length, total: faculty.length, noun: "records" }}
      />

      {isLoading && <HRListRowsSkeleton rows={6} />}

      {!isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white">
          {filtered.map((member: Faculty) => {
            const status = statusFor(member.id);
            return (
              <div key={member.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{fullName(member)}</p>
                  <p className="text-xs text-slate-500">
                    {member.department?.name ?? "—"} · ID {member.id}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={status.docsComplete ? "green" : "amber"}>
                    {status.docsComplete ? "Docs complete" : "Docs incomplete"}
                  </StatusPill>
                  <StatusPill tone={status.pfActive ? "green" : "slate"}>
                    {status.pfActive ? "PF active" : "PF pending"}
                  </StatusPill>
                  <StatusPill tone={status.form16Issued ? "green" : "slate"}>
                    {status.form16Issued ? "Form 16 issued" : "Form 16 pending"}
                  </StatusPill>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setStatus(member.id, { docsComplete: !status.docsComplete })}
                  >
                    {status.docsComplete ? "Mark incomplete" : "Mark complete"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setStatus(member.id, { pfActive: !status.pfActive })}>
                    {status.pfActive ? "Unset PF" : "Set PF active"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setStatus(member.id, { form16Issued: !status.form16Issued })}
                  >
                    {status.form16Issued ? "Unset Form 16" : "Mark Form 16 issued"}
                  </Button>
                  <Link
                    href={`/hr/faculty-directory/${member.id}?tab=documents`}
                    className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
                  >
                    View documents
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No faculty match these filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
