export interface Paginated<T> {
  page: number;
  page_size: number;
  total: number;
  data: T[];
}

export interface DashboardSummary {
  total_residents: number;
  currently_present: number;
  on_leave: number;
  pending_approvals: number;
  beds_total: number;
  beds_occupied: number;
  beds_vacant: number;
  occupancy_pct: number;
  complaints_open: number;
}
