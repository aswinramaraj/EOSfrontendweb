export type ComplaintCategory =
  | "plumbing"
  | "electrical"
  | "carpentry"
  | "network"
  | "mess"
  | "facilities"
  | "other";

export type ComplaintPriority = "low" | "medium" | "high";
export type ComplaintStatus = "open" | "in_progress" | "resolved" | "escalated";

export interface Complaint {
  id: number;
  student: { id: number; name: string; student_id_no: string };
  room_number: string | null;
  hostel: { id: number; name: string; code: string } | null;
  category: ComplaintCategory;
  title: string;
  description: string | null;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_to: string | null;
  resolution_note: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface ComplaintListParams {
  status?: ComplaintStatus;
  category?: ComplaintCategory;
  hostel_id?: number;
  page?: number;
  page_size?: number;
}

export interface CreateComplaintInput {
  student_id: number;
  hostel_id?: number;
  category: ComplaintCategory;
  title: string;
  description?: string;
  priority?: ComplaintPriority;
}

export interface UpdateComplaintInput {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  assigned_to?: string;
  resolution_note?: string;
}
