import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { useAvailableVenues } from "../../hooks/useVenueBookings";
import type { VenueBooking } from "../../types/venue-booking";

interface ReallocateModalProps {
  booking: VenueBooking | null;
  isPending: boolean;
  onClose: () => void;
  onBook: (venueId: number) => void;
}

export function ReallocateModal({ booking, isPending, onClose, onBook }: ReallocateModalProps) {
  const { data, isLoading } = useAvailableVenues(
    booking?.from_datetime ?? null,
    booking?.to_datetime ?? null,
  );

  const venues = (data?.data ?? []).filter((v) => v.id !== booking?.venue_id);

  return (
    <Modal open={booking !== null} onClose={onClose} title="Reallocate venue" widthClassName="max-w-xl">
      {booking && (
        <div>
          <p className="mb-4 text-sm text-slate-500">
            Available venues for {booking.booked_by.name}&rsquo;s requested time window.
          </p>

          {isLoading && <p className="text-sm text-slate-500">Loading venues…</p>}

          <div className="flex flex-col gap-3">
            {!isLoading &&
              venues.map((v) => (
                <div key={v.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-900">{v.name}</div>
                      <div className="text-xs text-slate-500">{v.location ?? "—"}</div>
                    </div>
                    <StatusPill tone={v.is_available ? "green" : "red"}>
                      {v.is_available ? "Available" : "Occupied"}
                    </StatusPill>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Capacity: <span className="font-medium text-slate-700">{v.capacity ?? "—"}</span>
                  </div>
                  <Button
                    className="mt-3 w-full"
                    variant="primary"
                    disabled={!v.is_available}
                    isPending={isPending}
                    onClick={() => onBook(v.id)}
                  >
                    Book this venue
                  </Button>
                </div>
              ))}

            {!isLoading && venues.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">No other venues found for this time window.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
