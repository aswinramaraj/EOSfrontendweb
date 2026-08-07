import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { FacultyDocument } from "../types";

const BASE = "/me/faculty";

export interface UploadPhotoResponse {
  profile_url: string | null;
}

export const facultyFilesService = {
  uploadPhoto(facultyId: number, file: File): Promise<UploadPhotoResponse> {
    const form = new FormData();
    form.append("file", file);
    return apiClient.postForm<UploadPhotoResponse>(`${BASE}/${facultyId}/photo`, form, requireToken());
  },
  removePhoto(facultyId: number): Promise<UploadPhotoResponse> {
    return apiClient.delete<UploadPhotoResponse>(`${BASE}/${facultyId}/photo`, requireToken());
  },
  listDocuments(facultyId: number): Promise<FacultyDocument[]> {
    return apiClient.get<FacultyDocument[]>(`${BASE}/${facultyId}/documents`, requireToken());
  },
  uploadDocument(facultyId: number, file: File, documentType: string): Promise<FacultyDocument> {
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", documentType);
    return apiClient.postForm<FacultyDocument>(`${BASE}/${facultyId}/documents`, form, requireToken());
  },
  deleteDocument(facultyId: number, documentId: number): Promise<{ id: number }> {
    return apiClient.delete<{ id: number }>(`${BASE}/${facultyId}/documents/${documentId}`, requireToken());
  },
};
