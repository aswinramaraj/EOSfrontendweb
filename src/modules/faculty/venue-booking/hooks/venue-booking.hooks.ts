"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import { venueBookingsService, venuesService } from "../services/venue-booking.service";
import type { CreateVenueBookingPayload, VenueAvailability, VenueBooking, VenueBookingRaw } from "../types/venue-booking.types";

type ModuleStatus = "loading" | "error" | "empty" | "ready";

function toErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

function requireToken(): string {
  const token = tokenStorage.getToken();
  if (!token) throw new ApiError("You are not signed in.", 401, "UNAUTHORIZED");
  return token;
}

function toVenueBooking(raw: VenueBookingRaw): VenueBooking {
  return {
    id: raw.id,
    purpose: raw.purpose,
    fromDatetime: raw.from_datetime,
    toDatetime: raw.to_datetime,
    accommodatingStrength: raw.accommodating_strength,
    status: raw.status,
    createdAt: raw.created_at,
    venue: raw.venues_venue_bookings_venue_idTovenues,
    alternativeVenueId: raw.alternative_venue_id,
  };
}

interface AvailabilityFetchResult {
  key: string;
  venues: VenueAvailability[];
  error: string | null;
}

const INITIAL_AVAILABILITY: AvailabilityFetchResult = { key: "", venues: [], error: null };

/** `fromIso`/`toIso` should be null until a full date range is selected —
 * the backend requires both and rejects `from >= to`. */
export function useVenueAvailability(fromIso: string | null, toIso: string | null) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<AvailabilityFetchResult>(INITIAL_AVAILABILITY);
  const requestKey = `availability:${fromIso ?? "none"}:${toIso ?? "none"}:${refreshToken}`;

  const status: ModuleStatus =
    !fromIso || !toIso
      ? "empty"
      : fetchResult.key !== requestKey
        ? "loading"
        : fetchResult.error
          ? "error"
          : fetchResult.venues.length === 0
            ? "empty"
            : "ready";

  useEffect(() => {
    if (!fromIso || !toIso) return;
    let cancelled = false;

    venuesService
      .listAvailability(fromIso, toIso, requireToken())
      .then((result) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, venues: result.data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, venues: [], error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, fromIso, toIso]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  return { status, venues: fetchResult.venues, error: fetchResult.error, retry };
}

interface MyBookingsFetchResult {
  key: string;
  bookings: VenueBooking[];
  error: string | null;
}

const INITIAL_MY_BOOKINGS: MyBookingsFetchResult = { key: "", bookings: [], error: null };

export function useMyVenueBookings() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<MyBookingsFetchResult>(INITIAL_MY_BOOKINGS);
  const requestKey = `my-bookings:${refreshToken}`;

  const status: ModuleStatus =
    fetchResult.key !== requestKey
      ? "loading"
      : fetchResult.error
        ? "error"
        : fetchResult.bookings.length === 0
          ? "empty"
          : "ready";

  useEffect(() => {
    let cancelled = false;

    venueBookingsService
      .listMine(requireToken())
      .then((result) => {
        if (cancelled) return;
        setFetchResult({
          key: requestKey,
          bookings: result.data.map(toVenueBooking).sort((a, b) => b.id - a.id),
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, bookings: [], error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  return { status, bookings: fetchResult.bookings, error: fetchResult.error, retry };
}

/** Resolves each distinct `alternativeVenueId` present in `bookings` to its
 * venue name, so "IQAC reassigned you to X" can show a real name instead of
 * a bare id — GET /venues/:id has no date filter, so this is a plain lookup
 * independent of whatever date range is currently selected on the page. */
export function useAlternativeVenueNames(bookings: VenueBooking[]) {
  const [names, setNames] = useState<Map<number, string>>(new Map());
  const idsKey = [...new Set(bookings.map((b) => b.alternativeVenueId).filter((id): id is number => id !== null))]
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    if (!idsKey) return;
    let cancelled = false;
    const token = tokenStorage.getToken();
    if (!token) return;

    const ids = idsKey.split(",").map(Number);
    Promise.all(ids.map((id) => venuesService.getById(id, token).then((venue) => [id, venue.name] as const).catch(() => null))).then(
      (results) => {
        if (cancelled) return;
        setNames(new Map(results.filter((r): r is readonly [number, string] => r !== null)));
      },
    );

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  return names;
}

export function useCreateVenueBooking(onCreated?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: CreateVenueBookingPayload): Promise<boolean> {
    setIsSubmitting(true);
    setError(null);
    try {
      await venueBookingsService.create(payload, requireToken());
      setIsSubmitting(false);
      onCreated?.();
      return true;
    } catch (err) {
      setIsSubmitting(false);
      setError(toErrorMessage(err));
      return false;
    }
  }

  return { submit, isSubmitting, error, clearError: () => setError(null) };
}
