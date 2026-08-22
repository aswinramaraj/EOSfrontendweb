"use client";

import { useState } from "react";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { formatRelativeTime } from "@/shared/lib/relative-time";
import {
  AwardIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  FolderIcon,
  InboxIcon,
  PeopleIcon,
  RupeeIcon,
} from "@/shared/components/icons";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { useFacultyAttendanceOverview } from "@/modules/faculty/hooks/useFacultyAttendanceOverview";
import { facultyService } from "@/modules/faculty/services/faculty.service";
import { exportAttendanceSummaryPdf, exportFacultyRosterPdf } from "@/modules/faculty/lib/faculty-report-pdfs";
import { fetchAllPages } from "@/modules/faculty/lib/report-export";
import { useHrDepartments } from "@/modules/hr/hooks/useHrDepartments";
import { useHrRequests } from "@/modules/hr/hooks/useHrRequests";
import { useAppraisalRequests } from "@/modules/hr/hooks/useAppraisalRequests";
import { useHrPayroll } from "@/modules/hr/hooks/useHrPayroll";
import { useReportExportHistory } from "@/modules/hr/hooks/useReportExportHistory";
import { hrRequestsService } from "@/modules/hr/services/hr-requests.service";
import { appraisalRequestsService } from "@/modules/hr/services/appraisal-requests.service";
import { hrPayrollService } from "@/modules/hr/services/hr-payroll.service";
import {
  buildFacultyDepartmentLookup,
  exportAppraisalReportPdf,
  exportDepartmentOverviewPdf,
  exportHrRequestsPdf,
  exportPayrollReportPdf,
} from "@/modules/hr/lib/hr-report-pdfs";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HOVERABLE } from "@/modules/hr/components/ui/hoverable";

const ALL = "all";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function HRReportsPage() {
  const { show } = useToast();
  const [departmentId, setDepartmentId] = useState(ALL);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const { history, record } = useReportExportHistory();

  const deptId = departmentId !== ALL ? Number(departmentId) : undefined;
  const { data: departments } = useDepartments();
  const deptLabel = deptId ? departments?.find((d) => d.id === deptId)?.name : undefined;

  const { data: employeeCount } = useFaculties({ department_id: deptId, limit: 1 });
  const { data: leaveCount } = useHrRequests({ department_id: deptId, kind: "leave", limit: 1 });
  const { data: odCount } = useHrRequests({ department_id: deptId, kind: "od", limit: 1 });
  const { data: pendingCount } = useHrRequests({ department_id: deptId, status: "pending", limit: 1 });
  const { data: attendanceOverview } = useFacultyAttendanceOverview({ department_id: deptId });
  const { data: hrDepartments } = useHrDepartments();
  const { data: appraisalCountData } = useAppraisalRequests({ limit: 1 });
  const { data: payrollCountData } = useHrPayroll({ month: currentMonth(), limit: 1 });

  async function runExport<T>(
    key: string,
    label: string,
    fetchRows: () => Promise<T[]>,
    generate: (rows: T[]) => void | Promise<void>,
  ) {
    setPendingKey(key);
    try {
      const rows = await fetchRows();
      if (rows.length === 0) {
        show(`No data to export for ${label}.`, "info");
        return;
      }
      await generate(rows);
      record(label);
      show(`${label} exported.`, "success");
    } catch (err) {
      show(err instanceof ApiError ? err.message : `Couldn't generate ${label}.`, "error");
    } finally {
      setPendingKey(null);
    }
  }

  async function loadFacultyDepartmentLookup() {
    const { rows } = await fetchAllPages((page, limit) => facultyService.list({ page, limit }));
    return buildFacultyDepartmentLookup(rows);
  }

  const reports = [
    {
      key: "employee-master",
      title: "Employee Master",
      description: "Full faculty roster with designation, department, and contact details.",
      icon: PeopleIcon,
      count: employeeCount?.meta.total ?? null,
      onDownload: () =>
        runExport(
          "employee-master",
          "Employee Master",
          () => fetchAllPages((page, limit) => facultyService.list({ department_id: deptId, page, limit })).then((r) => r.rows),
          (rows) => exportFacultyRosterPdf(rows),
        ),
    },
    {
      key: "department-employees",
      title: "Department Employees",
      description: "Headcount, leave/OD today, and appraisal status by department.",
      icon: FolderIcon,
      count: deptId ? 1 : (hrDepartments?.length ?? null),
      onDownload: () =>
        runExport(
          "department-employees",
          "Department Employees",
          async () => (deptId ? (hrDepartments ?? []).filter((d) => d.id === deptId) : (hrDepartments ?? [])),
          (rows) => exportDepartmentOverviewPdf(rows),
        ),
    },
    {
      key: "attendance",
      title: "Attendance Summary",
      description: "Full/half/absent day totals and attendance % per faculty.",
      icon: ClockIcon,
      count: attendanceOverview?.rows.length ?? null,
      onDownload: () =>
        runExport(
          "attendance",
          "Attendance Summary",
          async () => attendanceOverview?.rows ?? [],
          (rows) => exportAttendanceSummaryPdf(rows, { academicYear: "Current", department: deptLabel }),
        ),
    },
    {
      key: "leave",
      title: "Leave Report",
      description: "All leave requests with approval stage and duration.",
      icon: CalendarIcon,
      count: leaveCount?.meta.total ?? null,
      onDownload: () =>
        runExport(
          "leave",
          "Leave Report",
          () =>
            fetchAllPages((page, limit) => hrRequestsService.list({ department_id: deptId, kind: "leave", page, limit })).then(
              (r) => r.rows,
            ),
          (rows) => exportHrRequestsPdf(rows, { title: "Leave Report", filenameSlug: "leave-report", department: deptLabel }),
        ),
    },
    {
      key: "od",
      title: "OD Report",
      description: "On-duty requests with HOD/HR approval status.",
      icon: BriefcaseIcon,
      count: odCount?.meta.total ?? null,
      onDownload: () =>
        runExport(
          "od",
          "OD Report",
          () =>
            fetchAllPages((page, limit) => hrRequestsService.list({ department_id: deptId, kind: "od", page, limit })).then(
              (r) => r.rows,
            ),
          (rows) => exportHrRequestsPdf(rows, { title: "OD Report", filenameSlug: "od-report", department: deptLabel }),
        ),
    },
    {
      key: "appraisal",
      title: "Appraisal Report",
      description: "Appraisal status across the current cycle (all departments).",
      icon: AwardIcon,
      count: appraisalCountData?.meta.total ?? null,
      onDownload: () =>
        runExport(
          "appraisal",
          "Appraisal Report",
          () => fetchAllPages((page, limit) => appraisalRequestsService.list({ page, limit })).then((r) => r.rows),
          async (rows) => {
            const lookup = deptId ? await loadFacultyDepartmentLookup() : new Map();
            const scoped = deptId ? rows.filter((r) => lookup.get(r.faculty.id)?.name && deptLabel === lookup.get(r.faculty.id)?.name) : rows;
            exportAppraisalReportPdf(scoped, lookup, { department: deptLabel });
          },
        ),
    },
    {
      key: "payroll",
      title: "Payroll Report",
      description: "Gross, net, and payment status for the current month (all departments).",
      icon: RupeeIcon,
      count: payrollCountData?.meta.total ?? null,
      onDownload: () =>
        runExport(
          "payroll",
          "Payroll Report",
          () =>
            fetchAllPages((page, limit) => hrPayrollService.list({ month: currentMonth(), page, limit })).then((r) => r.rows),
          async (rows) => {
            const lookup = deptId ? await loadFacultyDepartmentLookup() : new Map();
            const scoped = deptId
              ? rows.filter((r) => r.faculty && lookup.get(r.faculty.id)?.name === deptLabel)
              : rows;
            exportPayrollReportPdf(scoped, lookup, { month: currentMonth(), department: deptLabel });
          },
        ),
    },
    {
      key: "pending-requests",
      title: "Pending Requests",
      description: "Every leave/OD request currently awaiting HR action.",
      icon: InboxIcon,
      count: pendingCount?.meta.total ?? null,
      onDownload: () =>
        runExport(
          "pending-requests",
          "Pending Requests",
          () =>
            fetchAllPages((page, limit) => hrRequestsService.list({ department_id: deptId, status: "pending", page, limit })).then(
              (r) => r.rows,
            ),
          (rows) =>
            exportHrRequestsPdf(rows, {
              title: "Pending Requests",
              filenameSlug: "pending-requests",
              department: deptLabel,
              status: "Pending",
            }),
        ),
    },
  ];

  return (
    <div>
      <HRPageHeader
        title="Reports & Analytics"
        description="Statutory, management and audit reports generated from live HR data."
      />

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <HRStatCard icon={FolderIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Reports Available" value={reports.length} caption="Across HR data" />
        <HRStatCard
          icon={DownloadIcon}
          iconClassName="bg-[#EEF2FF] text-[#2655DA]"
          label="Generated This Month"
          value={history.filter((h) => new Date(h.generatedAt).getMonth() === new Date().getMonth()).length}
        />
        <HRStatCard icon={ClockIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Last Export" value={history[0] ? formatRelativeTime(history[0].generatedAt) : "—"} />
      </div>

      <div className="mb-5 flex items-center gap-2">
        <label htmlFor="reports-department" className="text-sm font-medium text-slate-600">
          Department
        </label>
        <SelectInput
          id="reports-department"
          className="w-auto"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value={ALL}>All Departments</option>
          {departments?.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d.name}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div key={report.key} className={`flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 ${HOVERABLE}`}>
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <report.icon className="h-5 w-5" />
              </span>
              {report.count != null && <span className="text-[26px] font-black text-slate-900">{report.count}</span>}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{report.title}</p>
              <p className="mt-1 text-xs text-slate-500">{report.description}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              isPending={pendingKey === report.key}
              onClick={report.onDownload}
            >
              <DownloadIcon className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">Recent Exports</h3>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing exported yet this session.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-slate-100">
            {history.map((entry, index) => (
              <li key={`${entry.generatedAt}-${index}`} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium text-slate-800">{entry.label}</span>
                <span className="text-xs text-slate-500">{formatRelativeTime(entry.generatedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
