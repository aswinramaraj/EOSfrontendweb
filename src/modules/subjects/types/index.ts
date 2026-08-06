export interface SubjectRef {
  id: number;
  name: string;
  subject_code: string;
  department_id: number | null;
  credits: number | null;
}
