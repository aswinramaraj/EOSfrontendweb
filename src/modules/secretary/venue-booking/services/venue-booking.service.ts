import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  BookingStatus,
  CreateVenueBookingInput,
  PaginatedResult,
  VenueAvailability,
  VenueBooking,
} from "../types";

// Raw backend shapes — see VenuesService (EOSbackend1) for the exact select.
interface RawVenueBooking {
  id: number;
  venue_id: number;
  purpose: string;
  from_datetime: string;
  to_datetime: string;
  accommodating_strength: number | null;
  status: BookingStatus;
  created_at: string;
  venues_venue_bookings_venue_idTovenues: { id: number; name: string } | null;
}

function toVenueBooking(row: RawVenueBooking): VenueBooking {
  return {
    id: row.id,
    venue_id: row.venue_id,
    venue_name: row.venues_venue_bookings_venue_idTovenues?.name ?? "—",
    purpose: row.purpose,
    from_datetime: row.from_datetime,
    to_datetime: row.to_datetime,
    accommodating_strength: row.accommodating_strength,
    status: row.status,
    created_at: row.created_at,
  };
}

export const venueBookingService = {
  listVenues(params: {
    from: string;
    to: string;
    search?: string;
  }): Promise<PaginatedResult<VenueAvailability>> {
    return apiClient.get<PaginatedResult<VenueAvailability>>(
      `/venues${buildQuery({ ...params, limit: 100 })}`,
      requireToken(),
    );
  },

  async listBookings(status?: BookingStatus): Promise<PaginatedResult<VenueBooking>> {
    const raw = await apiClient.get<PaginatedResult<RawVenueBooking>>(
      `/venue-bookings${buildQuery({ status, limit: 100 })}`,
      requireToken(),
    );
    return { ...raw, data: raw.data.map(toVenueBooking) };
  },

  async createBooking(input: CreateVenueBookingInput): Promise<VenueBooking> {
    const raw = await apiClient.post<RawVenueBooking>(
      "/venue-bookings",
      input,
      requireToken(),
    );
    return toVenueBooking(raw);
  },
};
