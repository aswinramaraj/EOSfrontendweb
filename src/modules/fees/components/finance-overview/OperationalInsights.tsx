import { SectionHeading } from "./SectionHeading";
import { RecentPaymentsTable } from "./RecentPaymentsTable";
import { TopOutstandingStudentsTable } from "./TopOutstandingStudentsTable";
import { ConcessionSummaryCard } from "./ConcessionSummaryCard";
import { EducationLoanDDSummaryCard } from "./EducationLoanDDSummaryCard";
import type { OperationalInsightsData } from "./types";

export function OperationalInsights({ insights }: { insights: OperationalInsightsData }) {
  return (
    <section aria-labelledby="finance-overview-insights" className="finance-slide-up flex flex-col gap-3">
      <SectionHeading
        id="finance-overview-insights"
        title="Operational Insights"
        description="Recent activity, top outstanding students and concession/DD status."
      />
      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
        <RecentPaymentsTable payments={insights.recentPayments} />
        <TopOutstandingStudentsTable students={insights.topOutstandingStudents} />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
        <ConcessionSummaryCard summary={insights.concessionSummary} />
        <EducationLoanDDSummaryCard summary={insights.educationLoanDDSummary} />
      </div>
    </section>
  );
}
