import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { venueBookingService } from "../services/venue-booking.service";
import { venueBookingKeys } from "../query-keys";
import type { BookingStatus, CreateVenueBookingInput } from "../types";

export function useVenueBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: venueBookingKeys.bookings.list(status),
    queryFn: () => venueBookingService.listBookings(status),
  });
}

export function useCreateVenueBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVenueBookingInput) => venueBookingService.createBooking(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueBookingKeys.bookings.all() });
      queryClient.invalidateQueries({ queryKey: ["secretary", "venue-booking", "venues"] });
    },
  });
}
