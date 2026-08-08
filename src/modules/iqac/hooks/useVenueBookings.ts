import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { venueBookingsService } from "../services/venue-bookings.service";
import { iqacKeys } from "../query-keys";
import type { ReallocateInput, ReviewDecisionInput, VenueBookingListParams } from "../types/venue-booking";

function useInvalidateVenueBookings() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: iqacKeys.venueBookings.all() });
    queryClient.invalidateQueries({ queryKey: iqacKeys.dashboardSummary() });
    queryClient.invalidateQueries({ queryKey: iqacKeys.dashboardLiveStatus() });
  };
}

export function useVenueBookings(params: VenueBookingListParams) {
  return useQuery({
    queryKey: iqacKeys.venueBookings.list(params),
    queryFn: () => venueBookingsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useVenueBooking(id: number | null) {
  return useQuery({
    queryKey: iqacKeys.venueBookings.detail(id ?? 0),
    queryFn: () => venueBookingsService.get(id as number),
    enabled: id !== null,
  });
}

export function useReviewVenueBooking() {
  const invalidate = useInvalidateVenueBookings();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ReviewDecisionInput }) =>
      venueBookingsService.review(id, input),
    onSuccess: invalidate,
  });
}

export function useReallocateVenueBooking() {
  const invalidate = useInvalidateVenueBookings();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ReallocateInput }) =>
      venueBookingsService.reallocate(id, input),
    onSuccess: invalidate,
  });
}

export function useAvailableVenues(from: string | null, to: string | null) {
  return useQuery({
    queryKey: iqacKeys.venues.list({ from, to }),
    queryFn: () => venueBookingsService.availableVenues(from as string, to as string),
    enabled: from !== null && to !== null,
  });
}
