import type { PillTone } from "@/shared/components/ui/StatusPill";
import type { BorrowStatus } from "../types/borrow-records";

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

interface StatusLike {
  status: BorrowStatus;
  is_overdue: boolean;
}

export function borrowStatusTone(record: StatusLike): PillTone {
  if (record.status === "lost" || record.status === "damaged") return "red";
  if (record.is_overdue) return "amber";
  if (record.status === "returned") return "slate";
  return "blue";
}

export function borrowStatusLabel(record: StatusLike): string {
  if (record.is_overdue) return "Overdue";
  switch (record.status) {
    case "borrowed":
      return "Borrowed";
    case "returned":
      return "Returned";
    case "lost":
      return "Lost";
    case "damaged":
      return "Damaged";
  }
}

export function borrowerName(record: {
  student: { name: string } | null;
  faculty: { name: string } | null;
}): string {
  return record.student?.name ?? record.faculty?.name ?? "Unknown";
}
