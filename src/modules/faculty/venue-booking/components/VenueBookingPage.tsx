"use client";

import { useState } from "react";
import { useCreateVenueBooking, useMyVenueBookings, useVenueAvailability } from "../hooks/venue-booking.hooks";
import type { VenueAvailability } from "../types/venue-booking.types";
import { DashboardSectionState } from "../../dashboard/components/DashboardSectionState";
import { DateRangeCalendar, type DateRange } from "./DateRangeCalendar";
import { MyBookingsList } from "./MyBookingsList";
import { RequestVenueBookingModal } from "./RequestVenueBookingModal";
import { VenueCard } from "./VenueCard";

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function VenueBookingPage() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [search, setSearch] = useState("");
  const [requestModalVenueId, setRequestModalVenueId] = useState<number | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fromIso = dateRange.start ? dateRange.start.toISOString() : null;
  const toIso = dateRange.end ? endOfDay(dateRange.end).toISOString() : null;
  const { status, venues, error, retry } = useVenueAvailability(fromIso, toIso);
  const myBookings = useMyVenueBookings();
  const { submit, isSubmitting, error: submitError, clearError } = useCreateVenueBooking(myBookings.retry);

  const filteredVenues = venues.filter((venue) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return venue.name.toLowerCase().includes(query) || (venue.location ?? "").toLowerCase().includes(query);
  });

  const hasFullRange = Boolean(dateRange.start && dateRange.end);

  function openRequestModal(venue: VenueAvailability | null) {
    if (!hasFullRange) return;
    clearError();
    setRequestModalVenueId(venue?.id ?? null);
    setIsRequestModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Venue Booking</h1>
          <p className="mt-1 text-sm text-slate-500">Reserve seminar halls, auditoriums and labs for academic events.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative">
            <span className="sr-only">Search venues</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search venues..."
              className="w-56 rounded-full border border-slate-200 bg-white py-2 pl-4 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <button
            type="button"
            disabled={!hasFullRange}
            title={hasFullRange ? undefined : "Select a date range first"}
            onClick={() => openRequestModal(null)}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-200"
          >
            Request Venue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-900">Select Date Range</p>
          <p className="mb-4 text-xs text-slate-500">Click a start date then an end date.</p>
          <DateRangeCalendar value={dateRange} onChange={setDateRange} />
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-slate-900">Available Venues</p>

          {!hasFullRange ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              Select a date range to check venue availability.
            </div>
          ) : (
            <DashboardSectionState
              status={status}
              error={error}
              onRetry={retry}
              emptyMessage="No venues are configured yet."
              skeletonRows={3}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} onClick={() => openRequestModal(venue)} />
                ))}
              </div>
            </DashboardSectionState>
          )}

          {hasFullRange && dateRange.start && dateRange.end && (
            <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm">
              <span className="font-semibold text-indigo-700">
                {formatDisplayDate(dateRange.start)} → {formatDisplayDate(dateRange.end)}
              </span>
              <span className="text-indigo-400">selected — click a venue to book</span>
            </div>
          )}
        </div>
      </div>

      <MyBookingsList status={myBookings.status} bookings={myBookings.bookings} error={myBookings.error} retry={myBookings.retry} />

      {isRequestModalOpen && (
        <RequestVenueBookingModal
          venues={venues}
          dateRange={dateRange}
          initialVenueId={requestModalVenueId}
          onSubmit={submit}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onClose={() => setIsRequestModalOpen(false)}
        />
      )}
    </div>
  );
}
