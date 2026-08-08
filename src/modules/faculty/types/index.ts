export interface Faculty {
  id: number;
  first_name: string;
  last_name: string | null;
  designation: string | null;
  department: { id: number; name: string; code: string };
  email: string;
  phone: string | null;
  status: string;
}

export interface FacultyListParams {
  department_id?: number;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface FacultyOwnProfile {
  first_name: string;
  last_name: string | null;
  designation: string | null;
  department: { id: number; name: string; code: string };
  email: string;
  phone: string | null;
  date_of_joining: string | null;
  status: string;
}

// Backend PATCH /me/profile (UpdateFacultyDto) only allows first_name/last_name.
export interface UpdateOwnProfileInput {
  first_name?: string;
  last_name?: string;
}
