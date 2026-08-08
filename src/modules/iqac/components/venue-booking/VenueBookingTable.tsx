import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { CheckIcon, SwapIcon, XIcon } from "@/shared/components/icons";
import { formatDate, formatTimeRange } from "../../lib/format";
import type { VenueBooking } from "../../types/venue-booking";

const STATUS_TONE: Record<VenueBooking["status"], PillTone> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
  alternative_offered: "blue",
};

const STATUS_LABEL: Record<VenueBooking["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  alternative_offered: "Alternative offered",
};

interface VenueBookingTableProps {
  bookings: VenueBooking[];
  isLoading: boolean;
  error: string | null;
  isDeciding: boolean;
  onView: (booking: VenueBooking) => void;
  onApprove: (booking: VenueBooking) => void;
  onReject: (booking: VenueBooking) => void;
  onReallocate: (booking: VenueBooking) => void;
}

export function VenueBookingTable({
  bookings,
  isLoading,
  error,
  isDeciding,
  onView,
  onApprove,
  onReject,
  onReallocate,
}: VenueBookingTableProps) {
  const columns: DataTableColumn<VenueBooking>[] = [
    {
      key: "faculty",
      header: "Faculty name",
      render: (b) => (
        <button onClick={() => onView(b)} className="font-semibold text-slate-900 hover:text-blue-700">
          {b.booked_by.name}
        </button>
      ),
    },
    { key: "department", header: "Department", render: (b) => b.booked_by.department_name ?? "—" },
    { key: "venue", header: "Venue", render: (b) => b.venue.name },
    { key: "from", header: "From date", render: (b) => formatDate(b.from_datetime) },
    { key: "to", header: "To date", render: (b) => formatDate(b.to_datetime) },
    { key: "slot", header: "Time slot", render: (b) => formatTimeRange(b.from_datetime, b.to_datetime) },
    {
      key: "seats",
      header: "Seats",
      align: "right",
      render: (b) => (
        <span className={b.accommodating_strength && b.venue.capacity && b.accommodating_strength > b.venue.capacity ? "font-semibold text-red-600" : ""}>
          {b.accommodating_strength ?? "—"} / {b.venue.capacity ?? "—"}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (b) => <StatusPill tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</StatusPill> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (b) => {
        if (b.status === "pending") {
          return (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="primary" isPending={isDeciding} onClick={() => onApprove(b)} aria-label="Approve">
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="danger" isPending={isDeciding} onClick={() => onReject(b)} aria-label="Reject">
                <XIcon className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onReallocate(b)} aria-label="Reallocate venue">
                <SwapIcon className="h-4 w-4" />
              </Button>
            </div>
          );
        }
        if (b.status === "rejected") {
          return (
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => onReallocate(b)}>
                <SwapIcon className="h-4 w-4" /> Reallocate
              </Button>
            </div>
          );
        }
        return <span className="text-xs text-slate-400">Decided</span>;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={bookings}
      rowKey={(b) => b.id}
      isLoading={isLoading}
      error={error}
      emptyMessage="No venue requests match the current filters."
    />
  );
}
