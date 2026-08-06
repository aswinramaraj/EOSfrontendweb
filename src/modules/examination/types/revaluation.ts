export type RevaluationStatus =
  | "requested"
  | "under_review"
  | "revised"
  | "no_change"
  | "approved"
  | "rejected";

// GET /revaluation-requests returns every request with deep relations
// (exam_marks.exam_subject_mapping.{exams,subjects}, students) — only the
// fields this module actually reads are modeled here; extend as later
// phases need more of the relation tree.
export interface RevaluationRequest {
  id: number;
  exam_id: number | null;
  subject_id: number | null;
  student_id: number;
  status: RevaluationStatus;
  revised_marks: number | null;
  requested_at: string;
  resolved_at: string | null;
  remarks: string | null;
  evaluator_faculty_id: number | null;
  fee_amount: number | null;
  fee_paid: boolean;
}

export interface UpdateRevaluationInput {
  status: "under_review" | "revised" | "no_change" | "approved" | "rejected";
  revised_marks?: number;
  remarks?: string;
  evaluator_faculty_id?: number;
}
