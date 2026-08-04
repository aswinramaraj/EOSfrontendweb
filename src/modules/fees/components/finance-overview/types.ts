export interface ExecutiveKPIs {
  totalFeeDemand: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionPercentage: number;
  pendingEducationLoanDD: number;
  activeFeeStructures: number;
}

export interface DemandVsCollection {
  totalDemand: number;
  totalCollected: number;
  totalOutstanding: number;
}

export interface MonthlyCollectionPoint {
  month: string;
  totalCollected: number;
}

export interface DepartmentOutstandingEntry {
  department: string;
  totalDemand: number;
  totalOutstanding: number;
}

export type PaymentStatusKey = "paid" | "partial" | "pending";

export interface PaymentStatusEntry {
  status: PaymentStatusKey | string;
  count: number;
}

export interface FinancialAnalyticsData {
  demandVsCollection: DemandVsCollection;
  monthlyCollectionTrend: MonthlyCollectionPoint[];
  departmentOutstanding: DepartmentOutstandingEntry[];
  paymentStatusDistribution: PaymentStatusEntry[];
}

export interface RecentPayment {
  id: number;
  studentId: number;
  studentName: string | null;
  amountPaid: number;
  paymentDate: string | null;
  paymentMode: string | null;
  receiptNo: string;
}

export interface TopOutstandingStudent {
  studentId: number;
  studentName: string | null;
  registerNumber: string | null;
  totalOutstanding: number;
}

export interface ConcessionSummary {
  totalConcessionAmount: number;
  count: number;
  settledCount: number;
  unsettledCount: number;
}

export interface EducationLoanDDSummary {
  totalAmount: number;
  count: number;
  receivedCount: number;
  clearedCount: number;
  bouncedCount: number;
}

export interface OperationalInsightsData {
  recentPayments: RecentPayment[];
  topOutstandingStudents: TopOutstandingStudent[];
  concessionSummary: ConcessionSummary;
  educationLoanDDSummary: EducationLoanDDSummary;
}

export interface FinanceOverviewData {
  executiveKPIs: ExecutiveKPIs;
  financialAnalytics: FinancialAnalyticsData;
  operationalInsights: OperationalInsightsData;
}
