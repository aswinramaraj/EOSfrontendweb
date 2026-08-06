import type { ExamSession } from "./index";

export type InvigilationRole = "chief" | "relief";
export type InvigilationBatchStatus = "draft" | "submitted" | "published";

export interface HallPlan {
  id: number;
  exam_id: number;
  exam_date: string;
  venues: { id: number; name: string; location: string | null };
}

export interface InvigilationDuty {
  id: number;
  exam_id: number;
  faculty_id: number;
  hall_plan_id: number;
  duty_date: string;
  session: ExamSession;
  role: InvigilationRole;
  allocation_batch_id: number | null;
  faculty: { id: number; first_name: string; last_name: string; designation: string | null };
  hall_plans: { id: number; exam_id: number; exam_date: string; venues: { id: number; name: string; location: string | null } };
  warning?: "DOUBLE_DUTY";
}

export interface InvigilationBatch {
  id: number;
  exam_id: number;
  exam_date: string;
  session: ExamSession;
  status: InvigilationBatchStatus;
  created_by_user_id: number | null;
  created_at: string;
  published_by_user_id: number | null;
  published_at: string | null;
  _count?: { invigilation_duties: number };
}

export interface FacultyWorkload {
  faculty: { id: number; first_name: string; last_name: string; designation: string | null };
  total_duties: number;
  chief_duties: number;
  relief_duties: number;
}

export interface CreateInvigilationDutyInput {
  exam_id: number;
  hall_plan_id: number;
  faculty_id: number;
  duty_date: string;
  session: ExamSession;
  role?: InvigilationRole;
  allocation_batch_id?: number;
}

export type UpdateInvigilationDutyInput = Partial<
  Omit<CreateInvigilationDutyInput, "exam_id">
>;

export interface FindInvigilationParams {
  exam_id?: number;
  hall_plan_id?: number;
  faculty_id?: number;
  duty_date?: string;
  session?: ExamSession;
  role?: InvigilationRole;
  page?: number;
  limit?: number;
}

export interface FindHallPlansParams {
  exam_id?: number;
  exam_date?: string;
  page?: number;
  limit?: number;
}

export interface CreateAllocationBatchInput {
  exam_id: number;
  exam_date: string;
  session: ExamSession;
}

export interface ListAllocationBatchesParams {
  exam_id?: number;
  exam_date?: string;
  session?: ExamSession;
  status?: InvigilationBatchStatus;
}
