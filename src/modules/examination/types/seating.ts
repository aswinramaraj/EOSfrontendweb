import type { ExamSession } from "./index";
import type { TimetableVersionStatus } from "./exam-timetable-versions";

export type SeatingAllocationMode = "automatic" | "manual";

export type SeatingPattern =
  | "sequential"
  | "alternate_seat"
  | "rowwise_mixed"
  | "columnwise_mixed"
  | "checkerboard"
  | "snake_order";

export type SeatingVersionStatus = TimetableVersionStatus;

export interface SeatingVenueDepartment {
  id: number;
  department_id: number;
  departments: { id: number; name: string; code: string };
}

export interface SeatingVersionVenue {
  id: number;
  version_id: number;
  venue_id: number;
  hall_plan_id: number | null;
  allocation_mode: SeatingAllocationMode;
  pattern: SeatingPattern | null;
  venues: { id: number; name: string; location: string | null; capacity: number | null };
  seating_plan_venue_departments: SeatingVenueDepartment[];
  hall_plans: { id: number } | null;
}

export interface SeatingVersion {
  id: number;
  exam_id: number;
  exam_date: string;
  session: ExamSession;
  version_number: number;
  status: SeatingVersionStatus;
  signature: string | null;
  created_at: string;
  published_at: string | null;
  withdrawn_at: string | null;
  _count?: { seating_plan_version_venues: number };
}

export interface SeatingVersionDetail extends SeatingVersion {
  seating_plan_version_venues: SeatingVersionVenue[];
}

export interface SeatArrangementRow {
  id: number;
  seat_number: string;
  is_special_accommodation: boolean;
  students: { id: number; student_id_no: string; roll_no: string | null; register_no: string | null };
}

export interface CreateSeatingVersionInput {
  exam_id: number;
  exam_date: string;
  session: ExamSession;
}

export interface ListSeatingVersionsParams {
  exam_id?: number;
  exam_date?: string;
  session?: ExamSession;
  status?: SeatingVersionStatus;
}

export interface AddVersionVenueInput {
  venue_id: number;
  allocation_mode?: SeatingAllocationMode;
  pattern?: SeatingPattern;
  department_ids?: number[];
}

export type UpdateVersionVenueInput = Partial<Omit<AddVersionVenueInput, "venue_id">>;

export interface AllocateVersionVenueInput {
  entries?: string[];
  special_accommodation_register_numbers?: string[];
}
