import { apiClient } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { DdStatus, EducationLoanDD, EducationLoanDDFormValues } from "../components/education-loan-dd/types";

interface RawEducationLoanDD {
  id: number;
  student_fee_demand_mapping_id: number;
  dd_reference_number: string;
  bank_name: string;
  amount: number | string;
  status: DdStatus;
  acknowledgement_receipt_no: string | null;
  created_at: string;
}

function mapDD(raw: RawEducationLoanDD): EducationLoanDD {
  return {
    id: raw.id,
    ddReferenceNumber: raw.dd_reference_number,
    bankName: raw.bank_name,
    amount: Number(raw.amount),
    status: raw.status,
    acknowledgementReceiptNo: raw.acknowledgement_receipt_no,
    createdAt: raw.created_at,
  };
}

// status is never accepted on create — the backend defaults it to "received".
function toCreateBody(values: EducationLoanDDFormValues) {
  return {
    dd_reference_number: values.ddReferenceNumber,
    bank_name: values.bankName,
    amount: Number(values.amount),
    ...(values.acknowledgementReceiptNo !== null
      ? { acknowledgement_receipt_no: values.acknowledgementReceiptNo }
      : {}),
  };
}

// status is accepted on update only.
function toUpdateBody(values: Partial<EducationLoanDDFormValues>) {
  return {
    ...(values.ddReferenceNumber !== undefined ? { dd_reference_number: values.ddReferenceNumber } : {}),
    ...(values.bankName !== undefined ? { bank_name: values.bankName } : {}),
    ...(values.amount !== undefined ? { amount: Number(values.amount) } : {}),
    ...(values.acknowledgementReceiptNo !== undefined
      ? { acknowledgement_receipt_no: values.acknowledgementReceiptNo }
      : {}),
    ...(values.status !== undefined ? { status: values.status } : {}),
  };
}

export const educationLoanDDService = {
  async list() {
    const data = await apiClient.get<RawEducationLoanDD[]>("/education-loan-dds", tokenStorage.getToken());
    return data.map(mapDD);
  },

  async getById(id: number) {
    const data = await apiClient.get<RawEducationLoanDD>(
      `/education-loan-dds/${Number(id)}`,
      tokenStorage.getToken(),
    );
    return mapDD(data);
  },

  async listByDemandMapping(demandMappingId: number) {
    const data = await apiClient.get<RawEducationLoanDD[]>(
      `/student-fee-demand-mappings/${Number(demandMappingId)}/education-loan-dds`,
      tokenStorage.getToken(),
    );
    return data.map(mapDD);
  },

  // student_fee_demand_mapping_id comes from the URL only — never from the request body.
  async create(demandMappingId: number, values: EducationLoanDDFormValues) {
    const data = await apiClient.post<RawEducationLoanDD>(
      `/student-fee-demand-mappings/${Number(demandMappingId)}/education-loan-dds`,
      toCreateBody(values),
      tokenStorage.getToken(),
    );
    return mapDD(data);
  },

  async update(id: number, values: EducationLoanDDFormValues) {
    const data = await apiClient.put<RawEducationLoanDD>(
      `/education-loan-dds/${Number(id)}`,
      toUpdateBody(values),
      tokenStorage.getToken(),
    );
    return mapDD(data);
  },

  async patch(id: number, changes: Partial<EducationLoanDDFormValues>) {
    const data = await apiClient.patch<RawEducationLoanDD>(
      `/education-loan-dds/${Number(id)}`,
      toUpdateBody(changes),
      tokenStorage.getToken(),
    );
    return mapDD(data);
  },

  remove(id: number) {
    return apiClient.delete<void>(`/education-loan-dds/${Number(id)}`, tokenStorage.getToken());
  },
};
