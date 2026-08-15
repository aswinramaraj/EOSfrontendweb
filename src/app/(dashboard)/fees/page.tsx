"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/modules/fees/components/PageHeader";
import { ContentContainer } from "@/modules/fees/components/ContentContainer";
import { FeePaymentsPanel } from "@/modules/fees/components/fee-payments/FeePaymentsPanel";
import { FinanceOverviewPanel } from "@/modules/fees/components/finance-overview/FinanceOverviewPanel";
import { StudentWorkspace } from "@/modules/fees/components/student-workspace/StudentWorkspace";
import { DemandCategoriesPanel } from "@/modules/fees/components/demand-categories/DemandCategoriesPanel";
import { QuotasPanel } from "@/modules/fees/components/quotas/QuotasPanel";
import { FeeStructuresPanel } from "@/modules/fees/components/fee-structures/FeeStructuresPanel";
import { FeeStructureItemsPanel } from "@/modules/fees/components/fee-structure-items/FeeStructureItemsPanel";
import { FEES_TABS } from "@/modules/fees/constants";

const DEFAULT_TAB = FEES_TABS[0]?.key;

function FeesPageContent() {
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const initialTab = FEES_TABS.some((tab) => tab.key === tabFromUrl) ? tabFromUrl! : DEFAULT_TAB;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Navigation between sections now happens exclusively through the
  // sidebar's Fees & Finance sub-rows (each a real URL: /fees?tab=...) — the
  // in-page tab bar was removed as redundant. This effect keeps `activeTab`
  // in sync whenever that URL changes.
  useEffect(() => {
    const nextTab = FEES_TABS.some((tab) => tab.key === tabFromUrl) ? tabFromUrl! : DEFAULT_TAB;
    setActiveTab(nextTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  return (
    <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-[var(--sp-6)] p-[var(--sp-6)]">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Fees & Finance" }]}
        title="Fees & Finance"
        subtitle="Complete financial management and fee collection overview"
      />

      <ContentContainer>
        {activeTab === "fee-payments" ? (
          selectedStudentId ? (
            <StudentWorkspace studentId={selectedStudentId} onClose={() => setSelectedStudentId(null)} />
          ) : (
            <FeePaymentsPanel onViewStudent={(row) => setSelectedStudentId(row.id)} />
          )
        ) : activeTab === "finance-overview" ? (
          <FinanceOverviewPanel />
        ) : activeTab === "demand" ? (
          <DemandCategoriesPanel />
        ) : activeTab === "quota" ? (
          <QuotasPanel />
        ) : activeTab === "fee-structures" ? (
          <FeeStructuresPanel />
        ) : activeTab === "fee-structure-items" ? (
          <FeeStructureItemsPanel />
        ) : null}
      </ContentContainer>
    </div>
  );
}

export default function FeesPage() {
  return (
    <Suspense fallback={null}>
      <FeesPageContent />
    </Suspense>
  );
}
