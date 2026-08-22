import { useQuery } from "@tanstack/react-query";
import { venueBookingService } from "../services/venue-booking.service";
import { venueBookingKeys } from "../query-keys";

export function useVenues(from: string, to: string, search?: string) {
  return useQuery({
    queryKey: venueBookingKeys.venues(from, to, search),
    queryFn: () => venueBookingService.listVenues({ from, to, search }),
    enabled: Boolean(from && to),
  });
}
