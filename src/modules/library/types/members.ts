export interface MemberLastBorrowed {
  title: string;
  date: string;
}

export interface LibraryMember {
  id: number;
  student_id_no: string;
  register_no: string | null;
  name: string;
  department: { id: number; name: string; code: string };
  currently_borrowed: number;
  total_borrowed: number;
  last_borrowed: MemberLastBorrowed | null;
  library_status: "clear" | "overdue";
}

export interface MemberListParams {
  q?: string;
  department_id?: number;
  page?: number;
  page_size?: number;
}
