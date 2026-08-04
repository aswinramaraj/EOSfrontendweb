import { apiClient } from "@/shared/lib/api-client";
import type {
  CreateVenueBookingPayload,
  PaginatedResponse,
  VenueAvailability,
  VenueBookingRaw,
  VenueBookingVenueRef,
} from "../types/venue-booking.types";

export const venuesService = {
  /** `from`/`to` are required ISO datetimes — the whole point of this
   * endpoint is checking availability for a specific window. */
  listAvailability(fromIso: string, toIso: string, token: string) {
    return apiClient.get<PaginatedResponse<VenueAvailability>>(
      `/venues?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}&limit=100`,
      token,
    );
  },

  /** No date filter — static venue details, any authenticated user. Used to
   * resolve an IQAC-reassigned `alternative_venue_id` to a display name. */
  getById(id: number, token: string) {
    return apiClient.get<VenueBookingVenueRef>(`/venues/${id}`, token);
  },
};

export const venueBookingsService = {
  create(payload: CreateVenueBookingPayload, token: string) {
    return apiClient.post<VenueBookingRaw>(
      "/venue-bookings",
      {
        venue_id: payload.venueId,
        purpose: payload.purpose,
        from_datetime: payload.fromDatetime,
        to_datetime: payload.toDatetime,
        ...(payload.accommodatingStrength && { accommodating_strength: payload.accommodatingStrength }),
      },
      token,
    );
  },

  /** Auto-scoped to the caller's own bookings server-side (IQAC is the only
   * role that sees every booking here). */
  listMine(token: string) {
    return apiClient.get<PaginatedResponse<VenueBookingRaw>>("/venue-bookings?limit=100", token);
  },
};
