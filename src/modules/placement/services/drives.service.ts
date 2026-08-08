import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { CreateDriveInput, DriveListParams, DriveStatus, PlacementDrive } from "../types";

interface BackendDrive {
  id: number;
  company_id: number;
  is_disclosed: boolean;
  disclosed_reveal_date: string | null;
  scheduled_date: string;
  status: DriveStatus;
  job_role: string | null;
  // Prisma Decimal fields serialize as strings over JSON, not numbers.
  package_lpa: string | null;
  eligibility_cgpa: string | null;
  venue: string | null;
  registration_start: string | null;
  registration_end: string | null;
  // GET /drives/:id doesn't include this relation (no `include` in the
  // backend's findOne) — only list/create/update do.
  companies?: { id: number; name: string; profile_info: string | null };
  _count?: { student_drive_applications: number };
}

interface BackendPaginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function toDrive(d: BackendDrive): PlacementDrive {
  const companyName = d.companies?.name ?? "Unknown company";
  return {
    id: d.id,
    companyId: d.company_id,
    companyName,
    initials: initials(companyName),
    status: d.status,
    scheduledDate: d.scheduled_date,
    isDisclosed: d.is_disclosed,
    disclosedRevealDate: d.disclosed_reveal_date ?? undefined,
    appliedCount: d._count?.student_drive_applications ?? 0,
    role: d.job_role ?? undefined,
    packageLpa: d.package_lpa !== null ? Number(d.package_lpa) : undefined,
    eligibilityCgpa: d.eligibility_cgpa !== null ? Number(d.eligibility_cgpa) : undefined,
    venue: d.venue ?? undefined,
    registrationStart: d.registration_start ?? undefined,
    registrationEnd: d.registration_end ?? undefined,
  };
}

export const drivesService = {
  async list(params: DriveListParams = {}): Promise<PlacementDrive[]> {
    const res = await apiClient.get<BackendPaginated<BackendDrive>>(
      `/drives${buildQuery({
        status: params.status,
        company_id: params.companyId,
        upcoming: params.upcoming,
        limit: 100,
      })}`,
      requireToken(),
    );
    return res.data.map(toDrive);
  },

  async get(id: number): Promise<PlacementDrive> {
    // GET /drives/:id doesn't include the companies relation, so this
    // deliberately isn't relied on anywhere the company name matters — see
    // useDrive's comment.
    const drive = await apiClient.get<BackendDrive>(`/drives/${id}`, requireToken());
    return toDrive(drive);
  },

  async create(input: CreateDriveInput): Promise<PlacementDrive> {
    const drive = await apiClient.post<BackendDrive>(
      "/drives",
      {
        company_id: input.companyId,
        scheduled_date: input.scheduledDate,
        is_disclosed: input.isDisclosed,
        disclosed_reveal_date: input.isDisclosed ? undefined : input.disclosedRevealDate,
        job_role: input.role,
        package_lpa: input.packageLpa,
        eligibility_cgpa: input.eligibilityCgpa,
        venue: input.venue,
        registration_start: input.registrationStart,
        registration_end: input.registrationEnd,
      },
      requireToken(),
    );
    return toDrive(drive);
  },
};
