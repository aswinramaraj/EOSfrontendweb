export interface VenueBookingSummary {
  purpose: string;
  booked_by: string;
  accommodating_strength: number;
  from_datetime: string;
  to_datetime: string;
}

export interface VenueAvailability {
  id: number;
  name: string;
  location: string | null;
  capacity: number | null;
  is_available: boolean;
  booking: VenueBookingSummary | null;
}
