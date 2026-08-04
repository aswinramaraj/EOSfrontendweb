export type ResidentFeeStatus = "not_applicable" | "unpaid" | "partially_paid" | "paid";
export type ResidentCurrentStatus = "in_hostel" | "on_leave";

export interface ResidentHostelRef {
  id: number;
  name: string;
  code: string;
}

export interface ResidentRoomRef {
  id: number;
  room_number: string;
}

export interface Resident {
  id: number;
  student_id_no: string;
  roll_no: string | null;
  name: string;
  course: string;
  batch: string;
  hostel: ResidentHostelRef | null;
  room: ResidentRoomRef | null;
  sharing: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  fee_status: ResidentFeeStatus;
  allocated_date: string | null;
  current_status: ResidentCurrentStatus;
}

export interface ResidentListParams {
  q?: string;
  hostel_id?: number;
  page?: number;
  page_size?: number;
}
