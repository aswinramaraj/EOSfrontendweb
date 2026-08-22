// Domain types for the browser-local HR features (no backend today —
// Announcements, Academic Calendar, Recruitment, Onboarding & Exits).
// Deliberately kept separate from src/modules/hr/types/api.ts, which is
// real-API-only, so it's always obvious which types describe real backend
// data vs. HR-entered data persisted client-side.

export interface Announcement {
  id: string;
  headline: string;
  message: string;
  category: string;
  audience: string[];
  postedBy: string;
  postedAt: number;
  published: boolean;
}

export type CalendarEventType = "Instruction" | "Assessment" | "Holiday" | "Placement" | "HR" | "Academic";

export interface CalendarEvent {
  id: string;
  year: number;
  month: number; // 1-12
  day: number;
  title: string;
  type: CalendarEventType;
  createdAt: number;
}

export type VacancyStage = "screening" | "shortlist" | "interview" | "offer";

export interface Vacancy {
  id: string;
  role: string;
  departmentId: number | null;
  departmentName: string;
  positions: number;
  employmentType: "teaching" | "non-teaching";
  stage: VacancyStage;
  applicants: number;
  createdAt: number;
}

export type OnboardingCaseType = "onboarding" | "exit";
export type OnboardingCaseStage = "ready" | "in_progress" | "overdue";

export interface OnboardingCase {
  id: string;
  type: OnboardingCaseType;
  name: string;
  departmentId: number | null;
  departmentName: string;
  designation: string;
  effectiveDate: string; // ISO date — join date for onboarding, last-day for exits
  stage: OnboardingCaseStage;
  /** Onboarding cases only — HR-recorded, not derived from any schedule. */
  probationReviewDue: boolean;
  /** Exit cases only — library/IT/asset clearance checklist not yet complete. */
  clearancePending: boolean;
  createdAt: number;
}
