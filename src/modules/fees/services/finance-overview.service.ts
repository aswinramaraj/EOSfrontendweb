import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type {
  FinanceOverviewData,
  PaymentStatusEntry,
} from "../components/finance-overview/types";

interface RawExecutiveKPIs {
  totalFeeDemand: number | string;
  totalCollected: number | string;
  totalOutstanding: number | string;
  collectionPercentage: number;
  pendingEducationLoanDD: number;
  activeFeeStructures: number;
}

interface RawDemandVsCollection {
  totalDemand: number | string;
  totalCollected: number | string;
  totalOutstanding: number | string;
}

interface RawMonthlyCollectionPoint {
  month: string;
  totalCollected: number | string;
}

interface RawDepartmentOutstandingEntry {
  department: string;
  totalDemand: number | string;
  totalOutstanding: number | string;
}

interface RawFinancialAnalytics {
  demandVsCollection: RawDemandVsCollection;
  monthlyCollectionTrend: RawMonthlyCollectionPoint[];
  departmentOutstanding: RawDepartmentOutstandingEntry[];
  paymentStatusDistribution: PaymentStatusEntry[];
}

interface RawRecentPayment {
  id: number;
  student_id: number;
  student_name: string | null;
  amount_paid: number | string;
  payment_date: string | null;
  payment_mode: string | null;
  receipt_no: string;
}

interface RawTopOutstandingStudent {
  student_id: number;
  student_name: string | null;
  register_number: string | null;
  total_outstanding: number | string;
}

interface RawConcessionSummary {
  total_concession_amount: number | string;
  count: number;
  settled_count: number;
  unsettled_count: number;
}

interface RawEducationLoanDDSummary {
  total_amount: number | string;
  count: number;
  received_count: number;
  cleared_count: number;
  bounced_count: number;
}

interface RawOperationalInsights {
  recentPayments: RawRecentPayment[];
  topOutstandingStudents: RawTopOutstandingStudent[];
  concessionSummary: RawConcessionSummary;
  educationLoanDDSummary: RawEducationLoanDDSummary;
}

interface RawFinanceOverview {
  executiveKPIs: RawExecutiveKPIs;
  financialAnalytics: RawFinancialAnalytics;
  operationalInsights: RawOperationalInsights;
}

function mapFinanceOverview(raw: RawFinanceOverview): FinanceOverviewData {
  return {
    executiveKPIs: {
      totalFeeDemand: Number(raw.executiveKPIs.totalFeeDemand),
      totalCollected: Number(raw.executiveKPIs.totalCollected),
      totalOutstanding: Number(raw.executiveKPIs.totalOutstanding),
      collectionPercentage: raw.executiveKPIs.collectionPercentage,
      pendingEducationLoanDD: raw.executiveKPIs.pendingEducationLoanDD,
      activeFeeStructures: raw.executiveKPIs.activeFeeStructures,
    },
    financialAnalytics: {
      demandVsCollection: {
        totalDemand: Number(raw.financialAnalytics.demandVsCollection.totalDemand),
        totalCollected: Number(raw.financialAnalytics.demandVsCollection.totalCollected),
        totalOutstanding: Number(raw.financialAnalytics.demandVsCollection.totalOutstanding),
      },
      monthlyCollectionTrend: raw.financialAnalytics.monthlyCollectionTrend.map((point) => ({
        month: point.month,
        totalCollected: Number(point.totalCollected),
      })),
      departmentOutstanding: raw.financialAnalytics.departmentOutstanding.map((entry) => ({
        department: entry.department,
        totalDemand: Number(entry.totalDemand),
        totalOutstanding: Number(entry.totalOutstanding),
      })),
      paymentStatusDistribution: raw.financialAnalytics.paymentStatusDistribution,
    },
    operationalInsights: {
      recentPayments: raw.operationalInsights.recentPayments.map((payment) => ({
        id: payment.id,
        studentId: payment.student_id,
        studentName: payment.student_name,
        amountPaid: Number(payment.amount_paid),
        paymentDate: payment.payment_date,
        paymentMode: payment.payment_mode,
        receiptNo: payment.receipt_no,
      })),
      topOutstandingStudents: raw.operationalInsights.topOutstandingStudents.map((student) => ({
        studentId: student.student_id,
        studentName: student.student_name,
        registerNumber: student.register_number,
        totalOutstanding: Number(student.total_outstanding),
      })),
      concessionSummary: {
        totalConcessionAmount: Number(raw.operationalInsights.concessionSummary.total_concession_amount),
        count: raw.operationalInsights.concessionSummary.count,
        settledCount: raw.operationalInsights.concessionSummary.settled_count,
        unsettledCount: raw.operationalInsights.concessionSummary.unsettled_count,
      },
      educationLoanDDSummary: {
        totalAmount: Number(raw.operationalInsights.educationLoanDDSummary.total_amount),
        count: raw.operationalInsights.educationLoanDDSummary.count,
        receivedCount: raw.operationalInsights.educationLoanDDSummary.received_count,
        clearedCount: raw.operationalInsights.educationLoanDDSummary.cleared_count,
        bouncedCount: raw.operationalInsights.educationLoanDDSummary.bounced_count,
      },
    },
  };
}

export const financeOverviewService = {
  async get() {
    const data = await apiClient.get<RawFinanceOverview>("/finance-overview", tokenStorage.getToken());
    return mapFinanceOverview(data);
  },
};
