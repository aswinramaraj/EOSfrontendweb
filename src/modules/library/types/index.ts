export interface Paginated<T> {
  page: number;
  page_size: number;
  total: number;
  data: T[];
}

export interface DepartmentRef {
  id: number;
  name: string;
  code: string;
}

export interface DashboardSummary {
  total_books: number;
  available_books: number;
  total_ebooks: number;
  active_borrowings: number;
  overdue_books: number;
  lost_books: number;
  damaged_books: number;
}
