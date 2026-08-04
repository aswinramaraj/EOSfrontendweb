import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { FeePaymentRow } from "../components/fee-payments/types";

interface RawFeePaymentsDashboardRow {
  student_fee_demand_mapping_id: number;
  student_id: number;
  student_name: string | null;
  register_number: string | null;
  programme: string | null;
  department: string | null;
  batch: string | null;
  fee_structure_name: string | null;
  academic_year: string | null;
  total_demand: number | string;
  paid_amount: number | string;
  outstanding_amount: number | string;
  due_status: string | null;
  last_payment_date: string | null;
}

function mapRow(raw: RawFeePaymentsDashboardRow): FeePaymentRow {
  return {
    id: String(raw.student_id),
    studentName: raw.student_name ?? "—",
    registerNo: raw.register_number ?? "—",
    programme: raw.programme ?? "—",
    department: raw.department ?? "—",
    batch: raw.batch ?? "—",
    academicYear: raw.academic_year ?? "—",
    totalDemand: Number(raw.total_demand ?? 0),
    paidAmount: Number(raw.paid_amount ?? 0),
    outstanding: Number(raw.outstanding_amount ?? 0),
    dueStatus: raw.due_status ?? "—",
    lastPayment: raw.last_payment_date,
  };
}

export const feePaymentsDashboardService = {
  async list() {
    const data = await apiClient.get<RawFeePaymentsDashboardRow[]>(
      "/fee-payments/dashboard",
      tokenStorage.getToken(),
    );
    return data.map(mapRow);
  },
};
