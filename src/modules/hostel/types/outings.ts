export type OutingStatus = "pending" | "approved" | "rejected";

export interface OutingStudentRef {
  id: number;
  name: string;
  student_id_no: string;
  roll_no: string | null;
}

export interface OutingHostelRef {
  id: number;
  name: string;
  code: string;
}

export interface Outing {
  id: number;
  student: OutingStudentRef;
  hostel: OutingHostelRef | null;
  room_number: string | null;
  from_date: string;
  to_date: string;
  start_time: string;
  return_time: string | null;
  reason: string | null;
  status: OutingStatus;
  approved_by_warden: string | null;
  created_at: string;
}

export interface OutingListParams {
  status?: OutingStatus;
  hostel_id?: number;
  page?: number;
  page_size?: number;
}

export type OutingDecision = "approved" | "rejected";
