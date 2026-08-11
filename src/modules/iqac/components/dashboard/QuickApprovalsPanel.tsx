import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useVenueBookings, useReviewVenueBooking } from "../../hooks/useVenueBookings";

export function QuickApprovalsPanel() {
  const { data, isLoading } = useVenueBookings({ status: "pending", limit: 5 });
  const review = useReviewVenueBooking();
  const { show } = useToast();

  const rows = data?.data ?? [];

  function decide(id: number, decision: "approved" | "rejected") {
    review.mutate(
      { id, input: { decision } },
      {
        onSuccess: () => show(`Booking ${decision}.`, "success"),
        onError: (err) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
        <h2 className="text-[15.5px] font-bold text-slate-900">Quick access · approvals</h2>
        <div className="flex-1" />
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          {data?.meta.total ?? 0}
        </span>
      </div>

      {isLoading && <div className="px-5 py-8 text-sm text-slate-500">Loading…</div>}

      {!isLoading && rows.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-slate-500">
          All requests cleared — nothing waiting on you.
        </div>
      )}

      {!isLoading &&
        rows.map((booking) => {
          // Scoped to this row only — review.isPending is shared across every
          // row's mutation, so without the id check every card's buttons would
          // spin together whenever any one of them was clicked.
          const isThisRowPending = review.isPending && review.variables?.id === booking.id;
          const isAnyRowPending = review.isPending;

          return (
            <div key={booking.id} className="border-b border-slate-100 px-5 py-3.5 last:border-b-0">
              <div className="text-sm font-semibold text-slate-900">{booking.booked_by.name}</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {booking.venue.name} · {new Date(booking.from_datetime).toLocaleDateString()}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">{booking.purpose}</div>
              <div className="mt-2.5 flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  isPending={isThisRowPending}
                  disabled={isAnyRowPending && !isThisRowPending}
                  onClick={() => decide(booking.id, "approved")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className="flex-1"
                  isPending={isThisRowPending}
                  disabled={isAnyRowPending && !isThisRowPending}
                  onClick={() => decide(booking.id, "rejected")}
                >
                  Reject
                </Button>
              </div>
            </div>
          );
        })}
    </section>
  );
}
