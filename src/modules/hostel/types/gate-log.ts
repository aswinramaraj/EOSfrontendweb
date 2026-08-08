export type GateEntryType = "in" | "out";

export interface GateLogEntry {
  id: number;
  student: {
    id: number;
    name: string;
    student_id_no: string;
    roll_no: string | null;
  };
  hostel: { id: number; name: string; code: string } | null;
  room_number: string | null;
  entry_type: GateEntryType;
  outing_id: number | null;
  recorded_at: string;
  recorded_by: string | null;
}

export interface GateLogListParams {
  student_id?: number;
  entry_type?: GateEntryType;
  hostel_id?: number;
  page?: number;
  page_size?: number;
}

export interface CreateGateLogInput {
  student_id: number;
  entry_type: GateEntryType;
  outing_id?: number;
}
