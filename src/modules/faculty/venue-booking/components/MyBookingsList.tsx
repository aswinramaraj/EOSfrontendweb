"use client";

import { useAlternativeVenueNames } from "../hooks/venue-booking.hooks";
import type { VenueBooking, VenueBookingStatus } from "../types/venue-booking.types";
import type { SectionStatus } from "../../dashboard/types/dashboard.types";
import { DashboardSectionState } from "../../dashboard/components/DashboardSectionState";

const STATUS_LABEL: Record<VenueBookingStatus, string> = {
  pending: "Pending IQAC Review",
  approved: "Approved",
  rejected: "Rejected",
  alternative_offered: "Alternative Venue Offered",
};

const STATUS_STYLE: Record<VenueBookingStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  alternative_offered: "bg-indigo-50 text-indigo-700",
};

function formatRange(fromIso: string, toIso: string): string {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
  const sameDay = from.toDateString() === to.toDateString();
  return sameDay
    ? `${dateFmt.format(from)} · ${timeFmt.format(from)} – ${timeFmt.format(to)}`
    : `${dateFmt.format(from)} ${timeFmt.format(from)} → ${dateFmt.format(to)} ${timeFmt.format(to)}`;
}

interface MyBookingsListProps {
  status: SectionStatus;
  bookings: VenueBooking[];
  error: string | null;
  retry: () => void;
}

/** Takes its data as props rather than calling useMyVenueBookings() itself —
 * the parent page owns the one hook instance so that submitting a new
 * booking (which calls that same instance's retry as its onCreated hook)
 * actually refreshes what's rendered here, instead of refreshing an
 * unrelated second copy of the same fetch. */
export function MyBookingsList({ status, bookings, error, retry }: MyBookingsListProps) {
  const alternativeVenueNames = useAlternativeVenueNames(bookings);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-bold text-slate-900">My Booking Requests</p>
      </div>

      <DashboardSectionState
        status={status}
        error={error}
        onRetry={retry}
        emptyMessage="You haven't requested any venue bookings yet."
        skeletonRows={3}
      >
        <ul className="flex flex-col gap-1 p-3">
          {bookings.map((booking) => (
            <li key={booking.id} className="flex items-center justify-between gap-4 rounded-lg px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{booking.venue.name}</p>
                <p className="truncate text-xs text-slate-500">{booking.purpose}</p>
                <p className="mt-0.5 text-xs text-slate-400">{formatRange(booking.fromDatetime, booking.toDatetime)}</p>
                {booking.status === "alternative_offered" && booking.alternativeVenueId !== null && (
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    IQAC reassigned you to: {alternativeVenueNames.get(booking.alternativeVenueId) ?? `Venue #${booking.alternativeVenueId}`}
                  </p>
                )}
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[booking.status]}`}>
                {STATUS_LABEL[booking.status]}
              </span>
            </li>
          ))}
        </ul>
      </DashboardSectionState>
    </div>
  );
}
