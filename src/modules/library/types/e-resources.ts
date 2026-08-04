export type EResourceFormat = "PDF" | "EPUB" | "MOBI" | "DOCX" | "Other";
export type EResourceLicenseType =
  | "institution_licence"
  | "open_access"
  | "department_copy"
  | "reference_only";
export type EResourcePublishState = "draft" | "published";

// e-resources has no author/department fields at all — distinct from
// books, which has both.
export interface EResource {
  id: number;
  title: string;
  url: string;
  category_id: number | null;
  category_name: string | null;
  format: EResourceFormat | null;
  file_size_bytes: number | null;
  pages: number | null;
  license_type: EResourceLicenseType | null;
  concurrent_seats: number | null;
  publish_state: EResourcePublishState;
  uploaded_by_user_id: number | null;
  created_at: string;
}

export interface EResourceSearchResult extends EResource {
  similarity: number;
}

export interface EResourceListParams {
  q?: string;
  category_id?: number;
  format?: EResourceFormat;
  publish_state?: EResourcePublishState;
  page?: number;
  page_size?: number;
}

export interface CreateEResourceInput {
  title: string;
  url: string;
  category_id?: number;
  format?: EResourceFormat;
  file_size_bytes?: number;
  pages?: number;
  license_type?: EResourceLicenseType;
  concurrent_seats?: number;
  publish_state?: EResourcePublishState;
}

export type UpdateEResourceInput = Partial<CreateEResourceInput>;
