import { exportToPdf } from "@/shared/lib/pdf-export";
import { formatDate, fullName } from "@/modules/faculty/lib/faculty-format";
import type { Faculty } from "@/modules/faculty/types";
import type {
  AppraisalRequest,
  AppraisalRequestStatus,
  ApprovalStatus,
  HrDepartmentRollup,
  HrPayrollRecord,
  HrUnifiedRequest,
} from "../types/api";

const INSTITUTION = "Sri Eshwar College of Engineering — HR Module";
const today = () => new Date().toISOString().slice(0, 10);

export type FacultyDepartmentLookup = Map<number, { name: string; code?: string } | null>;

export function buildFacultyDepartmentLookup(rows: Faculty[]): FacultyDepartmentLookup {
  const map: FacultyDepartmentLookup = new Map();
  for (const f of rows) map.set(f.id, f.department ? { name: f.department.name, code: f.department.code } : null);
  return map;
}

function departmentLabel(dept: { name: string; code?: string } | null | undefined): string {
  return dept ? (dept.code ?? dept.name) : "—";
}

const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const APPRAISAL_STATUS_LABEL: Record<AppraisalRequestStatus, string> = {
  submitted: "Submitted",
  hod_reviewed: "HOD Reviewed",
  hr_scored: "HR Scored",
  management_approved: "Approved",
  rejected: "Rejected",
};

export function exportDepartmentOverviewPdf(rows: HrDepartmentRollup[]) {
  return exportToPdf({
    title: "Department Employees",
    subtitle: INSTITUTION,
    meta: [["Departments", String(rows.length)]],
    sections: [
      {
        type: "table",
        columns: [
          { header: "Department", key: "name" },
          { header: "Code", key: "code" },
          { header: "Total Faculty", key: "total" },
          { header: "On Leave Today", key: "leave" },
          { header: "On OD Today", key: "od" },
          { header: "Pending Requests", key: "pending" },
          { header: "Appraisal Status", key: "appraisal" },
        ],
        rows: rows.map((d) => ({
          name: d.name,
          code: d.code,
          total: d.total_faculty,
          leave: d.on_leave_today,
          od: d.on_od_today,
          pending: d.pending_requests,
          appraisal: d.appraisal_status.replace("_", " "),
        })),
      },
    ],
    filename: `department-employees-${today()}.pdf`,
  });
}

export function exportHrRequestsPdf(
  rows: HrUnifiedRequest[],
  meta: { title: string; filenameSlug: string; department?: string; status?: string },
) {
  return exportToPdf({
    title: meta.title,
    subtitle: INSTITUTION,
    meta: [
      ["Department", meta.department ?? "All Departments"],
      ...(meta.status ? ([["Status", meta.status]] as [string, string][]) : []),
      ["Requests", String(rows.length)],
    ],
    sections: [
      {
        type: "table",
        columns: [
          { header: "Faculty", key: "name" },
          { header: "Department", key: "department" },
          { header: "Type", key: "type" },
          { header: "From", key: "from" },
          { header: "To", key: "to" },
          { header: "HOD Status", key: "hod" },
          { header: "HR Status", key: "hr" },
          { header: "Overall Status", key: "overall" },
          { header: "Applied On", key: "appliedOn" },
        ],
        rows: rows.map((r) => ({
          name: fullName(r.faculty),
          department: r.faculty.department.name,
          type: r.kind === "leave" ? "Leave" : "OD",
          from: formatDate(r.from_date),
          to: formatDate(r.to_date),
          hod: APPROVAL_LABEL[r.hod_approval_status],
          hr: APPROVAL_LABEL[r.hr_approval_status],
          overall: APPROVAL_LABEL[r.overall_status],
          appliedOn: formatDate(r.created_at),
        })),
      },
    ],
    filename: `${meta.filenameSlug}-${today()}.pdf`,
  });
}

export function exportAppraisalReportPdf(
  rows: AppraisalRequest[],
  deptLookup: FacultyDepartmentLookup,
  meta: { department?: string },
) {
  return exportToPdf({
    title: "Appraisal Report",
    subtitle: INSTITUTION,
    meta: [
      ["Department", meta.department ?? "All Departments"],
      ["Requests", String(rows.length)],
    ],
    sections: [
      {
        type: "table",
        columns: [
          { header: "Faculty", key: "name" },
          { header: "Department", key: "department" },
          { header: "Academic Year", key: "year" },
          { header: "Status", key: "status" },
          { header: "HOD Reviewer", key: "hodReviewer" },
          { header: "Management Approver", key: "mgmtApprover" },
          { header: "Submitted On", key: "submittedOn" },
        ],
        rows: rows.map((r) => ({
          name: fullName(r.faculty),
          department: departmentLabel(deptLookup.get(r.faculty.id)),
          year: r.academic_year,
          status: APPRAISAL_STATUS_LABEL[r.status],
          hodReviewer: r.hod_reviewer?.email ?? "—",
          mgmtApprover: r.management_approver?.email ?? "—",
          submittedOn: formatDate(r.created_at),
        })),
      },
    ],
    filename: `appraisal-report-${today()}.pdf`,
  });
}

export function exportPayrollReportPdf(
  rows: HrPayrollRecord[],
  deptLookup: FacultyDepartmentLookup,
  meta: { month?: string; department?: string },
) {
  return exportToPdf({
    title: "Payroll Report",
    subtitle: INSTITUTION,
    meta: [
      ["Month", meta.month ?? "All Months"],
      ["Department", meta.department ?? "All Departments"],
      ["Records", String(rows.length)],
    ],
    sections: [
      {
        type: "table",
        columns: [
          { header: "Faculty", key: "name" },
          { header: "Department", key: "department" },
          { header: "Month", key: "month" },
          { header: "Gross", key: "gross" },
          { header: "Net", key: "net" },
          { header: "Status", key: "status" },
          { header: "Paid On", key: "paidOn" },
        ],
        rows: rows.map((r) => ({
          name: r.faculty ? fullName(r.faculty) : "—",
          department: departmentLabel(r.faculty ? deptLookup.get(r.faculty.id) : undefined),
          month: r.month,
          gross: `₹${r.gross_amount.toLocaleString("en-IN")}`,
          net: `₹${r.net_amount.toLocaleString("en-IN")}`,
          status: r.paid_at ? "Paid" : "Pending",
          paidOn: r.paid_at ? formatDate(r.paid_at) : "—",
        })),
      },
    ],
    filename: `payroll-report-${today()}.pdf`,
  });
}
