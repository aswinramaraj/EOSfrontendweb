// The exams backend paginates differently from Library/Hostel — it returns
// `{data, meta}` with page/limit (see EOS-backend src/common/dto/pagination.dto.ts),
// not Library's flat `{page, page_size, total, data}`. Every hook/service in
// this module must build queries and read responses against this shape.
export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type ExamSession = "FN" | "AN";

// Departments are shared across modules — reuse `Department` from
// @/modules/departments/types and `useDepartments()` rather than
// redefining a parallel ref type here.

export interface VenueRef {
  id: number;
  name: string;
  block: string | null;
  capacity: number;
}

export interface FacultyRef {
  id: number;
  first_name: string;
  last_name: string;
}

export interface ExamTypeRef {
  id: number;
  name: string;
  code: string | null;
  category: string | null;
  is_university: boolean;
}

export interface ExamRef {
  id: number;
  title: string | null;
  exam_type_id: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
}
