export interface ExamSubjectMapping {
  id: number;
  exam_id: number;
  class_id: number;
  subject_id: number;
  is_published: boolean;
  published_at: string | null;
  is_elective: boolean;
}

export interface MapSubjectsInput {
  exam_id: number;
  class_id: number;
}

export interface MapSubjectsResult {
  exam_id: number;
  class_id: number;
  total_subjects: number;
}
