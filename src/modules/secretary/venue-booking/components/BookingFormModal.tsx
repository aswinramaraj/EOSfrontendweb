"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { CalendarIcon, XIcon } from "@/shared/components/icons";
import { numberFieldOptions } from "@/shared/lib/rhf-helpers";
import { useCreateVenueBooking } from "../hooks/useVenueBookings";
import { bookingFormSchema, type BookingFormValues } from "../schemas/booking-form.schema";
import type { VenueAvailability } from "../types";

interface BookingFormModalProps {
  open: boolean;
  venues: VenueAvailability[];
  initialVenueId: number | null;
  from: Date | null;
  to: Date | null;
  onClose: () => void;
}

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// `d.toISOString().slice(0, 10)` converts to UTC first, which silently
// shifts the calendar date back a day for any timezone ahead of UTC (e.g.
// IST, UTC+5:30) whenever local midnight falls on the previous UTC day.
// Combining that UTC-shifted date with a local wall-clock time (from the
// <input type="time">) then produces a datetime for the wrong day entirely.
// Reading the date fields directly off the local Date keeps both halves in
// the same (local) frame before they're combined.
function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const inputClass =
  "w-full rounded-xl border border-[#E3E8EF] bg-white px-3.5 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none";
const errorInputClass = "border-red-300 focus:border-red-500";

export function BookingFormModal({
  open,
  venues,
  initialVenueId,
  from,
  to,
  onClose,
}: BookingFormModalProps) {
  const { show } = useToast();
  const createBooking = useCreateVenueBooking();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { venue_id: initialVenueId ?? undefined, from_time: "", to_time: "", purpose: "" },
  });

  useEffect(() => {
    reset({ venue_id: initialVenueId ?? undefined, from_time: "", to_time: "", purpose: "" });
  }, [initialVenueId, open, reset]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const watchedVenueId = useWatch({ control, name: "venue_id" });
  const selectedVenue = venues.find((v) => v.id === watchedVenueId);

  function onSubmit(values: BookingFormValues) {
    if (!from) return;
    const venue = venues.find((v) => v.id === values.venue_id);

    if (
      venue?.capacity &&
      values.accommodating_strength &&
      values.accommodating_strength > venue.capacity
    ) {
      setError("accommodating_strength", {
        message: `Selected venue can accommodate only ${venue.capacity} members.`,
      });
      return;
    }

    const endDay = to ?? from;
    const fromDatetime = `${toLocalDateString(from)}T${values.from_time}:00`;
    const toDatetime = `${toLocalDateString(endDay)}T${values.to_time}:00`;

    createBooking.mutate(
      {
        venue_id: values.venue_id!,
        purpose: values.purpose,
        from_datetime: new Date(fromDatetime).toISOString(),
        to_datetime: new Date(toDatetime).toISOString(),
        accommodating_strength: values.accommodating_strength,
      },
      {
        onSuccess: () => {
          show(`Booking request submitted for ${venue?.name ?? "the venue"}.`, "success");
          onClose();
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  if (!open || !from) return null;

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-[#0F172A]/45 p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-[440px] overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
        <div className="mb-[18px] flex items-start justify-between gap-3">
          <div className="text-[19px] font-semibold text-slate-900">Request Venue Booking</div>
          <button
            onClick={onClose}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <XIcon className="h-[17px] w-[17px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <p className="mb-[7px] text-[14.5px] font-semibold text-slate-900">Venue</p>
            <select
              className={`${inputClass} cursor-pointer border-blue-600 ${errors.venue_id ? errorInputClass : ""}`}
              {...register("venue_id", numberFieldOptions)}
            >
              <option value="">Select a venue</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.capacity ? ` · ${v.capacity} seats` : ""}
                </option>
              ))}
            </select>
            {errors.venue_id && <p className="mt-1 text-xs text-red-600">{errors.venue_id.message}</p>}
          </div>

          <div>
            <p className="mb-[7px] text-[14.5px] font-semibold text-slate-900">Selected Date Range</p>
            <div className="flex items-center gap-2.5 rounded-xl bg-blue-50 px-3.5 py-[13px]">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="text-[15px] font-semibold text-blue-700">{formatDay(from)}</span>
              <span className="text-slate-400">→</span>
              <span className="text-[15px] font-semibold text-blue-700">
                {to ? formatDay(to) : "Same day"}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-[7px] text-[14.5px] font-semibold text-slate-900">Required Capacity</p>
            <input
              type="number"
              min={1}
              placeholder="e.g. 120"
              className={`${inputClass} ${errors.accommodating_strength ? errorInputClass : ""}`}
              {...register("accommodating_strength", numberFieldOptions)}
            />
            {selectedVenue?.capacity && !errors.accommodating_strength && (
              <p className="mt-1 text-xs text-slate-500">Venue capacity: {selectedVenue.capacity}</p>
            )}
            {errors.accommodating_strength && (
              <p className="mt-1 text-xs text-red-600">{errors.accommodating_strength.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-[7px] text-[14.5px] font-semibold text-slate-900">Start Time</p>
              <input
                type="time"
                className={`${inputClass} ${errors.from_time ? errorInputClass : ""}`}
                {...register("from_time")}
              />
              {errors.from_time && <p className="mt-1 text-xs text-red-600">{errors.from_time.message}</p>}
            </div>
            <div>
              <p className="mb-[7px] text-[14.5px] font-semibold text-slate-900">End Time</p>
              <input
                type="time"
                className={`${inputClass} ${errors.to_time ? errorInputClass : ""}`}
                {...register("to_time")}
              />
              {errors.to_time && <p className="mt-1 text-xs text-red-600">{errors.to_time.message}</p>}
            </div>
          </div>

          <div>
            <p className="mb-[7px] text-[14.5px] font-semibold text-slate-900">Purpose</p>
            <textarea
              rows={3}
              placeholder="Guest lecture, seminar, lab exam..."
              className={`${inputClass} resize-y ${errors.purpose ? errorInputClass : ""}`}
              {...register("purpose")}
            />
            {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose.message}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            isPending={createBooking.isPending}
            className="justify-center rounded-xl py-3.5 text-[15.5px]"
          >
            Submit Booking Request
          </Button>
        </form>
      </div>
    </div>
  );
}
