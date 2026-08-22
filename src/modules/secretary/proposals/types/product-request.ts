import type { RequestParty } from "./service-request";

export type ProductRequestStatus = "draft" | "pending" | "approved" | "rejected";

export interface ProductRequestItem {
  id: number;
  product_name: string;
  quantity: number;
  purpose: string | null;
}

export interface ProductRequest {
  id: number;
  title: string;
  justification: string | null;
  status: ProductRequestStatus;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  items: ProductRequestItem[];
  requested_by: RequestParty;
  reviewed_by: RequestParty | null;
}

export interface ProductRequestItemInput {
  product_name: string;
  quantity: number;
  purpose?: string;
}

export interface CreateProductRequestInput {
  title: string;
  justification?: string;
  items?: ProductRequestItemInput[];
}

export type UpdateProductRequestInput = Partial<CreateProductRequestInput>;
