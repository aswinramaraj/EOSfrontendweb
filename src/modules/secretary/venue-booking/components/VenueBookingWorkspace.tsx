"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { HistoryIcon, LockIcon, PeopleIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useVenues } from "../hooks/useVenues";
import { useVenueBookings } from "../hooks/useVenueBookings";
import { DateRangeCalendar } from "./DateRangeCalendar";
import { BookingFormModal } from "./BookingFormModal";
import type { BookingStatus, VenueBooking } from "../types";

const BOOKING_BADGE: Record<BookingStatus, { bg: string; fg: string; strike?: boolean }> = {
  approved: { bg: "#2563EB", fg: "#FFFFFF" },
  alternative_offered: { bg: "#EFF6FF", fg: "#1D4ED8" },
  pending: { bg: "#BFDBFE", fg: "#1D4ED8" },
  rejected: { bg: "#F1F5F9", fg: "#94A3B8", strike: true },
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
}

function formatDay(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function VenueBookingWorkspace() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [range, setRange] = useState<{ from: Date; to: Date | null }>({
    from: startOfDay(new Date()),
    to: null,
  });
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialVenueId, setInitialVenueId] = useState<number | null>(null);

  function handlePick(day: Date) {
    setRange((prev) => {
      if (!prev.to && day.getTime() >= prev.from.getTime()) {
        return { from: prev.from, to: day.getTime() === prev.from.getTime() ? null : day };
      }
      return { from: day, to: null };
    });
  }

  const fromIso = useMemo(() => startOfDay(range.from).toISOString(), [range.from]);
  const toIso = useMemo(() => endOfDay(range.to ?? range.from).toISOString(), [range.from, range.to]);

  const { data: venuesResult, isLoading: venuesLoading, error: venuesError } = useVenues(
    fromIso,
    toIso,
    debouncedSearch || undefined,
  );
  const { data: bookingsResult, isLoading: bookingsLoading, error: bookingsError } = useVenueBookings();

  const venues = venuesResult?.data ?? [];
  const bookings: VenueBooking[] = bookingsResult?.data ?? [];

  return (
    <div>
      <div className="mb-[22px] flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="text-[26px] font-semibold tracking-[-0.025em] text-slate-900">Venue Booking</div>
          <div className="text-sm text-slate-600">
            Reserve seminar halls, auditoriums and labs for academic events.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-70">
            <SearchInput
              placeholder="Search venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-[7px] rounded-xl border border-[#E3E8EF] bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <HistoryIcon className="h-4 w-4" /> History
          </button>
          <Button
            variant="primary"
            className="rounded-xl px-5 py-[11px] text-[15px]"
            onClick={() => {
              setInitialVenueId(null);
              setBookingOpen(true);
            }}
          >
            Request Venue
          </Button>
        </div>
      </div>

      <div className="mb-[26px] grid grid-cols-1 items-start gap-[26px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="rounded-2xl border border-[#E3E8EF] bg-white p-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-[19px] font-semibold text-slate-900">Select Date Range</p>
          <p className="mb-4 text-[13.5px] text-slate-500">Click a start date then an end date</p>
          <DateRangeCalendar from={range.from} to={range.to} onPick={handlePick} />
          <div className="mt-4 grid grid-cols-[60px_minmax(0,1fr)] gap-x-3.5 gap-y-1.5 rounded-xl bg-blue-50 px-[18px] py-3.5">
            <span className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-600">From</span>
            <span className="text-[15.5px] font-semibold text-blue-700">
              {range.from.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <span className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-600">To</span>
            <span className={`text-[15px] font-semibold ${range.to ? "text-blue-700" : "italic text-slate-500"}`}>
              {range.to
                ? range.to.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "Not selected"}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-[19px] font-semibold text-slate-900">Available Venues</p>
          {venuesError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {venuesError instanceof ApiError ? venuesError.message : "Failed to load venues."}
            </p>
          )}
          {venuesLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-[14px] border border-[#E3E8EF] bg-slate-50" />
              ))}
            </div>
          )}
          {!venuesLoading && !venuesError && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {venues.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => {
                    setInitialVenueId(venue.id);
                    setBookingOpen(true);
                  }}
                  className="rounded-[14px] border border-[#E3E8EF] bg-white p-[18px] text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-blue-300"
                >
                  <div className="mb-[3px] flex items-start justify-between gap-2.5">
                    <span className="text-base font-semibold text-slate-900">{venue.name}</span>
                    {!venue.is_available && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-[9px] py-[3px] text-[11.5px] font-semibold uppercase tracking-wide text-blue-700">
                        <LockIcon className="h-3 w-3" /> Booked
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-slate-500">{venue.location ?? "—"}</p>
                  <div className="flex items-center gap-[7px] text-sm font-medium text-blue-600">
                    <PeopleIcon className="h-[15px] w-[15px]" />
                    {venue.capacity ?? "—"} capacity
                  </div>
                </button>
              ))}
              {venues.length === 0 && (
                <p className="text-sm text-slate-500">No venues match your search.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mb-3 text-[19px] font-semibold text-slate-900">Booking History</p>
      <div className="overflow-x-auto rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="grid min-w-[900px] grid-cols-[100px_minmax(130px,1fr)_minmax(150px,1.2fr)_110px_160px_100px] gap-3 bg-slate-50 px-5 py-[13px] text-[11.5px] font-semibold uppercase tracking-wide text-slate-600">
          <span>Booking ID</span>
          <span>Venue</span>
          <span>Purpose</span>
          <span>Date</span>
          <span>Time</span>
          <span>Status</span>
        </div>
        {bookingsLoading && (
          <div className="p-6 text-center text-sm text-slate-500">Loading…</div>
        )}
        {bookingsError && (
          <div className="p-6 text-center text-sm text-red-600">
            {bookingsError instanceof ApiError ? bookingsError.message : "Failed to load booking history."}
          </div>
        )}
        {!bookingsLoading && !bookingsError && bookings.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-500">No bookings yet.</div>
        )}
        {!bookingsLoading &&
          !bookingsError &&
          bookings.map((b) => {
            const badge = BOOKING_BADGE[b.status];
            return (
              <div
                key={b.id}
                className="grid min-w-[900px] grid-cols-[100px_minmax(130px,1fr)_minmax(150px,1.2fr)_110px_160px_100px] items-center gap-3 border-b border-slate-100 px-5 py-[15px] text-[14.5px] last:border-b-0"
              >
                <span className="font-mono text-[12.5px] text-slate-500">VB-{b.id}</span>
                <span className="font-semibold text-slate-900">{b.venue_name}</span>
                <span className="text-slate-600">{b.purpose}</span>
                <span className="text-slate-900">{formatDay(b.from_datetime)}</span>
                <span className="text-slate-600">
                  {formatTime(b.from_datetime)} – {formatTime(b.to_datetime)}
                </span>
                <span>
                  <span
                    className={`inline-block rounded-full px-[13px] py-1 text-[12.5px] font-semibold ${badge.strike ? "line-through" : ""}`}
                    style={{ background: badge.bg, color: badge.fg }}
                  >
                    {b.status.replace("_", " ")}
                  </span>
                </span>
              </div>
            );
          })}
      </div>

      <BookingFormModal
        open={bookingOpen}
        venues={venues}
        initialVenueId={initialVenueId}
        from={range.from}
        to={range.to}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}
