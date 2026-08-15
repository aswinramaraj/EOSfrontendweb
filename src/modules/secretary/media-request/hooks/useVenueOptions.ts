import { useQuery } from "@tanstack/react-query";
import { venueBookingService } from "@/modules/secretary/venue-booking/services/venue-booking.service";

// Media Request's venue dropdown just needs the real venue list (id/name/
// location) — it reuses Venue Booking's GET /venues call (the only venues
// endpoint that exists) with a wide date window since availability for a
// specific slot isn't relevant here, only which venues exist.
export function useVenueOptions() {
  const from = new Date();
  const to = new Date(from.getFullYear() + 5, from.getMonth(), from.getDate());

  return useQuery({
    queryKey: ["secretary", "media-request", "venue-options"],
    queryFn: () =>
      venueBookingService.listVenues({ from: from.toISOString(), to: to.toISOString() }),
  });
}
