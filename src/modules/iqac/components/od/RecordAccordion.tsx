import { ChevronRightIcon } from "@/shared/components/icons";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";

interface RecordAccordionProps {
  title: string;
  subtitle: string;
  statusTone: PillTone;
  statusLabel: string;
  verificationLabel: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function RecordAccordion({
  title,
  subtitle,
  statusTone,
  statusLabel,
  verificationLabel,
  open,
  onToggle,
  children,
}: RecordAccordionProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button onClick={onToggle} className="flex w-full items-center gap-4 px-4.5 py-3.5 text-left hover:bg-slate-50">
        <div className="min-w-0 flex-1">
          <div className="text-[15.5px] font-bold text-slate-900">{title}</div>
          <div className="mt-0.5 text-[13px] text-slate-500">{subtitle}</div>
        </div>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
        <span className="hidden text-xs text-slate-500 sm:inline">{verificationLabel}</span>
        <ChevronRightIcon
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && <div className="border-t border-slate-200 p-4.5">{children}</div>}
    </div>
  );
}
