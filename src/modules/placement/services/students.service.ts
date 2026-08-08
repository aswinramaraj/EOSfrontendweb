import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { EligibleStudent } from "../types";

interface BackendStudentProfile {
  id: number;
  student_id_no: string;
  roll_no: string | null;
  classes: { section: string; departments: { name: string; code: string } } | null;
  soa_applications: { first_name: string; last_name: string | null } | null;
}

interface BackendPaginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function toStudent(s: BackendStudentProfile): EligibleStudent {
  const soa = s.soa_applications;
  const classes = s.classes;
  return {
    id: s.id,
    studentIdNo: s.student_id_no,
    rollNo: s.roll_no,
    name: soa ? [soa.first_name, soa.last_name].filter(Boolean).join(" ") : undefined,
    classLabel: classes ? `${classes.departments.code} - ${classes.section}` : undefined,
    departmentName: classes?.departments.name,
  };
}

export const studentsService = {
  // GET /student-profiles caps `limit` at 100 per page — unlike /drives
  // (small enough to fit one page), the full roster can exceed that, and
  // eligible-student counts/department breakdowns need to be accurate, so
  // this loops every page instead of taking just the first.
  async listAll(): Promise<EligibleStudent[]> {
    const first = await apiClient.get<BackendPaginated<BackendStudentProfile>>(
      `/student-profiles?limit=100&page=1`,
      requireToken(),
    );
    const rows = [...first.data];
    for (let page = 2; page <= first.meta.totalPages; page++) {
      const res = await apiClient.get<BackendPaginated<BackendStudentProfile>>(
        `/student-profiles?limit=100&page=${page}`,
        requireToken(),
      );
      rows.push(...res.data);
    }
    return rows.map(toStudent);
  },
};
