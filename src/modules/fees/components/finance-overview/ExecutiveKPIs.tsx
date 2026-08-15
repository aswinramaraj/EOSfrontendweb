import { WalletIcon, BankIcon, AlertTriangleIcon, TrendUpIcon, ShieldCheckIcon, BuildingIcon } from "@/shared/components/icons";
import { formatCurrency } from "../fee-payments/format";
import { SectionHeading } from "./SectionHeading";
import { KPICard } from "./KPICard";
import type { ExecutiveKPIs as ExecutiveKPIsData } from "./types";

export function ExecutiveKPIs({ kpis }: { kpis: ExecutiveKPIsData }) {
  return (
    <section aria-labelledby="finance-overview-kpis" className="finance-slide-up flex flex-col gap-3">
      <SectionHeading
        id="finance-overview-kpis"
        title="Executive Summary"
        description="Real-time financial overview of fee collection."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KPICard
          label="Total Demand"
          value={formatCurrency(kpis.totalFeeDemand)}
          subtitle="Live fee demand"
          icon={WalletIcon}
          accent="blue"
          variant="primary"
        />
        <KPICard
          label="Total Collected"
          value={formatCurrency(kpis.totalCollected)}
          subtitle="Collected so far"
          icon={BankIcon}
          accent="green"
        />
        <KPICard
          label="Outstanding Amount"
          value={formatCurrency(kpis.totalOutstanding)}
          subtitle="Pending collection"
          icon={AlertTriangleIcon}
          accent="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KPICard
          label="Collection %"
          value={`${kpis.collectionPercentage.toFixed(2)}%`}
          subtitle="Collection efficiency"
          icon={TrendUpIcon}
          accent="violet"
          variant="info"
        />
        <KPICard
          label="Pending DD"
          value={String(kpis.pendingEducationLoanDD)}
          subtitle="Awaiting verification"
          icon={ShieldCheckIcon}
          accent="amber"
          variant="info"
        />
        <KPICard
          label="Active Structures"
          value={String(kpis.activeFeeStructures)}
          subtitle="Fee structures"
          icon={BuildingIcon}
          accent="slate"
          variant="info"
        />
      </div>
    </section>
  );
}
