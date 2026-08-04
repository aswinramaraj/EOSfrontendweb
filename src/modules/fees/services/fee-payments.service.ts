import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { FeePayment, FeePaymentFormValues, PaymentMode } from "../components/fee-payments-crud/types";

interface RawFeePayment {
  id: number;
  student_fee_demand_mapping_id: number;
  amount_paid: number | string;
  payment_date: string;
  payment_mode: PaymentMode | null;
  receipt_no: string;
  is_partial: boolean;
  created_at: string;
}

function mapPayment(raw: RawFeePayment): FeePayment {
  return {
    id: raw.id,
    amountPaid: Number(raw.amount_paid),
    paymentDate: raw.payment_date,
    paymentMode: raw.payment_mode,
    receiptNo: raw.receipt_no,
    isPartial: raw.is_partial,
    createdAt: raw.created_at,
  };
}

function toRequestBody(values: Partial<FeePaymentFormValues>) {
  return {
    ...(values.amountPaid !== undefined ? { amount_paid: Number(values.amountPaid) } : {}),
    ...(values.receiptNo !== undefined ? { receipt_no: values.receiptNo } : {}),
    ...(values.paymentMode !== undefined ? { payment_mode: values.paymentMode } : {}),
    ...(values.isPartial !== undefined ? { is_partial: values.isPartial } : {}),
  };
}

export const feePaymentsService = {
  async list() {
    const data = await apiClient.get<RawFeePayment[]>("/fee-payments", tokenStorage.getToken());
    return data.map(mapPayment);
  },

  async getById(id: number) {
    const data = await apiClient.get<RawFeePayment>(`/fee-payments/${Number(id)}`, tokenStorage.getToken());
    return mapPayment(data);
  },

  async listByDemandMapping(demandMappingId: number) {
    const data = await apiClient.get<RawFeePayment[]>(
      `/student-fee-demand-mappings/${Number(demandMappingId)}/payments`,
      tokenStorage.getToken(),
    );
    return data.map(mapPayment);
  },

  // student_fee_demand_mapping_id comes from the URL only — never from the request body.
  async create(demandMappingId: number, values: FeePaymentFormValues) {
    const data = await apiClient.post<RawFeePayment>(
      `/student-fee-demand-mappings/${Number(demandMappingId)}/payments`,
      toRequestBody(values),
      tokenStorage.getToken(),
    );
    return mapPayment(data);
  },

  async update(id: number, values: FeePaymentFormValues) {
    const data = await apiClient.put<RawFeePayment>(
      `/fee-payments/${Number(id)}`,
      toRequestBody(values),
      tokenStorage.getToken(),
    );
    return mapPayment(data);
  },

  async patch(id: number, changes: Partial<FeePaymentFormValues>) {
    const data = await apiClient.patch<RawFeePayment>(
      `/fee-payments/${Number(id)}`,
      toRequestBody(changes),
      tokenStorage.getToken(),
    );
    return mapPayment(data);
  },

  remove(id: number) {
    return apiClient.delete<void>(`/fee-payments/${Number(id)}`, tokenStorage.getToken());
  },
};
