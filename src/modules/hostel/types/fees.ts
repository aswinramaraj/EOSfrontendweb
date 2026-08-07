export type HostelFeeStatus = "unpaid" | "partially_paid" | "paid";

export interface HostelFeeRow {
  student_id: number;
  name: string;
  student_id_no: string;
  hostel: { id: number; name: string; code: string } | null;
  room_number: string | null;
  sharing: string | null;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: HostelFeeStatus;
}

export interface HostelFeeListParams {
  hostel_id?: number;
  status?: HostelFeeStatus;
  page?: number;
  page_size?: number;
}
