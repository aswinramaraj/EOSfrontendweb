import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  CreateTimetableVersionInput,
  ListTimetableVersionsParams,
  TimetableVersion,
  TimetableVersionDetail,
} from "../types/exam-timetable-versions";

export const timetableVersionsService = {
  list(params: ListTimetableVersionsParams): Promise<TimetableVersion[]> {
    return apiClient.get<TimetableVersion[]>(
      `/exam-timetable-versions${buildQuery(params)}`,
      requireToken(),
    );
  },
  get(id: number): Promise<TimetableVersionDetail> {
    return apiClient.get<TimetableVersionDetail>(`/exam-timetable-versions/${id}`, requireToken());
  },
  create(input: CreateTimetableVersionInput): Promise<TimetableVersion> {
    return apiClient.post<TimetableVersion>("/exam-timetable-versions", input, requireToken());
  },
  readyToPublish(id: number): Promise<TimetableVersion> {
    return apiClient.patch<TimetableVersion>(
      `/exam-timetable-versions/${id}/ready-to-publish`,
      undefined,
      requireToken(),
    );
  },
  returnToDrafts(id: number): Promise<TimetableVersion> {
    return apiClient.patch<TimetableVersion>(
      `/exam-timetable-versions/${id}/return-to-drafts`,
      undefined,
      requireToken(),
    );
  },
  publish(id: number, force?: boolean): Promise<TimetableVersion> {
    return apiClient.patch<TimetableVersion>(
      `/exam-timetable-versions/${id}/publish`,
      { force },
      requireToken(),
    );
  },
  withdraw(id: number): Promise<TimetableVersion> {
    return apiClient.patch<TimetableVersion>(
      `/exam-timetable-versions/${id}/withdraw`,
      undefined,
      requireToken(),
    );
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/exam-timetable-versions/${id}`, requireToken());
  },
};
