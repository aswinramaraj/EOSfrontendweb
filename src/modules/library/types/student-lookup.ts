export interface StudentSearchResult {
  id: number;
  student_id_no: string;
  roll_no: string | null;
  register_no: string | null;
  status: string;
  email: string;
  name: string;
  course: { id: number; name: string };
  department: { id: number; name: string; code: string };
  similarity: number;
}

export interface NoDuesOverdueBook {
  borrow_record_id: number;
  title: string;
  accession: string;
  due_date: string;
}

export interface NoDuesUnpaidFine {
  borrow_record_id: number;
  title: string;
  accession: string;
}

export interface NoDuesUnsettledCharge {
  borrow_record_id: number;
  title: string;
  accession: string;
  charge_amount: number | null;
}

export interface NoDuesCheck {
  student_id: number;
  has_outstanding_library_dues: boolean;
  overdue_books: NoDuesOverdueBook[];
  unpaid_fine_records: NoDuesUnpaidFine[];
  unsettled_lost_damaged_charges: NoDuesUnsettledCharge[];
}
