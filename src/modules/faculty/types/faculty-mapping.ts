// Response shape confirmed live against GET /me/faculty-mapping (2026-08-05,
// admin session) — subject/class/faculty come back as nested, already-named
// objects, not raw FK ids. No client-side name resolution needed.
export interface FacultyMapping {
  id: number;
  academic_year: string;
  faculty: {
    id: number;
    first_name: string;
    last_name: string;
    designation: string;
    profile_url: string | null;
  };
  subject: {
    id: number;
    name: string;
    subject_code: string;
  };
  class: {
    id: number;
    section: string;
    department: {
      id: number;
      name: string;
      code: string;
    };
  };
}

export interface FacultyMappingListParams {
  faculty_id?: number;
  class_id?: number;
  subject_id?: number;
  academic_year?: string;
  limit?: number;
  page?: number;
}

// Confirmed live: pagination info is nested under `meta`, not flat
// alongside `data` (unlike the assumption in the earlier draft).
export interface FacultyMappingListResponse {
  data: FacultyMapping[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
