import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types/common";
import type {
  ReallocateInput,
  ReviewDecisionInput,
  VenueAvailability,
  VenueBooking,
  VenueBookingListParams,
} from "../types/venue-booking";

export const venueBookingsService = {
  list(params: VenueBookingListParams = {}): Promise<Paginated<VenueBooking>> {
    return apiClient.get<Paginated<VenueBooking>>(
      `/venue-bookings${buildQuery(params)}`,
      requireToken(),
    );
  },
  get(id: number): Promise<VenueBooking> {
    return apiClient.get<VenueBooking>(`/venue-bookings/${id}`, requireToken());
  },
  review(id: number, input: ReviewDecisionInput): Promise<VenueBooking> {
    return apiClient.patch<VenueBooking>(`/venue-bookings/${id}`, input, requireToken());
  },
  reallocate(id: number, input: ReallocateInput): Promise<VenueBooking> {
    return apiClient.patch<VenueBooking>(
      `/venue-bookings/${id}/reallocate`,
      input,
      requireToken(),
    );
  },
  /** Availability for the reallocate drawer — the booking's own from/to window. */
  availableVenues(from: string, to: string): Promise<Paginated<VenueAvailability>> {
    return apiClient.get<Paginated<VenueAvailability>>(
      `/venues${buildQuery({ from, to, limit: 100 })}`,
      requireToken(),
    );
  },
};
