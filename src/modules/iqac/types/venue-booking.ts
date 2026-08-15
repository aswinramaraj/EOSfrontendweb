export type VenueBookingStatus = "pending" | "approved" | "rejected" | "alternative_offered";

export interface VenueRef {
  id: number;
  name: string;
  location: string | null;
  capacity: number | null;
}

export interface BookedBy {
  name: string;
  department_name: string | null;
  email: string;
  phone: string | null;
}

export interface VenueBooking {
  id: number;
  venue_id: number;
  venue: VenueRef;
  purpose: string;
  description: string | null;
  requirements: string[];
  from_datetime: string;
  to_datetime: string;
  accommodating_strength: number | null;
  status: VenueBookingStatus;
  admin_remarks: string | null;
  reviewed_at: string | null;
  alternative_venue: VenueRef | null;
  booked_by: BookedBy;
  created_at: string;
}

export interface VenueBookingListParams {
  status?: VenueBookingStatus;
  search?: string;
  department_id?: number;
  date?: string;
  page?: number;
  limit?: number;
}

export interface ReviewDecisionInput {
  decision: "approved" | "rejected" | "alternative_offered";
  alternative_venue_id?: number;
  admin_remarks?: string;
}

export interface ReallocateInput {
  venue_id: number;
  admin_remarks?: string;
}

export interface VenueAvailability {
  id: number;
  name: string;
  location: string | null;
  capacity: number | null;
  is_available: boolean;
  booking: {
    purpose: string;
    booked_by: string;
    accommodating_strength: number | null;
    from_datetime: string;
    to_datetime: string;
  } | null;
}

export interface DashboardSummary {
  today_bookings: number;
  pending_requests: number;
  available_venues: number;
  total_venues: number;
}

export interface TodaySchedule {
  id: number;
  venue_name: string;
  purpose: string;
  from_datetime: string;
  to_datetime: string;
  accommodating_strength: number | null;
  state: "completed" | "in_progress" | "scheduled";
}

export interface LiveVenueStatus {
  id: number;
  name: string;
  state: "in_use" | "free";
  note: string;
}

export interface DashboardLiveStatus {
  schedule: TodaySchedule[];
  venue_status: LiveVenueStatus[];
}
