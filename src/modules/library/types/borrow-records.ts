export type BorrowerType = "student" | "faculty";

// The DB only ever stores these four — "overdue" (used below in list
// filters) is a derived query-side convenience, never a persisted or
// returned status.
export type BorrowStatus = "borrowed" | "returned" | "lost" | "damaged";
export type BorrowStatusFilter = BorrowStatus | "overdue";

export interface BorrowRecordBookRef {
  id: number;
  title: string;
  qr_code: string;
}

export interface BorrowRecordStudentRef {
  id: number;
  student_id_no: string;
  name: string;
}

export interface BorrowRecordFacultyRef {
  id: number;
  name: string;
}

export interface BorrowRecord {
  id: number;
  book: BorrowRecordBookRef;
  borrower_type: BorrowerType;
  student: BorrowRecordStudentRef | null;
  faculty: BorrowRecordFacultyRef | null;
  borrowed_date: string;
  due_date: string;
  returned_date: string | null;
  status: BorrowStatus;
  renewal_count: number;
  last_renewed_at: string | null;
  is_overdue: boolean;
  days_overdue: number;
  returned_late: boolean;
  days_late: number;
  fine_amount: number;
  fine_paid: boolean;
  fine_paid_amount: number | null;
  fine_paid_at: string | null;
  is_lost: boolean;
  is_damaged: boolean;
  damage_lost_charge_amount: number | null;
  damage_lost_declared_at: string | null;
  damage_lost_settled: boolean;
  damage_lost_settled_at: string | null;
}

export interface BorrowRecordListParams {
  borrower_type?: BorrowerType;
  student_id?: number;
  faculty_id?: number;
  book_id?: number;
  status?: BorrowStatusFilter;
  overdue?: boolean;
  fine_paid?: boolean;
  damage_lost_settled?: boolean;
  page?: number;
  page_size?: number;
}

export interface CreateBorrowRecordInput {
  book_id: number;
  borrower_type: BorrowerType;
  student_id?: number;
  faculty_id?: number;
  due_date: string;
}

export type BorrowRecordAction = "return" | "renew" | "damaged" | "lost";

export interface UpdateBorrowRecordInput {
  action: BorrowRecordAction;
  return_date?: string;
  new_due_date?: string;
}
