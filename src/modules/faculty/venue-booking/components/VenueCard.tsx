import type { VenueAvailability } from "../types/venue-booking.types";

interface VenueCardProps {
  venue: VenueAvailability;
  onClick: () => void;
}

export function VenueCard({ venue, onClick }: VenueCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
    >
      {!venue.is_available && (
        <span className="absolute top-3 right-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          Booked
        </span>
      )}

      <p className="pr-16 text-base font-bold text-slate-900">{venue.name}</p>
      {venue.location && <p className="text-sm text-slate-500">{venue.location}</p>}
      {venue.capacity !== null && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M16 8a3 3 0 1 0 0-6M18.5 14a5.5 5.5 0 0 1 3.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {venue.capacity} capacity
        </p>
      )}

      {!venue.is_available && venue.booking && (
        <p className="mt-2 truncate text-xs text-slate-400">Booked by {venue.booking.booked_by} for &quot;{venue.booking.purpose}&quot;</p>
      )}
    </button>
  );
}
