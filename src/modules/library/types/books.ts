import type { DepartmentRef } from "./index";

export interface BookRackRef {
  id: number;
  rack_code: string;
  subject_range: string | null;
}

export interface Book {
  id: number;
  qr_code: string;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  edition: string | null;
  category_id: number;
  category_name: string;
  department: DepartmentRef | null;
  rack: BookRackRef | null;
  total_copies: number;
  available_copies: number;
  price_per_copy: number | null;
  vendor_fund: string | null;
}

// Distinct from Book: the fuzzy-search endpoint's rack projection omits
// subject_range and adds a similarity score.
export interface BookSearchResult extends Omit<Book, "rack"> {
  rack: { id: number; rack_code: string | null } | null;
  similarity: number;
}

export interface BookListParams {
  q?: string;
  category_id?: number;
  department_id?: number;
  rack_id?: number;
  available_only?: boolean;
  page?: number;
  page_size?: number;
}

export interface CreateBookInput {
  qr_code: string;
  title: string;
  category_id: number;
  total_copies: number;
  author?: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  department_id?: number;
  rack_id?: number;
  available_copies?: number;
  price_per_copy?: number;
  vendor_fund?: string;
}

export type UpdateBookInput = Partial<CreateBookInput>;
