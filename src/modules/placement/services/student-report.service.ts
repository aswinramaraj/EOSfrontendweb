import { apiClient, type BlobResponse } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  ApplicationStatus,
  OfferResponseStatus,
  ReportExportFormat,
  StudentDriveHistoryRow,
  StudentReportRow,
} from "../types";

interface BackendStudentReportRow {
  id: number;
  student_id_no: string;
  roll_no: string | null;
  name: string | null;
  class_label: string | null;
  department_name: string | null;
  drives_applied: number;
  status: ApplicationStatus | null;
  last_cleared_round: number | null;
  company_name: string | null;
}

interface BackendStudentDriveHistoryRow {
  drive_id: number;
  company_name: string;
  scheduled_date: string;
  job_role: string | null;
  attended: boolean;
  status: ApplicationStatus | null;
  last_cleared_round: number | null;
  offer_response: OfferResponseStatus | null;
  // Prisma Decimal fields serialize as strings over JSON, not numbers.
  offered_package: string | null;
}

function toRow(r: BackendStudentReportRow): StudentReportRow {
  return {
    id: r.id,
    studentIdNo: r.student_id_no,
    rollNo: r.roll_no,
    name: r.name ?? undefined,
    classLabel: r.class_label ?? undefined,
    departmentName: r.department_name ?? undefined,
    drivesApplied: r.drives_applied,
    status: r.status,
    lastClearedRound: r.last_cleared_round,
    companyName: r.company_name ?? undefined,
  };
}

function toHistoryRow(r: BackendStudentDriveHistoryRow): StudentDriveHistoryRow {
  return {
    driveId: r.drive_id,
    companyName: r.company_name,
    scheduledDate: r.scheduled_date,
    jobRole: r.job_role ?? undefined,
    attended: r.attended,
    status: r.status,
    lastClearedRound: r.last_cleared_round,
    offerResponse: r.offer_response,
    offeredPackageLpa: r.offered_package == null ? undefined : Number(r.offered_package),
  };
}

export const studentReportService = {
  // One request — the backend joins the full roster with every application
  // in memory (see DrivesService.getStudentReport) rather than one request
  // per student.
  async list(batchId?: number): Promise<StudentReportRow[]> {
    const rows = await apiClient.get<BackendStudentReportRow[]>(
      `/drives/student-report${buildQuery({ batch_id: batchId })}`,
      requireToken(),
    );
    return rows.map(toRow);
  },

  // Every drive cross-referenced against this one student — fetched only
  // when a row's detail view is opened, not eagerly for the whole roster.
  async history(studentId: number): Promise<StudentDriveHistoryRow[]> {
    const rows = await apiClient.get<BackendStudentDriveHistoryRow[]>(
      `/drives/student-report/${studentId}`,
      requireToken(),
    );
    return rows.map(toHistoryRow);
  },

  // Same batch/class filter the page is showing gets baked into the
  // export, so the downloaded file matches what's on screen.
  download(format: ReportExportFormat, batchId?: number, classLabel?: string): Promise<BlobResponse> {
    return apiClient.downloadBlob(
      `/drives/student-report/export${buildQuery({ format, batch_id: batchId, class: classLabel })}`,
      requireToken(),
    );
  },
};
