import { PlusIcon, ReceiptIcon, PersonIcon } from "@/shared/components/icons";

interface QuickActionsCardProps {
  onReceivePayment: () => void;
  onPrintReceipt: () => void;
}

export function QuickActionsCard({ onReceivePayment, onPrintReceipt }: QuickActionsCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">Quick Actions</h3>

      <div className="mt-3 flex flex-col gap-1">
        <button
          type="button"
          onClick={onReceivePayment}
          className="flex items-center gap-2 rounded-lg bg-[#BFDBFE]/40 px-3 py-2 text-left text-sm font-medium text-[#2563EB] transition"
        >
          <PlusIcon className="h-4 w-4" />
          Receive Payment
        </button>

        <button
          type="button"
          onClick={onPrintReceipt}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
        >
          <ReceiptIcon className="h-4 w-4" />
          Print Receipt
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
        >
          <PersonIcon className="h-4 w-4" />
          View Student Profile
        </button>
      </div>
    </div>
  );
}
