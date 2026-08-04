import type { PaginatedResponse } from "../../dashboard/types/dashboard.types";

export type { PaginatedResponse };

export interface VenueAvailabilityBookingInfo {
  purpose: string;
  booked_by: string;
  accommodating_strength: number | null;
  from_datetime: string;
  to_datetime: string;
}

/** GET /api/v1/venues?from&to — a venue "is_available" only when it has no
 * *non-rejected* booking overlapping [from, to) — double-booking is allowed
 * at the API level by design (IQAC resolves conflicts), so this is purely
 * informational, never something that blocks a new request client-side. */
export interface VenueAvailability {
  id: number;
  name: string;
  location: string | null;
  capacity: number | null;
  is_available: boolean;
  booking: VenueAvailabilityBookingInfo | null;
}

export type VenueBookingStatus = "pending" | "approved" | "rejected" | "alternative_offered";

export interface VenueBookingVenueRef {
  id: number;
  name: string;
  location: string | null;
  capacity: number | null;
}

/** Raw GET/POST /api/v1/venue-bookings(/:id) response shape — field names
 * are Prisma's disambiguated relation names verbatim; see toVenueBooking in
 * venue-booking.hooks.ts for the camelCased view-model. */
export interface VenueBookingRaw {
  id: number;
  venue_id: number;
  purpose: string;
  from_datetime: string;
  to_datetime: string;
  accommodating_strength: number | null;
  status: VenueBookingStatus;
  reviewed_by_user_id: number | null;
  alternative_venue_id: number | null;
  created_at: string;
  venues_venue_bookings_venue_idTovenues: VenueBookingVenueRef;
  users_venue_bookings_booked_by_user_idTousers: { id: number; email: string };
}

/** Camel-cased view-model derived from VenueBookingRaw. */
export interface VenueBooking {
  id: number;
  purpose: string;
  fromDatetime: string;
  toDatetime: string;
  accommodatingStrength: number | null;
  status: VenueBookingStatus;
  createdAt: string;
  venue: VenueBookingVenueRef;
  /** Populated only once IQAC's decision is `alternative_offered` — the
   * venue they reassigned instead of the one originally requested. */
  alternativeVenueId: number | null;
}

export interface CreateVenueBookingPayload {
  venueId: number;
  purpose: string;
  fromDatetime: string;
  toDatetime: string;
  accommodatingStrength?: number;
}
