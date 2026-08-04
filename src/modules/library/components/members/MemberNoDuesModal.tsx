"use client";

import { Modal } from "@/shared/components/ui/Modal";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { useStudentNoDues } from "../../hooks/useStudentLookup";
import { formatCurrency, formatDate } from "../../lib/borrow-record-format";
import type { LibraryMember } from "../../types/members";

interface MemberNoDuesModalProps {
  member: LibraryMember | null;
  onClose: () => void;
}

export function MemberNoDuesModal({ member, onClose }: MemberNoDuesModalProps) {
  const { data, isLoading } = useStudentNoDues(member?.id);

  return (
    <Modal open={member !== null} onClose={onClose} title={member?.name ?? ""} widthClassName="max-w-lg">
      {isLoading && <p className="text-sm text-slate-500">Checking library standing…</p>}
      {data && (
        <div className="flex flex-col gap-4">
          <StatusPill tone={data.has_outstanding_library_dues ? "amber" : "green"}>
            {data.has_outstanding_library_dues ? "Has outstanding dues" : "Clear"}
          </StatusPill>

          {data.overdue_books.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Overdue books
              </p>
              <ul className="flex flex-col gap-1 text-sm text-slate-700">
                {data.overdue_books.map((b) => (
                  <li key={b.borrow_record_id}>
                    {b.title} ({b.accession}) — due {formatDate(b.due_date)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.unpaid_fine_records.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Unpaid fines
              </p>
              <ul className="flex flex-col gap-1 text-sm text-slate-700">
                {data.unpaid_fine_records.map((r) => (
                  <li key={r.borrow_record_id}>
                    {r.title} ({r.accession})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.unsettled_lost_damaged_charges.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Unsettled lost / damaged charges
              </p>
              <ul className="flex flex-col gap-1 text-sm text-slate-700">
                {data.unsettled_lost_damaged_charges.map((c) => (
                  <li key={c.borrow_record_id}>
                    {c.title} ({c.accession}) — {formatCurrency(c.charge_amount)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!data.has_outstanding_library_dues && (
            <p className="text-sm text-slate-500">No overdue books, unpaid fines, or unsettled charges.</p>
          )}
        </div>
      )}
    </Modal>
  );
}
