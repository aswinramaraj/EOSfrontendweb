export type BookingStatus = "pending" | "approved" | "rejected" | "alternative_offered";

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

export interface VenueBooking {
  id: number;
  venue_id: number;
  venue_name: string;
  purpose: string;
  from_datetime: string;
  to_datetime: string;
  accommodating_strength: number | null;
  status: BookingStatus;
  created_at: string;
}

export interface CreateVenueBookingInput {
  venue_id: number;
  purpose: string;
  from_datetime: string;
  to_datetime: string;
  accommodating_strength?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
