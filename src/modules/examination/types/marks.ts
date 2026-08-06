export interface ExamMark {
  id: number;
  exam_subject_mapping_id: number;
  student_id: number;
  marks_obtained: number | null;
  max_marks: number;
  entered_by_faculty_id: number | null;
  entered_at: string;
  is_absent: boolean;
  is_moderated: boolean;
  exam_subject_mapping: {
    id: number;
    exam_id: number;
    class_id: number;
    subject_id: number;
    is_published: boolean;
    is_elective: boolean;
  };
  students: {
    id: number;
    student_id_no: string;
    roll_no: string | null;
    register_no: string | null;
    class_id: number | null;
  };
  faculty: { id: number; first_name: string; last_name: string } | null;
}

export interface CreateMarkInput {
  exam_subject_mapping_id: number;
  student_id: number;
  marks_obtained?: number;
  max_marks: number;
  entered_by_faculty_id?: number;
  is_absent?: boolean;
}

export interface UpdateMarkInput {
  marks_obtained?: number;
  max_marks?: number;
  entered_by_faculty_id?: number;
  is_absent?: boolean;
}

export interface MarksEntryLock {
  exam_id: number;
  department_id: number;
  is_locked: boolean;
  locked_at: string | null;
  is_published: boolean;
  published_at: string | null;
}
