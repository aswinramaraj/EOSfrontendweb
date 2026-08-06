import type { ExamSession } from "./index";

export type MalpracticeNature =
  | "unauthorised_material"
  | "copying"
  | "mobile_device"
  | "impersonation"
  | "misbehaviour_with_invigilator"
  | "answer_script_tampering";

export type MalpracticeAction =
  | "reported_to_coe"
  | "warning_issued"
  | "paper_cancelled"
  | "semester_cancelled"
  | "debarred_one_year"
  | "case_under_enquiry";

export interface MalpracticeIncident {
  id: number;
  student_id: number;
  exam_id: number;
  exam_subject_mapping_id: number | null;
  venue_id: number | null;
  incident_date: string;
  session: ExamSession;
  seat_number: string | null;
  nature: MalpracticeNature;
  action_taken: MalpracticeAction;
  invigilator_remarks: string | null;
  reported_by_faculty_id: number | null;
  students: { id: number; student_id_no: string; roll_no: string | null; register_no: string | null };
  exams: { id: number; academic_year: string; semester: number };
  exam_subject_mapping: {
    id: number;
    subjects: { id: number; name: string; subject_code: string };
    classes: { id: number; section: string };
  } | null;
  venues: { id: number; name: string; location: string | null } | null;
  faculty: { id: number; first_name: string; last_name: string } | null;
}

export interface CreateMalpracticeIncidentInput {
  student_id: number;
  exam_id: number;
  exam_subject_mapping_id?: number;
  venue_id?: number;
  incident_date: string;
  session: ExamSession;
  seat_number?: string;
  nature: MalpracticeNature;
  action_taken: MalpracticeAction;
  invigilator_remarks?: string;
  reported_by_faculty_id?: number;
}

export type UpdateMalpracticeIncidentInput = Partial<CreateMalpracticeIncidentInput>;

export interface FindMalpracticeParams {
  student_id?: number;
  exam_id?: number;
  nature?: MalpracticeNature;
  action_taken?: MalpracticeAction;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
