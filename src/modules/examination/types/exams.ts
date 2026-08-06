export type ExamTypeCategory = "internal" | "external";

export interface ExamType {
  id: number;
  name: string;
  code: string | null;
  category: ExamTypeCategory;
  is_university: boolean;
}

export interface CreateExamTypeInput {
  name: string;
  code?: string;
  category?: ExamTypeCategory;
  is_university?: boolean;
}

export type UpdateExamTypeInput = Partial<CreateExamTypeInput>;

export type ExamStatus =
  | "created"
  | "timetable_published"
  | "completed"
  | "results_published";

export interface Exam {
  id: number;
  exam_type_id: number;
  batch_id: number;
  academic_year: string;
  semester: number;
  status: ExamStatus;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface CreateExamInput {
  exam_type_id: number;
  batch_id: number;
  academic_year: string;
  semester: number;
  title?: string;
  start_date?: string;
  end_date?: string;
}

export type UpdateExamInput = Partial<CreateExamInput>;
