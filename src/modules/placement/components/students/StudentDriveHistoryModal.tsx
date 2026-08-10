import { Modal } from "@/shared/components/ui/Modal";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { useStudentDriveHistory } from "../../hooks/useStudentDriveHistory";
import type { ApplicationStatus, StudentReportRow } from "../../types";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  r1_cleared: "R1 cleared",
  r2_cleared: "R2 cleared",
  r3_cleared: "R3 cleared",
  rejected: "Rejected",
  placed: "Placed",
};

const STATUS_TONE: Record<ApplicationStatus, PillTone> = {
  applied: "blue",
  r1_cleared: "blue",
  r2_cleared: "blue",
  r3_cleared: "blue",
  rejected: "red",
  placed: "green",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

interface StudentDriveHistoryModalProps {
  open: boolean;
  student: StudentReportRow | null;
  onClose: () => void;
}

export function StudentDriveHistoryModal({ open, student, onClose }: StudentDriveHistoryModalProps) {
  const { data: history, isLoading } = useStudentDriveHistory(student?.id ?? null);
  if (!student) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={student.name ?? student.studentIdNo}
      subtitle={`${student.studentIdNo}${student.classLabel ? ` · ${student.classLabel}` : ""}`}
      widthClassName="max-w-2xl"
    >
      {isLoading && <p className="text-sm text-slate-500">Loading drive history…</p>}

      {!isLoading && history && history.length === 0 && (
        <p className="text-sm text-slate-500">No placement drives have been scheduled yet.</p>
      )}

      {!isLoading && history && history.length > 0 && (
        <div className="flex flex-col gap-2">
          {history.map((h) => (
            <div
              key={h.driveId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{h.companyName}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(h.scheduledDate)}
                  {h.jobRole ? ` · ${h.jobRole}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {h.attended ? (
                  h.status && <StatusPill tone={STATUS_TONE[h.status]}>{STATUS_LABEL[h.status]}</StatusPill>
                ) : (
                  <StatusPill tone="slate">Not attended</StatusPill>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
