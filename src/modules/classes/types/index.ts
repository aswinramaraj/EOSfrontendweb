export interface ClassMentor {
  id: number;
  name: string;
  academic_year: string;
}

export interface ClassSummary {
  id: number;
  batch_id: number;
  department_id: number;
  course_id: number;
  section: string;
  current_semester: number | null;
  department: { id: number; name: string; code: string };
  course: { id: number; name: string; code: string };
  batch: { id: number; name: string };
  mentor: ClassMentor | null;
}

export interface AssignMentorInput {
  faculty_id: number;
  academic_year: string;
}

export interface MentorAssignment {
  id: number;
  class_id: number;
  faculty_id: number;
  academic_year: string;
  assigned_by_user_id: number | null;
  faculty: {
    id: number;
    first_name: string;
    last_name: string | null;
    designation: string | null;
  };
}
