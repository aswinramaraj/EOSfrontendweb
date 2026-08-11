import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { formatDate, formatVerification } from "../../lib/format";
import { useVerifyFacultyOd } from "../../hooks/useFacultyOds";
import type { FacultyOd } from "../../types/od";
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

export function FacultyOdCard({ item, open, onToggle }: { item: FacultyOd; open: boolean; onToggle: () => void }) {
  const verify = useVerifyFacultyOd();
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
      title={item.purpose ?? "On-duty request"}
      subtitle={`${item.faculty.first_name} ${item.faculty.last_name} · ${item.faculty.department_name}`}
      statusTone={STATUS_TONE[item.overall_status]}
      statusLabel={item.overall_status[0].toUpperCase() + item.overall_status.slice(1)}
      verificationLabel={formatVerification(item.verification_status)}
      open={open}
      onToggle={onToggle}
    >
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Employee ID" value={`FAC-${item.faculty.id}`} />
        <Field label="Department" value={item.faculty.department_name} />
        <Field label="Organization visited" value={item.organization_visited ?? "—"} />
        <Field label="Students guided" value={item.students_guided ?? "—"} />
        <Field label="From date" value={formatDate(item.from_date)} />
        <Field label="To date" value={formatDate(item.to_date)} />
        <Field label="HoD status" value={item.hod_approval_status} />
        <Field label="HR status" value={item.hr_approval_status} />
        <Field label="Sanction order" value={item.sanction_order ?? "—"} />
        <Field label="Place" value={item.place ?? "—"} />
      </div>

      <div className="mb-4">
        <AttachmentPanel
          photoUrl={item.photo_url}
          certificateUrl={item.certificate_url}
          latitude={item.latitude}
          longitude={item.longitude}
        />
      </div>

      {(item.email.sender || item.email.body) && (
        <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700">
            Email details
          </div>
          <div className="grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-4">
            <Field label="Sender" value={item.email.sender ?? "—"} />
            <Field label="Receiver" value={item.email.receiver ?? "—"} />
            <Field label="Subject" value={item.email.subject ?? "—"} />
            <Field label="Date" value={item.email.sent_at ? formatDate(item.email.sent_at) : "—"} />
          </div>
          {item.email.body && (
            <p className="border-t border-slate-100 px-3.5 py-2.5 text-sm text-slate-600">{item.email.body}</p>
          )}
        </div>
      )}

      <VerifyControls
        currentStatus={item.verification_status}
        currentRemarks={item.admin_remarks}
        isPending={verify.isPending}
        onSave={save}
      />
    </RecordAccordion>
  );
}
