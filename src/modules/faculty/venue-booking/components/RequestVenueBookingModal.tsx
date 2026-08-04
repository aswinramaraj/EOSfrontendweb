"use client";

import { useState } from "react";
import type { DateRange } from "./DateRangeCalendar";
import type { CreateVenueBookingPayload, VenueAvailability } from "../types/venue-booking.types";

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

interface RequestVenueBookingModalProps {
  venues: VenueAvailability[];
  dateRange: DateRange;
  initialVenueId: number | null;
  onSubmit: (payload: CreateVenueBookingPayload) => Promise<boolean>;
  isSubmitting: boolean;
  /** The real error message from the last submit attempt (API validation,
   * 403, etc.) — takes priority over this form's own client-side checks. */
  submitError: string | null;
  onClose: () => void;
}

export function RequestVenueBookingModal({
  venues,
  dateRange,
  initialVenueId,
  onSubmit,
  isSubmitting,
  submitError,
  onClose,
}: RequestVenueBookingModalProps) {
  const [venueId, setVenueId] = useState<number | null>(initialVenueId ?? venues[0]?.id ?? null);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("13:00");
  const [capacity, setCapacity] = useState("");
  const [purpose, setPurpose] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedVenue = venues.find((v) => v.id === venueId) ?? null;
  const error = validationError ?? submitError;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!dateRange.start || !dateRange.end) {
      setValidationError("Select a start and end date first.");
      return;
    }
    if (!venueId) {
      setValidationError("Select a venue.");
      return;
    }
    if (!purpose.trim()) {
      setValidationError("Purpose is required.");
      return;
    }

    const fromDatetime = combineDateAndTime(dateRange.start, startTime);
    const toDatetime = combineDateAndTime(dateRange.end, endTime);

    if (fromDatetime <= new Date()) {
      setValidationError("The start date/time must be in the future.");
      return;
    }
    if (fromDatetime >= toDatetime) {
      setValidationError("The start time must be before the end time.");
      return;
    }

    const capacityNum = Number(capacity);
    const accommodatingStrength = capacity.trim() !== "" && Number.isFinite(capacityNum) && capacityNum > 0 ? capacityNum : undefined;

    const ok = await onSubmit({
      venueId,
      purpose: purpose.trim(),
      fromDatetime: fromDatetime.toISOString(),
      toDatetime: toDatetime.toISOString(),
      accommodatingStrength,
    });
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Request Venue Booking</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Venue</span>
            <select
              value={venueId ?? ""}
              onChange={(e) => setVenueId(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} {venue.capacity ? `· ${venue.capacity} seats` : ""}
                </option>
              ))}
            </select>
            {selectedVenue && !selectedVenue.is_available && (
              <p className="mt-1.5 text-xs text-amber-600">
                Already booked by {selectedVenue.booking?.booked_by} for part of this window — you can still submit; IQAC will
                review and may reassign a venue.
              </p>
            )}
          </label>

          <div>
            <span className="text-sm font-medium text-slate-700">Selected Date Range</span>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
              {dateRange.start && formatDisplayDate(dateRange.start)}
              <span>→</span>
              {dateRange.end && formatDisplayDate(dateRange.end)}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Required Capacity</span>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 120"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-slate-700">Time Slot</span>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
              <span className="text-slate-400">–</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Purpose</span>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              maxLength={255}
              placeholder="Guest lecture, seminar, lab exam..."
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? "Submitting…" : "Submit Booking Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
