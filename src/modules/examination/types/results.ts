export interface ResultsSummary {
  exam_id: number;
  total_papers: number;
  pass_percentage: number;
  average_percentage: number;
  arrears_count: number;
  moderated_count: number;
}

export interface DepartmentPassRate {
  department_id: number;
  department_name: string;
  department_code: string;
  total_papers: number;
  pass_percentage: number;
}

// "current_exam_gpa" is a credit-weighted average for this one exam — NOT
// true cross-semester CGPA, which this schema has no history to compute.
export interface RankHolder {
  student_id: number;
  student_id_no: string;
  name: string;
  current_exam_gpa: number;
}

export type PublicationType = "original" | "revaluation";

export interface ResultPublication {
  id: number;
  exam_id: number;
  publication_type: PublicationType;
  published_by_user_id: number | null;
  published_at: string;
  exams: { id: number; academic_year: string; semester: number; title: string | null };
  users: { id: number; email: string; role_id: number; status: string } | null;
}
