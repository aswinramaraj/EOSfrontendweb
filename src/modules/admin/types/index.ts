/** Mirrors EOSbackend1 src/modules/fees-billing/finance-overview/dto/finance-overview-response.dto.ts */
export interface ExecutiveKpis {
  totalFeeDemand: string;
  totalCollected: string;
  totalOutstanding: string;
  collectionPercentage: number;
  pendingEducationLoanDD: number;
  activeFeeStructures: number;
}

export interface MonthlyCollectionTrendItem {
  month: string; // "YYYY-MM"
  totalCollected: string;
}

export interface DepartmentOutstandingItem {
  department: string;
  totalDemand: string;
  totalOutstanding: string;
}

export interface PaymentStatusDistributionItem {
  status: "paid" | "partial" | "pending";
  count: number;
}

export interface FinanceOverview {
  executiveKPIs: ExecutiveKpis;
  financialAnalytics: {
    demandVsCollection: { totalDemand: string; totalCollected: string; totalOutstanding: string };
    monthlyCollectionTrend: MonthlyCollectionTrendItem[];
    departmentOutstanding: DepartmentOutstandingItem[];
    paymentStatusDistribution: PaymentStatusDistributionItem[];
  };
  operationalInsights: {
    recentPayments: unknown[];
    topOutstandingStudents: unknown[];
    concessionSummary: { total_concession_amount: string; count: number; settled_count: number; unsettled_count: number };
    educationLoanDDSummary: { total_amount: string; count: number; received_count: number; cleared_count: number; bounced_count: number };
  };
}

/** Mirrors the shared PaginationDto/paginate() envelope in EOSbackend1 src/common/dto/pagination.dto.ts */
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
}
