export type DdStatus = "received" | "cleared" | "bounced";

export interface EducationLoanDD {
  id: number;
  ddReferenceNumber: string;
  bankName: string;
  amount: number;
  status: DdStatus;
  acknowledgementReceiptNo: string | null;
  createdAt: string;
}

export interface EducationLoanDDFormValues {
  ddReferenceNumber: string;
  bankName: string;
  amount: number;
  status: DdStatus;
  acknowledgementReceiptNo: string | null;
}
