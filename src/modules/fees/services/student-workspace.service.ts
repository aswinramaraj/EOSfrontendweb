import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type {
  DemandSummaryItem,
  PaymentSummary,
  StudentFeeSummary,
  StudentProfile,
} from "../components/student-workspace/types";

interface RawStudentProfile {
  student_id: number;
  student_name: string | null;
  register_number: string | null;
  programme: string | null;
  department: string | null;
  batch: string | null;
  quota: string | null;
}

interface RawFeeSummary {
  total_demand: number | string | null;
  total_paid: number | string | null;
  total_outstanding: number | string | null;
}

interface RawDemandSummaryEntry {
  student_fee_demand_mapping_id: number;
  fee_structure_id: number;
  fee_structure_name: string | null;
  applies_to: string | null;
  academic_year: string | null;
  semester: number | null;
  total_amount: number | string | null;
}

interface RawPaymentSummary {
  payment_count: number | null;
  total_paid: number | string | null;
  last_payment_date: string | null;
}

interface RawStudentWorkspace {
  student_profile: RawStudentProfile | null;
  fee_summary: RawFeeSummary | null;
  demand_summary: RawDemandSummaryEntry[] | null;
  payment_summary: RawPaymentSummary | null;
}

export interface StudentWorkspaceData {
  profile: StudentProfile;
  feeSummary: StudentFeeSummary;
  demandSummary: DemandSummaryItem[];
  paymentSummary: PaymentSummary;
}

export const studentWorkspaceService = {
  async get(studentId: number): Promise<StudentWorkspaceData> {
    const raw = await apiClient.get<RawStudentWorkspace>(
      `/fee-payments/students/${Number(studentId)}/workspace`,
      tokenStorage.getToken(),
    );

    const totalDemand = Number(raw.fee_summary?.total_demand ?? 0);
    const totalPaid = Number(raw.fee_summary?.total_paid ?? 0);
    const totalOutstanding = Number(raw.fee_summary?.total_outstanding ?? 0);

    return {
      profile: {
        studentId: raw.student_profile?.student_id ?? studentId,
        name: raw.student_profile?.student_name ?? "—",
        registerNumber: raw.student_profile?.register_number ?? "—",
        programme: raw.student_profile?.programme ?? "—",
        department: raw.student_profile?.department ?? "—",
        batch: raw.student_profile?.batch ?? "—",
        quota: raw.student_profile?.quota ?? "—",
      },
      feeSummary: {
        totalDemand,
        totalPaid,
        totalOutstanding,
        collectionPercent: totalDemand > 0 ? (totalPaid / totalDemand) * 100 : 0,
      },
      demandSummary: (raw.demand_summary ?? []).map((entry) => ({
        studentFeeDemandMappingId: entry.student_fee_demand_mapping_id,
        feeStructureId: entry.fee_structure_id,
        feeStructureName: entry.fee_structure_name ?? "—",
        appliesTo: entry.applies_to ?? "—",
        academicYear: entry.academic_year ?? "—",
        semester: entry.semester ?? 0,
        totalAmount: Number(entry.total_amount ?? 0),
      })),
      paymentSummary: {
        paymentCount: raw.payment_summary?.payment_count ?? 0,
        totalPaid: Number(raw.payment_summary?.total_paid ?? 0),
        lastPaymentDate: raw.payment_summary?.last_payment_date ?? null,
      },
    };
  },
};
