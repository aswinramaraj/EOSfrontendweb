export type ServiceRequestStatus = "draft" | "pending" | "approved" | "rejected";

export interface ServiceRequestItem {
  id: number;
  service_name: string;
}

export interface RequestParty {
  id: number;
  name: string;
}

export interface ServiceRequest {
  id: number;
  title: string;
  justification: string | null;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  items: ServiceRequestItem[];
  requested_by: RequestParty;
  reviewed_by: RequestParty | null;
}

export interface ServiceRequestItemInput {
  service_name: string;
}

export interface CreateServiceRequestInput {
  title: string;
  justification?: string;
  items?: ServiceRequestItemInput[];
}

export type UpdateServiceRequestInput = Partial<CreateServiceRequestInput>;

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
