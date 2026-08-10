import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { formatDate, formatTimeRange } from "../../lib/format";
import type { VenueBooking } from "../../types/venue-booking";

interface BookingDetailModalProps {
  booking: VenueBooking | null;
  isDeciding: boolean;
  onClose: () => void;
  onApprove: (booking: VenueBooking) => void;
  onReject: (booking: VenueBooking) => void;
  onReallocate: (booking: VenueBooking) => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

export function BookingDetailModal({
  booking,
  isDeciding,
  onClose,
  onApprove,
  onReject,
  onReallocate,
}: BookingDetailModalProps) {
  return (
    <Modal open={booking !== null} onClose={onClose} title="Booking request" widthClassName="max-w-2xl">
      {booking && (
        <div>
          <h4 className="text-lg font-bold text-slate-900">{booking.booked_by.name}</h4>
          <p className="text-sm text-slate-500">{booking.booked_by.department_name ?? "—"}</p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="Venue" value={booking.venue.name} />
            <Field label="Purpose" value={booking.purpose} />
            <Field label="From" value={`${formatDate(booking.from_datetime)}`} />
            <Field label="To" value={`${formatDate(booking.to_datetime)}`} />
            <Field label="Time slot" value={formatTimeRange(booking.from_datetime, booking.to_datetime)} />
            <Field
              label="Expected / capacity"
              value={`${booking.accommodating_strength ?? "—"} / ${booking.venue.capacity ?? "—"}`}
            />
            <Field label="Faculty email" value={booking.booked_by.email} />
            <Field label="Phone" value={booking.booked_by.phone ?? "—"} />
          </div>

          {booking.description && (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Event description
              </div>
              <p className="mt-1 text-sm text-slate-700">{booking.description}</p>
            </div>
          )}

          {booking.requirements.length > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Special requirements
              </div>
              <div className="flex flex-wrap gap-1.5">
                {booking.requirements.map((req) => (
                  <span key={req} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {booking.alternative_venue && (
            <p className="mt-4 text-sm text-slate-600">
              Alternative venue offered: <strong className="text-slate-900">{booking.alternative_venue.name}</strong>
            </p>
          )}

          {booking.admin_remarks && (
            <div className="mt-4 border-l-3 border-blue-200 bg-slate-50 p-3">
              <span className="font-semibold text-slate-900">Administrative remarks — </span>
              <span className="text-sm text-slate-600">{booking.admin_remarks}</span>
            </div>
          )}

          {booking.status === "pending" && (
            <div className="mt-6 flex gap-2 border-t border-slate-200 pt-4">
              <Button variant="primary" className="flex-1" isPending={isDeciding} onClick={() => onApprove(booking)}>
                Approve
              </Button>
              <Button variant="danger" className="flex-1" isPending={isDeciding} onClick={() => onReject(booking)}>
                Reject
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => onReallocate(booking)}>
                Reallocate
              </Button>
            </div>
          )}
          {booking.status === "rejected" && (
            <div className="mt-6 flex border-t border-slate-200 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => onReallocate(booking)}>
                Reallocate
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
