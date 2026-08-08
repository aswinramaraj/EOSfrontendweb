import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { formatDate, formatVerification } from "../../lib/format";
import { useStudentOd, useVerifyStudentOd } from "../../hooks/useStudentOds";
import type { StudentOdListItem } from "../../types/od";
import type { VerificationStatus } from "../../types/common";
import { RecordAccordion } from "./RecordAccordion";
import { AttachmentPanel } from "./AttachmentPanel";
import { VerifyControls } from "./VerifyControls";

const STATUS_TONE = { pending: "amber", approved: "green", rejected: "red" } as const;

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

export function StudentOdCard({
  item,
  open,
  onToggle,
}: {
  item: StudentOdListItem;
  open: boolean;
  onToggle: () => void;
}) {
  const { data: detail } = useStudentOd(open ? item.id : null);
  const verify = useVerifyStudentOd();
  const { show } = useToast();

  function save(status: VerificationStatus, remarks: string) {
    verify.mutate(
      { id: item.id, input: { verification_status: status, admin_remarks: remarks || undefined } },
      {
        onSuccess: () => show("Verification updated.", "success"),
        onError: (err) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  return (
    <RecordAccordion
      title={item.reason ?? "On-duty request"}
      subtitle={`${item.creator.name} · ${item.creator.student_id_no} · ${item.creator.department_name ?? "—"}`}
      statusTone={STATUS_TONE[item.mentor_approval_status]}
      statusLabel={item.mentor_approval_status[0].toUpperCase() + item.mentor_approval_status.slice(1)}
      verificationLabel={formatVerification(item.verification_status)}
      open={open}
      onToggle={onToggle}
    >
      {!detail && <p className="text-sm text-slate-500">Loading…</p>}
      {detail && (
        <div>
          {detail.team_members.length > 0 && (
            <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <span className="text-xs font-semibold text-slate-700">Team · {item.unique_code}</span>
                <div className="flex-1" />
                <span className="text-xs text-slate-500">{detail.team_members.length} members</span>
              </div>
              {detail.team_members.map((m) => (
                <div key={m.student_id} className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2 text-sm last:border-b-0">
                  <span className="font-medium text-slate-800">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.student_id_no}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Register number" value={detail.creator.student_id_no} />
            <Field label="Department" value={detail.creator.department_name ?? "—"} />
            <Field label="Organization" value={detail.organization ?? "—"} />
            <Field label="Location" value={detail.location ?? "—"} />
            <Field label="From date" value={formatDate(detail.from_date)} />
            <Field label="To date" value={formatDate(detail.to_date)} />
            <Field label="Faculty in-charge" value={detail.faculty_guide_name ?? "—"} />
            <Field label="Mentor status" value={detail.mentor_approval_status} />
          </div>

          {detail.hod_approvals.length > 0 && (
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Department HoD approvals
              </div>
              <div className="flex flex-wrap gap-2">
                {detail.hod_approvals.map((a) => (
                  <span key={a.id} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                    {a.student_name} ({a.department_name}) — {a.status}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <AttachmentPanel
              photoUrl={detail.photo_url}
              certificateUrl={detail.certificate_url}
              latitude={detail.latitude}
              longitude={detail.longitude}
            />
          </div>

          {(detail.email.sender || detail.email.body) && (
            <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700">
                Email details
              </div>
              <div className="grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-4">
                <Field label="Sender" value={detail.email.sender ?? "—"} />
                <Field label="Receiver" value={detail.email.receiver ?? "—"} />
                <Field label="Subject" value={detail.email.subject ?? "—"} />
                <Field label="Date" value={detail.email.sent_at ? formatDate(detail.email.sent_at) : "—"} />
              </div>
              {detail.email.body && (
                <p className="border-t border-slate-100 px-3.5 py-2.5 text-sm text-slate-600">{detail.email.body}</p>
              )}
            </div>
          )}

          <VerifyControls
            currentStatus={detail.verification_status}
            currentRemarks={detail.admin_remarks}
            isPending={verify.isPending}
            onSave={save}
          />
        </div>
      )}
    </RecordAccordion>
  );
}
