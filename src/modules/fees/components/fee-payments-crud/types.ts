export type KnownPaymentMode = "cash" | "card" | "upi" | "dd" | "netbanking";
// The backend can return any string for payment_mode — displays must handle
// values outside this known set instead of assuming one of these five.
export type PaymentMode = KnownPaymentMode | string;

export interface FeePayment {
  id: number;
  amountPaid: number;
  paymentDate: string | null;
  paymentMode: PaymentMode | null;
  receiptNo: string;
  isPartial: boolean;
  createdAt: string | null;
  demandCategoryName: string | null;
}

export interface FeePaymentFormValues {
  amountPaid: number;
  paymentDate: string;
  paymentMode: PaymentMode | null;
  receiptNo: string;
}
