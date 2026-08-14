"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/components/ui/DataTable";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { AlertTriangleIcon, ClipboardIcon, PersonPlusIcon, UserCheckIcon } from "@/shared/components/icons";
import { useOnboardingCases, useUpdateOnboardingCase, ONBOARDING_STAGE_ORDER } from "@/modules/hr/local/onboarding-exits-store";
import { StartOnboardingCaseModal } from "@/modules/hr/components/StartOnboardingCaseModal";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import type { OnboardingCase, OnboardingCaseStage } from "@/modules/hr/local/types";

type Tab = "all" | OnboardingCaseStage;

const STAGE_LABEL: Record<OnboardingCaseStage, string> = {
  ready: "Ready",
  in_progress: "In progress",
  overdue: "Overdue",
};

const STAGE_TONE: Record<OnboardingCaseStage, PillTone> = {
  ready: "green",
  in_progress: "amber",
  overdue: "red",
};

function isThisMonth(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function HROnboardingExitsPage() {
  const { data: cases } = useOnboardingCases();
  const updateCase = useUpdateOnboardingCase();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"onboarding" | "exit" | null>(null);

  const filtered = useMemo(() => {
    let rows = cases;
    if (tab !== "all") rows = rows.filter((c) => c.stage === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q) || c.departmentName.toLowerCase().includes(q));
    }
    return rows;
  }, [cases, tab, search]);

  const joiningThisMonth = cases.filter((c) => c.type === "onboarding" && isThisMonth(c.effectiveDate)).length;
  const probationDue = cases.filter((c) => c.type === "onboarding" && c.probationReviewDue).length;
  const exitsInProgress = cases.filter((c) => c.type === "exit" && c.stage === "in_progress").length;
  const clearancesPending = cases.filter((c) => c.type === "exit" && c.clearancePending).length;

  function nextStage(stage: OnboardingCaseStage): OnboardingCaseStage | null {
    const idx = ONBOARDING_STAGE_ORDER.indexOf(stage);
    return idx < ONBOARDING_STAGE_ORDER.length - 1 ? ONBOARDING_STAGE_ORDER[idx + 1] : null;
  }

  return (
    <div>
      <HRPageHeader
        title="Onboarding & Exits"
        description="Joining formalities, probation confirmations, and relieving cases."
        actions={
          <>
            <Button variant="secondary" onClick={() => setModal("exit")}>
              Start exit
            </Button>
            <Button variant="primary" onClick={() => setModal("onboarding")}>
              <PersonPlusIcon className="h-4 w-4" />
              Start onboarding
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <HRStatCard icon={PersonPlusIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Joining This Month" value={joiningThisMonth} />
        <HRStatCard icon={UserCheckIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Probation Reviews Due" value={probationDue} />
        <HRStatCard icon={AlertTriangleIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Exits In Progress" value={exitsInProgress} />
        <HRStatCard icon={ClipboardIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Clearances Pending" value={clearancesPending} />
      </div>

      <div className="mb-5">
        <HRSegmentedTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: cases.length },
            { value: "ready", label: "Ready", count: cases.filter((c) => c.stage === "ready").length },
            { value: "in_progress", label: "In progress", count: cases.filter((c) => c.stage === "in_progress").length },
            { value: "overdue", label: "Overdue", count: cases.filter((c) => c.stage === "overdue").length },
          ]}
        />
      </div>

      <HRFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employee or case type…"
        onReset={() => {
          setSearch("");
          setTab("all");
        }}
        resultCount={{ showing: filtered.length, total: cases.length, noun: "records" }}
      />

      <DataTable<OnboardingCase>
        columns={[
          { key: "name", header: "Name", render: (row) => <span className="font-semibold text-slate-900">{row.name}</span> },
          { key: "type", header: "Case", render: (row) => (row.type === "onboarding" ? "Onboarding" : "Exit") },
          { key: "department", header: "Department", render: (row) => row.departmentName },
          { key: "designation", header: "Designation" },
          {
            key: "date",
            header: "Effective date",
            render: (row) => new Date(row.effectiveDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          },
          {
            key: "stage",
            header: "Stage",
            render: (row) => <StatusPill tone={STAGE_TONE[row.stage]}>{STAGE_LABEL[row.stage]}</StatusPill>,
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (row) => {
              const next = nextStage(row.stage);
              return next ? (
                <Button variant="secondary" size="sm" onClick={() => updateCase(row.id, { stage: next })}>
                  Move to {STAGE_LABEL[next]}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateCase(row.id, row.type === "onboarding" ? { probationReviewDue: false } : { clearancePending: false })
                  }
                >
                  {row.type === "onboarding" ? "Clear probation flag" : "Clear clearance flag"}
                </Button>
              );
            },
          },
        ]}
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="No onboarding or exit cases yet — use “Start onboarding” or “Start exit” to add one."
      />

      {modal && <StartOnboardingCaseModal open type={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
