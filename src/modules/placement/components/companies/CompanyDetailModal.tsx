import { Modal } from "@/shared/components/ui/Modal";
import type { Company } from "../../types";

interface CompanyDetailModalProps {
  open: boolean;
  company: Company | null;
  onClose: () => void;
}

export function CompanyDetailModal({ open, company, onClose }: CompanyDetailModalProps) {
  if (!company) return null;

  return (
    <Modal open={open} onClose={onClose} title={company.name} widthClassName="max-w-lg">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Profile info</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
          {company.profileInfo || "No profile info added yet."}
        </p>
      </div>
    </Modal>
  );
}
