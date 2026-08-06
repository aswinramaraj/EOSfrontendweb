import type { ExamSession } from "./index";

export type TimetableVersionStatus =
  | "draft"
  | "ready_to_publish"
  | "published"
  | "superseded"
  | "withdrawn";

export interface TimetableVersion {
  id: number;
  exam_id: number;
  department_id: number | null;
  version_number: number;
  status: TimetableVersionStatus;
  signature: string | null;
  created_by_user_id: number | null;
  created_at: string;
  published_by_user_id: number | null;
  published_at: string | null;
  withdrawn_at: string | null;
  departments: { id: number; name: string; code: string } | null;
  _count?: { exam_timetable: number };
}

export interface TimetableSlot {
  id: number;
  version_id: number;
  exam_subject_mapping_id: number;
  exam_date: string;
  session: ExamSession;
  start_time: string;
  end_time: string;
  venue_id: number | null;
  exam_subject_mapping: {
    id: number;
    classes: { id: number; section: string; department_id: number };
    subjects: { id: number; name: string; subject_code: string };
  };
  venues: { id: number; name: string; location: string | null } | null;
}

export interface TimetableVersionDetail extends TimetableVersion {
  exam_timetable: TimetableSlot[];
}

export interface CreateTimetableVersionInput {
  exam_id: number;
  department_id?: number;
}

export interface ListTimetableVersionsParams {
  exam_id?: number;
  department_id?: number;
  status?: TimetableVersionStatus;
}

export interface CreateTimetableSlotInput {
  version_id: number;
  exam_subject_mapping_id: number;
  exam_date: string;
  session: ExamSession;
  start_time: string;
  end_time: string;
  venue_id?: number;
}

export type UpdateTimetableSlotInput = Partial<
  Omit<CreateTimetableSlotInput, "version_id" | "exam_subject_mapping_id">
>;
