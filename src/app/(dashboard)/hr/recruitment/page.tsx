"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/components/ui/DataTable";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { PeopleIcon, PersonPlusIcon, TargetIcon, UserCheckIcon } from "@/shared/components/icons";
import { useVacancies, useUpdateVacancyStage } from "@/modules/hr/local/recruitment-store";
import { PostVacancyModal } from "@/modules/hr/components/PostVacancyModal";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import type { Vacancy, VacancyStage } from "@/modules/hr/local/types";

type Tab = "all" | VacancyStage;

const STAGE_LABEL: Record<VacancyStage, string> = {
  screening: "Screening",
  shortlist: "Shortlist",
  interview: "Interview",
  offer: "Offer",
};

const STAGE_TONE: Record<VacancyStage, PillTone> = {
  screening: "slate",
  shortlist: "blue",
  interview: "amber",
  offer: "green",
};

const STAGE_ORDER: VacancyStage[] = ["screening", "shortlist", "interview", "offer"];

export default function HRRecruitmentPage() {
  const { data: vacancies } = useVacancies();
  const updateStage = useUpdateVacancyStage();
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let rows = vacancies;
    if (tab !== "all") rows = rows.filter((v) => v.stage === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((v) => v.role.toLowerCase().includes(q) || v.departmentName.toLowerCase().includes(q));
    }
    return rows;
  }, [vacancies, tab, search]);

  const openPositions = vacancies.reduce((sum, v) => sum + v.positions, 0);
  const totalApplicants = vacancies.reduce((sum, v) => sum + v.applicants, 0);
  const inInterview = vacancies.filter((v) => v.stage === "interview").length;
  const offersPending = vacancies.filter((v) => v.stage === "offer").length;

  function nextStage(stage: VacancyStage): VacancyStage | null {
    const idx = STAGE_ORDER.indexOf(stage);
    return idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
  }

  return (
    <div>
      <HRPageHeader
        title="Recruitment"
        description="Open positions, applicant pipeline and interview panels."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <PersonPlusIcon className="h-4 w-4" />
            Post vacancy
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <HRStatCard icon={PeopleIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Open Positions" value={openPositions} caption={`${vacancies.length} postings`} />
        <HRStatCard icon={TargetIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Applicants" value={totalApplicants} />
        <HRStatCard icon={UserCheckIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="In Interview" value={inInterview} />
        <HRStatCard icon={PersonPlusIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Offers Pending" value={offersPending} />
      </div>

      <div className="mb-5">
        <HRSegmentedTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "all", label: "All", count: vacancies.length },
            { value: "screening", label: "Screening", count: vacancies.filter((v) => v.stage === "screening").length },
            { value: "shortlist", label: "Shortlist", count: vacancies.filter((v) => v.stage === "shortlist").length },
            { value: "interview", label: "Interview", count: vacancies.filter((v) => v.stage === "interview").length },
          ]}
        />
      </div>

      <HRFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search role, department or applicant…"
        onReset={() => {
          setSearch("");
          setTab("all");
        }}
        resultCount={{ showing: filtered.length, total: vacancies.length, noun: "records" }}
      />

      <DataTable<Vacancy>
        columns={[
          { key: "role", header: "Role", render: (row) => <span className="font-semibold text-slate-900">{row.role}</span> },
          { key: "department", header: "Department", render: (row) => row.departmentName },
          { key: "positions", header: "Positions" },
          { key: "type", header: "Type", render: (row) => (row.employmentType === "teaching" ? "Teaching" : "Non-teaching") },
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
                <Button variant="secondary" size="sm" onClick={() => updateStage(row.id, next)}>
                  Move to {STAGE_LABEL[next]}
                </Button>
              ) : null;
            },
          },
        ]}
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="No open positions yet — use “Post vacancy” to add one."
      />

      <PostVacancyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
