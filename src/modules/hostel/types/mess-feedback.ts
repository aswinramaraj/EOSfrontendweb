export interface MessFeedback {
  id: number;
  student_id: number;
  hostel_id: number | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface MessFeedbackListParams {
  hostel_id?: number;
  page?: number;
  page_size?: number;
}

export interface CreateMessFeedbackInput {
  student_id: number;
  hostel_id?: number;
  rating: number;
  comment?: string;
}

export interface MessFeedbackList {
  page: number;
  page_size: number;
  total: number;
  average_rating: number | null;
  data: MessFeedback[];
}
