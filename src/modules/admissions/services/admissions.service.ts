import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  CertificateType,
  CreatePerfectEntryInput,
  CreateSoaApplicationInput,
  HostelRoomType,
  ListSoaApplicationsParams,
  PerfectEntryResult,
  ProfileDraft,
  SaveProfileDraftInput,
  SoaApplication,
  SoaApplicationDetail,
  SoaApplicationsListResponse,
  SoaStatus,
  TransportStage,
  UpdateSoaApplicationInput,
  UploadedDocument,
} from "../types";

export const admissionsService = {
  createApplication(input: CreateSoaApplicationInput): Promise<SoaApplication> {
    return apiClient.post<SoaApplication>("/soa-applications", input, requireToken());
  },
  listApplications(params: ListSoaApplicationsParams = {}): Promise<SoaApplicationsListResponse> {
    return apiClient.get<SoaApplicationsListResponse>(`/soa-applications${buildQuery(params)}`, requireToken());
  },
  getApplication(id: number): Promise<SoaApplicationDetail> {
    return apiClient.get<SoaApplicationDetail>(`/soa-applications/${id}`, requireToken());
  },
  updateApplication(id: number, input: UpdateSoaApplicationInput): Promise<SoaApplicationDetail> {
    return apiClient.patch<SoaApplicationDetail>(`/soa-applications/${id}`, input, requireToken());
  },
  deleteApplication(id: number): Promise<{ id: number; deleted: boolean }> {
    return apiClient.delete<{ id: number; deleted: boolean }>(`/soa-applications/${id}`, requireToken());
  },
  updateStatus(id: number, status: SoaStatus): Promise<SoaApplication> {
    return apiClient.patch<SoaApplication>(`/soa-applications/${id}/status`, { status }, requireToken());
  },
  perfectEntry(id: number, input: CreatePerfectEntryInput): Promise<PerfectEntryResult> {
    return apiClient.post<PerfectEntryResult>(`/soa-applications/${id}/perfect-entry`, input, requireToken());
  },
  listTransportStages(): Promise<TransportStage[]> {
    return apiClient.get<TransportStage[]>("/transport-stages", requireToken());
  },
  listHostelRoomTypes(): Promise<HostelRoomType[]> {
    return apiClient.get<HostelRoomType[]>("/hostel-room-types", requireToken());
  },
  getDraft(id: number): Promise<ProfileDraft | null> {
    return apiClient.get<ProfileDraft | null>(`/soa-applications/${id}/draft`, requireToken());
  },
  saveDraft(id: number, input: SaveProfileDraftInput): Promise<ProfileDraft> {
    return apiClient.put<ProfileDraft>(`/soa-applications/${id}/draft`, input, requireToken());
  },
  listCertificateTypes(): Promise<CertificateType[]> {
    return apiClient.get<CertificateType[]>("/certificate-types", requireToken());
  },
  /** Uploads immediately (no students row exists yet at this point in the wizard) — see soa-applications.service.ts's own docblock. */
  uploadPhoto(id: number, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.uploadFile<{ url: string }>(`/soa-applications/${id}/photo`, formData, requireToken());
  },
  uploadDocument(id: number, certificateTypeId: number, file: File): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append("certificate_type_id", String(certificateTypeId));
    formData.append("file", file);
    return apiClient.uploadFile<UploadedDocument>(`/soa-applications/${id}/documents`, formData, requireToken());
  },
};
