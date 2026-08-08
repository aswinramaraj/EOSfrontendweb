export interface FacultyStatusEntry {
  id: number;
  name: string;
  department: string;
  designation: string;
}

export interface SecretaryDashboardSummary {
  date: string;
  pending_requests: {
    product_requests: number;
    service_requests: number;
    venue_bookings: number;
    media_requests: number;
    total: number;
  };
  attendance_today: {
    scheduled_sessions: number;
    marked_sessions: number;
    completion_percentage: number | null;
  };
  students_today: {
    absent: number;
    on_duty: number;
  };
  faculty_today: {
    on_leave: number;
    on_duty: number;
    on_leave_list: FacultyStatusEntry[];
    on_duty_list: FacultyStatusEntry[];
  };
}
