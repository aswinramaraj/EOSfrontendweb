import type { PaymentMode } from "./types";

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  dd: "DD",
  netbanking: "Net Banking",
};
