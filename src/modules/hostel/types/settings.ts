export interface HostelSettings {
  id: number;
  auto_approve_low_risk: boolean;
  min_attendance_for_auto_pct: number;
  require_biometric_pop: boolean;
  sms_guardian_on_checkout: boolean;
  alert_on_overdue_return: boolean;
  weekly_arrears_reminder: boolean;
  publish_resolved_complaints: boolean;
  max_outing_days: number;
  updated_at: string;
}

export interface UpdateHostelSettingsInput {
  auto_approve_low_risk?: boolean;
  min_attendance_for_auto_pct?: number;
  require_biometric_pop?: boolean;
  sms_guardian_on_checkout?: boolean;
  alert_on_overdue_return?: boolean;
  weekly_arrears_reminder?: boolean;
  publish_resolved_complaints?: boolean;
  max_outing_days?: number;
}
