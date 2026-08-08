export interface Paginated<T> {
  page: number;
  page_size: number;
  total: number;
  data: T[];
}

// Mirrors the backend's `companies` table exactly: id, name, profile_info,
// created_at. Job role, package, eligibility, venue and rounds are all
// per-drive, not per-company — see PlacementDrive.
export interface Company {
  id: number;
  name: string;
  profileInfo?: string;
  createdAt: string;
}

export type CreateCompanyInput = Omit<Company, "id" | "createdAt">;
export type UpdateCompanyInput = Partial<CreateCompanyInput>;

export interface CompanyListParams {
  q?: string;
  page?: number;
  page_size?: number;
}

// Mirrors the real backend exactly: student_drive_applications tracks a
// single flat status per student per drive (see ApplicationStatus below),
// not a per-named-round breakdown, so there's no DriveRound concept on the
// backend at all (unlike the earlier UI-first mock).
export type DriveStatus = "scheduled" | "completed" | "cancelled";

export interface PlacementDrive {
  id: number;
  companyId: number;
  companyName: string;
  initials: string;
  status: DriveStatus;
  scheduledDate: string;
  isDisclosed: boolean;
  disclosedRevealDate?: string;
  appliedCount: number;
  // Real columns on placement_drives — nullable, so still optional here.
  role?: string;
  packageLpa?: number;
  eligibilityCgpa?: number;
  venue?: string;
  registrationStart?: string;
  registrationEnd?: string;
}

export interface CreateDriveInput {
  companyId: number;
  scheduledDate: string;
  isDisclosed: boolean;
  /** Required when isDisclosed is false — must be before scheduledDate. */
  disclosedRevealDate?: string;
  role?: string;
  packageLpa?: number;
  eligibilityCgpa?: number;
  venue?: string;
  /** Must be before registrationEnd (and before scheduledDate). */
  registrationStart?: string;
  registrationEnd?: string;
}

export interface DriveListParams {
  status?: DriveStatus;
  companyId?: number;
  upcoming?: boolean;
}

export type ApplicationStatus = "applied" | "r1_cleared" | "r2_cleared" | "r3_cleared" | "rejected" | "placed";

export interface DriveApplication {
  id: number;
  driveId: number;
  studentId: number;
  studentIdNo: string;
  rollNo: string | null;
  /** Undefined if the student has no soa_applications record linked. */
  studentName?: string;
  /** e.g. "CSE - A" — undefined if the student has no class mapped yet. */
  classLabel?: string;
  /** Full department name (e.g. "Computer Science and Engineering") — undefined if unmapped. */
  departmentName?: string;
  status: ApplicationStatus;
  lastClearedRound: number | null;
  updatedAt: string;
  /** Only meaningful once status is "placed" — null until the officer records a response. */
  offerResponse: OfferResponseStatus | null;
  /** The actual package offered to this student — can differ from the drive's advertised packageLpa. */
  offeredPackageLpa?: number;
}

export interface CreateApplicationInput {
  studentId: number;
}

// An "offer" isn't a real table yet — it's derived from drive applications
// whose status is "placed" (see offers.service.ts). Student/company/response/
// offeredPackageLpa are real; joining date and the offer letter have no
// backend column anywhere yet, so they stay off this type until the backend
// adds them.
export interface Offer {
  id: number;
  driveId: number;
  studentId: number;
  studentIdNo: string;
  rollNo: string | null;
  studentName?: string;
  departmentName?: string;
  companyName: string;
  jobRole?: string;
  /** The drive's advertised package — fall back to this until offeredPackageLpa is entered. */
  packageLpa?: number;
  /** The actual package offered to this specific student, editable once offerResponse is "accepted". */
  offeredPackageLpa?: number;
  offerResponse: OfferResponseStatus | null;
}

// Persisted on student_drive_applications.offer_response.
export type OfferResponseStatus = "accepted" | "pending" | "declined";

export type NotificationCategory = "registration" | "round" | "result" | "interview" | "offer" | "summary";

export interface NotificationItem {
  id: number;
  avatarLetter: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timeAgo: string;
  read: boolean;
}

export interface UpcomingDrive {
  id: number;
  date: string;
  day: string;
  month: string;
  company: string;
  // No placement_drives column for venue yet — role is real, venue stays
  // undefined until the backend adds it.
  role?: string;
  venue?: string;
}

export interface DashboardSummary {
  totalCompanies: number;
  companiesAddedThisMonth: number;
  activeDrives: number;
  drivesClosingThisWeek: number;
  studentsInProcess: number;
  studentsInProcessDriveCount: number;
  studentsPlaced: number;
  studentsPlacedYoyPct: number;
  placementPercentage: number;
  highestPackageLpa: number;
  averagePackageLpa: number;
  offersByMonth: { month: string; count: number }[];
  placementRateByDepartment: { department: string; placed: number; total: number }[];
  upcomingDrives: UpcomingDrive[];
}

export interface ClassPlacementRecord {
  className: string;
  students: number;
  placed: number;
  highestLpa: number;
  departmentName: string;
}

export interface DepartmentPlacementRecord {
  department: string;
  students: number;
  placed: number;
  highestLpa: number;
}

// Full student roster, from GET /student-profiles (placement/admin only).
// Powers eligible-student counts, department/class breakdowns and the
// Round Management student search — none of that is derivable from
// student_drive_applications alone, since that only has students who
// already applied to a drive.
export interface EligibleStudent {
  id: number;
  studentIdNo: string;
  rollNo: string | null;
  name?: string;
  classLabel?: string;
  departmentName?: string;
}

export interface Batch {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
}

export type ReportExportFormat = "pdf" | "excel";
export type ReportView = "class" | "department";

// One row per student in the full roster, joined with their best placement
// application (if any) — powers the Student Reports page's "attended /
// rounds cleared" view. `status`/`lastClearedRound` are null when the
// student never applied to any drive.
export interface StudentReportRow {
  id: number;
  studentIdNo: string;
  rollNo: string | null;
  name?: string;
  classLabel?: string;
  departmentName?: string;
  drivesApplied: number;
  status: ApplicationStatus | null;
  lastClearedRound: number | null;
  companyName?: string;
}

// One row per drive, cross-referenced against a single student's
// applications — every drive that exists, not just the ones the student
// applied to, so "attended or not" can be shown for the full list.
export interface StudentDriveHistoryRow {
  driveId: number;
  companyName: string;
  scheduledDate: string;
  jobRole?: string;
  attended: boolean;
  status: ApplicationStatus | null;
  lastClearedRound: number | null;
  offerResponse: OfferResponseStatus | null;
  offeredPackageLpa?: number;
}

export interface ReportsSummary {
  updatedOn: string;
  eligibleStudents: number;
  eligibleStudentsYoy: number;
  placed: number;
  placedYoyPct: number;
  placementRate: number;
  highestLpa: number;
  averageLpa: number;
  classWise: ClassPlacementRecord[];
  departmentWise: DepartmentPlacementRecord[];
}
