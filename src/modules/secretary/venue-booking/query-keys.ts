const base = ["secretary", "venue-booking"] as const;

export const venueBookingKeys = {
  venues: (from: string, to: string, search?: string) =>
    [...base, "venues", from, to, search ?? ""] as const,
  bookings: {
    all: () => [...base, "bookings"] as const,
    list: (status?: string) => [...base, "bookings", "list", status ?? "all"] as const,
  },
};
