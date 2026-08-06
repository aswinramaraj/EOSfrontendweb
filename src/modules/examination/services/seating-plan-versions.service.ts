import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  AddVersionVenueInput,
  AllocateVersionVenueInput,
  CreateSeatingVersionInput,
  ListSeatingVersionsParams,
  SeatArrangementRow,
  SeatingVersion,
  SeatingVersionDetail,
  SeatingVersionVenue,
  UpdateVersionVenueInput,
} from "../types/seating";

export const seatingPlanVersionsService = {
  list(params: ListSeatingVersionsParams): Promise<SeatingVersion[]> {
    return apiClient.get<SeatingVersion[]>(
      `/seating-plan-versions${buildQuery(params)}`,
      requireToken(),
    );
  },
  get(id: number): Promise<SeatingVersionDetail> {
    return apiClient.get<SeatingVersionDetail>(`/seating-plan-versions/${id}`, requireToken());
  },
  create(input: CreateSeatingVersionInput): Promise<SeatingVersion> {
    return apiClient.post<SeatingVersion>("/seating-plan-versions", input, requireToken());
  },
  readyToPublish(id: number): Promise<SeatingVersion> {
    return apiClient.patch<SeatingVersion>(
      `/seating-plan-versions/${id}/ready-to-publish`,
      undefined,
      requireToken(),
    );
  },
  returnToDrafts(id: number): Promise<SeatingVersion> {
    return apiClient.patch<SeatingVersion>(
      `/seating-plan-versions/${id}/return-to-drafts`,
      undefined,
      requireToken(),
    );
  },
  publish(id: number, force?: boolean): Promise<SeatingVersion> {
    return apiClient.patch<SeatingVersion>(
      `/seating-plan-versions/${id}/publish`,
      { force },
      requireToken(),
    );
  },
  withdraw(id: number): Promise<SeatingVersion> {
    return apiClient.patch<SeatingVersion>(
      `/seating-plan-versions/${id}/withdraw`,
      undefined,
      requireToken(),
    );
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/seating-plan-versions/${id}`, requireToken());
  },
  addVenue(versionId: number, input: AddVersionVenueInput): Promise<SeatingVersionVenue> {
    return apiClient.post<SeatingVersionVenue>(
      `/seating-plan-versions/${versionId}/venues`,
      input,
      requireToken(),
    );
  },
  updateVenue(
    versionId: number,
    venueLinkId: number,
    input: UpdateVersionVenueInput,
  ): Promise<SeatingVersionVenue> {
    return apiClient.patch<SeatingVersionVenue>(
      `/seating-plan-versions/${versionId}/venues/${venueLinkId}`,
      input,
      requireToken(),
    );
  },
  removeVenue(versionId: number, venueLinkId: number): Promise<{ id: number }> {
    return apiClient.delete<{ id: number }>(
      `/seating-plan-versions/${versionId}/venues/${venueLinkId}`,
      requireToken(),
    );
  },
  allocateVenue(
    versionId: number,
    venueLinkId: number,
    input: AllocateVersionVenueInput,
  ): Promise<SeatArrangementRow[]> {
    return apiClient.post<SeatArrangementRow[]>(
      `/seating-plan-versions/${versionId}/venues/${venueLinkId}/allocate`,
      input,
      requireToken(),
    );
  },
  clearVenueAllocation(versionId: number, venueLinkId: number): Promise<{ deleted_count: number }> {
    return apiClient.delete<{ deleted_count: number }>(
      `/seating-plan-versions/${versionId}/venues/${venueLinkId}/allocation`,
      requireToken(),
    );
  },
};
