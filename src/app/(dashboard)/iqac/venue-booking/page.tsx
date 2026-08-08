"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { BarChartIcon, CheckIcon, ClockIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDashboardSummary } from "@/modules/iqac/hooks/useDashboard";
import {
  useReallocateVenueBooking,
  useReviewVenueBooking,
  useVenueBookings,
} from "@/modules/iqac/hooks/useVenueBookings";
import { VenueBookingFilters } from "@/modules/iqac/components/venue-booking/VenueBookingFilters";
import { VenueBookingTable } from "@/modules/iqac/components/venue-booking/VenueBookingTable";
import { BookingDetailModal } from "@/modules/iqac/components/venue-booking/BookingDetailModal";
import { ReallocateModal } from "@/modules/iqac/components/venue-booking/ReallocateModal";
import type { VenueBooking, VenueBookingListParams } from "@/modules/iqac/types/venue-booking";

const PAGE_SIZE = 20;

export default function VenueBookingPage() {
  const [filters, setFilters] = useState<VenueBookingListParams>({});
  const [page, setPage] = useState(1);
  const [detailBooking, setDetailBooking] = useState<VenueBooking | null>(null);
  const [reallocateBooking, setReallocateBooking] = useState<VenueBooking | null>(null);
  const { show } = useToast();

  const { data: summary } = useDashboardSummary();
  const { data, isLoading, error } = useVenueBookings({ ...filters, page, limit: PAGE_SIZE });
  const review = useReviewVenueBooking();
  const reallocate = useReallocateVenueBooking();

  const bookings = data?.data ?? [];

  function handleFiltersChange(next: VenueBookingListParams) {
    setFilters(next);
    setPage(1);
  }

  function approve(booking: VenueBooking) {
    review.mutate(
      { id: booking.id, input: { decision: "approved" } },
      {
        onSuccess: () => {
          show("Request approved successfully.", "success");
          setDetailBooking(null);
        },
        onError: (err) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function reject(booking: VenueBooking) {
    review.mutate(
      { id: booking.id, input: { decision: "rejected" } },
      {
        onSuccess: () => {
          show("Request rejected.", "success");
          setDetailBooking(null);
        },
        onError: (err) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function openReallocate(booking: VenueBooking) {
    setDetailBooking(null);
    setReallocateBooking(booking);
  }

  function bookVenue(venueId: number) {
    if (!reallocateBooking) return;
    reallocate.mutate(
      { id: reallocateBooking.id, input: { venue_id: venueId } },
      {
        onSuccess: () => {
          show("Venue reallocated and approved.", "success");
          setReallocateBooking(null);
        },
        onError: (err) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  return (
    <div>
      <PageHeader title="Venue Booking" description="Review, approve and reallocate venue booking requests." />

      <VenueBookingFilters value={filters} onChange={handleFiltersChange} />

      {summary && (
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Today's bookings" value={summary.today_bookings} icon={BarChartIcon} />
          <StatCard label="Pending requests" value={summary.pending_requests} icon={ClockIcon} />
          <StatCard label="Available venues" value={summary.available_venues} icon={CheckIcon} />
        </div>
      )}

      <VenueBookingTable
        bookings={bookings}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load venue bookings." : null}
        isDeciding={review.isPending}
        onView={setDetailBooking}
        onApprove={approve}
        onReject={reject}
        onReallocate={openReallocate}
      />

      {data && (
        <PaginationBar page={data.meta.page} pageSize={data.meta.limit} total={data.meta.total} onPageChange={setPage} />
      )}

      <BookingDetailModal
        booking={detailBooking}
        isDeciding={review.isPending}
        onClose={() => setDetailBooking(null)}
        onApprove={approve}
        onReject={reject}
        onReallocate={openReallocate}
      />

      <ReallocateModal
        booking={reallocateBooking}
        isPending={reallocate.isPending}
        onClose={() => setReallocateBooking(null)}
        onBook={bookVenue}
      />
    </div>
  );
}
