import type { ApprovalStatus } from "../types/api";

export function stageLabel(hod: ApprovalStatus, hr: ApprovalStatus): string {
  if (hod === "rejected") return "HOD Rejected";
  if (hr === "rejected") return "HR Rejected";
  if (hod === "pending") return "Under HOD Review";
  if (hr === "pending") return "Pending HR";
  return "Completed";
}

export function durationLabel(fromDate: string, toDate: string): string {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days <= 1 ? "1 day" : `${days} days`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
