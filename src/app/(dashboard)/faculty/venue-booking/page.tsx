import type { Metadata } from "next";
import { VenueBookingPage } from "@/modules/faculty/venue-booking/components/VenueBookingPage";

export const metadata: Metadata = {
  title: "Venue Booking — EOS ERP Portal",
  description: "Reserve seminar halls, auditoriums and labs for academic events.",
};

export default function FacultyVenueBookingPage() {
  return <VenueBookingPage />;
}
