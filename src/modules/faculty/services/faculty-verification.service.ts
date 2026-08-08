import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";

const BASE = "/me/faculty-verification";

export type OtpChannel = "sms" | "whatsapp";

export interface SendOtpResponse {
  status: string;
  channel: string;
  to: string;
}

export interface CheckOtpResponse {
  status: string;
  valid: boolean;
}

// Twilio Verify owns OTP generation, expiry and attempt-counting entirely —
// this is a thin passthrough to the backend's /me/faculty-verification
// endpoints. No code is ever generated or stored on the frontend.
export const facultyVerificationService = {
  send(phone: string, channel: OtpChannel): Promise<SendOtpResponse> {
    return apiClient.post<SendOtpResponse>(`${BASE}/send`, { phone, channel }, requireToken());
  },
  check(phone: string, code: string): Promise<CheckOtpResponse> {
    return apiClient.post<CheckOtpResponse>(`${BASE}/check`, { phone, code }, requireToken());
  },
};
