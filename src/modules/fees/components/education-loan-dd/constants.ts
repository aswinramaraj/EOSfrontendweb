import type { DdStatus } from "./types";

export const DD_STATUS_LABELS: Record<DdStatus, string> = {
  received: "Received",
  cleared: "Cleared",
  bounced: "Bounced",
};
