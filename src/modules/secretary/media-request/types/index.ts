export type MediaRequestStatus = "pending" | "approved" | "rejected" | "delivered";

export const MEDIA_REQUEST_TYPES = [
  "Photography",
  "Videography",
  "Live Streaming",
  "Drone Coverage",
  "LED Display Support",
  "Sound System",
  "Stage Photography",
  "Event Highlights",
] as const;

export interface MediaRequest {
  id: number;
  description: string;
  status: MediaRequestStatus;
  media_file_url: string | null;
  created_at: string;
  event_name: string | null;
  event_date: string | null;
  venue: { id: number; name: string; location: string | null } | null;
  coordinator_name: string | null;
  contact_number: string | null;
  media_types: string[];
  requested_by: { id: number; name: string };
}

export interface CreateMediaRequestInput {
  description: string;
  event_name?: string;
  event_date?: string;
  venue_id?: number;
  coordinator_name?: string;
  contact_number?: string;
  media_types?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
