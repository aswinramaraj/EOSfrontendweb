import type { PillTone } from "@/shared/components/ui/StatusPill";
import type { ResidentCurrentStatus, ResidentFeeStatus } from "../types/residents";
import type { ComplaintCategory } from "../types/complaints";

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(value: number | null): string {
  if (value === null) return "—";
  return `₹${value.toFixed(2)}`;
}

export function feeStatusTone(status: ResidentFeeStatus): PillTone {
  switch (status) {
    case "paid":
      return "green";
    case "partially_paid":
      return "amber";
    case "unpaid":
      return "red";
    case "not_applicable":
      return "slate";
  }
}

export function feeStatusLabel(status: ResidentFeeStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "partially_paid":
      return "Partially paid";
    case "unpaid":
      return "Unpaid";
    case "not_applicable":
      return "N/A";
  }
}

export function currentStatusTone(status: ResidentCurrentStatus): PillTone {
  return status === "on_leave" ? "amber" : "green";
}

export function currentStatusLabel(status: ResidentCurrentStatus): string {
  return status === "on_leave" ? "On leave" : "In hostel";
}

export type ComplaintArea = "mess" | "hostel" | "amenities";

export function complaintArea(category: ComplaintCategory): ComplaintArea {
  if (category === "mess") return "mess";
  if (category === "facilities" || category === "other") return "amenities";
  return "hostel";
}

export function complaintAreaLabel(area: ComplaintArea): string {
  switch (area) {
    case "mess":
      return "Mess";
    case "hostel":
      return "Hostel";
    case "amenities":
      return "Amenities";
  }
}

// The backend has no formatted ticket code — this is a cosmetic label
// derived from the real numeric id, not a stored field.
export function complaintTicketCode(id: number): string {
  return `CMP-${1000 + id}`;
}

export function daysSince(dateIso: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(dateIso).getTime()) / 86_400_000));
  if (days === 0) return "Today";
  return days === 1 ? "1 day" : `${days} days`;
}
