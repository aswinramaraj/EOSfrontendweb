"use client";

import { useState } from "react";
import { PageHeader } from "@/modules/fees/components/PageHeader";
import { FeesTabs } from "@/modules/fees/components/FeesTabs";
import { ContentContainer } from "@/modules/fees/components/ContentContainer";
import { FeePaymentsPanel } from "@/modules/fees/components/fee-payments/FeePaymentsPanel";
import { FinanceOverviewPanel } from "@/modules/fees/components/finance-overview/FinanceOverviewPanel";
import { StudentWorkspace } from "@/modules/fees/components/student-workspace/StudentWorkspace";
import { DemandCategoriesPanel } from "@/modules/fees/components/demand-categories/DemandCategoriesPanel";
import { QuotasPanel } from "@/modules/fees/components/quotas/QuotasPanel";
import { FeeStructuresPanel } from "@/modules/fees/components/fee-structures/FeeStructuresPanel";
import { FeeStructureItemsPanel } from "@/modules/fees/components/fee-structure-items/FeeStructureItemsPanel";
import { FEES_TABS } from "@/modules/fees/constants";

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState(FEES_TABS[0]?.key);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-[var(--sp-6)] p-[var(--sp-6)]">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Fees & Finance" }]}
        title="Fees & Finance"
        subtitle="Complete financial management and fee collection overview"
      />

      <FeesTabs tabs={FEES_TABS} activeKey={activeTab} onTabChange={setActiveTab} />

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
