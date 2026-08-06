import { useQuery } from "@tanstack/react-query";
import { venuesService, type VenueListParams } from "../services/venues.service";

export function useVenues(params: VenueListParams) {
  return useQuery({
    queryKey: ["venues", "list", params],
    queryFn: () => venuesService.list(params),
    staleTime: 30_000,
  });
}

/** A wide, effectively-unbounded window — good enough for a plain venue picker that doesn't need the availability flag to be exact. */
export function useAllVenues() {
  return useVenues({ from: "2020-01-01T00:00:00.000Z", to: "2035-01-01T00:00:00.000Z", limit: 200 });
}
