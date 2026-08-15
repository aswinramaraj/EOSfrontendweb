import { SectionHeading } from "./SectionHeading";
import { DemandVsCollectionChart } from "./DemandVsCollectionChart";
import { MonthlyCollectionTrendChart } from "./MonthlyCollectionTrendChart";
import { DepartmentOutstandingChart } from "./DepartmentOutstandingChart";
import { PaymentStatusDistributionChart } from "./PaymentStatusDistributionChart";
import type { FinancialAnalyticsData } from "./types";

export function FinancialAnalytics({ analytics }: { analytics: FinancialAnalyticsData }) {
  return (
    <section aria-labelledby="finance-overview-analytics" className="finance-slide-up flex flex-col gap-3">
      <SectionHeading
        id="finance-overview-analytics"
        title="Financial Analytics"
        description="Demand, collection trends and outstanding breakdowns."
      />
      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
        <DemandVsCollectionChart data={analytics.demandVsCollection} />
        <MonthlyCollectionTrendChart data={analytics.monthlyCollectionTrend} />
        <DepartmentOutstandingChart data={analytics.departmentOutstanding} />
        <PaymentStatusDistributionChart data={analytics.paymentStatusDistribution} />
      </div>
    </section>
  );
}
