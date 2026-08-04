import type { ComponentType, SVGProps } from "react";
import { PlusIcon, DocumentIcon, ReceiptIcon, NoteIcon, PersonIcon } from "@/shared/components/icons";

const STATIC_ACTIONS: { key: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { key: "view-statement", label: "View Statement", icon: DocumentIcon },
  { key: "print-receipts", label: "Print Receipts", icon: ReceiptIcon },
  { key: "add-note", label: "Add Note", icon: NoteIcon },
  { key: "view-profile", label: "View Student Profile", icon: PersonIcon },
];

interface QuickActionsCardProps {
  onReceivePayment: () => void;
}

export function QuickActionsCard({ onReceivePayment }: QuickActionsCardProps) {
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

        {STATIC_ACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
