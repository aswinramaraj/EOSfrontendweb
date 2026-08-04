import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { QuickActionsCard } from "./QuickActionsCard";
import type { PaymentSummary } from "./types";

interface ReceivePaymentPanelProps {
  paymentSummary: PaymentSummary;
  outstandingAmount: number;
  onReceivePayment: () => void;
}

export function ReceivePaymentPanel({ paymentSummary, outstandingAmount, onReceivePayment }: ReceivePaymentPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <PaymentSummaryCard summary={paymentSummary} outstandingAmount={outstandingAmount} />
      <QuickActionsCard onReceivePayment={onReceivePayment} />
    </div>
  );
}
