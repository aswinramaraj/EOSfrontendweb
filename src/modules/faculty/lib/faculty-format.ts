import type { Faculty } from "../types";

// Backend doesn't return a display code (no such field in the confirmed
// DTOs) — derived client-side purely for display, matching the design
// reference's "FAC0007"-style convention. Not a real identifier.
export function formatFacultyCode(id: number): string {
  return `FAC${String(id).padStart(4, "0")}`;
}

export function fullName(faculty: Pick<Faculty, "first_name" | "last_name">): string {
  return `${faculty.first_name} ${faculty.last_name}`.trim();
}

export function initialsOf(faculty: Pick<Faculty, "first_name" | "last_name">): string {
  const first = faculty.first_name?.[0] ?? "";
  const last = faculty.last_name?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
}

const AVATAR_TONES = [
  "bg-rose-50 text-rose-700",
  "bg-blue-50 text-blue-700",
  "bg-green-50 text-green-700",
  "bg-amber-50 text-amber-700",
  "bg-purple-50 text-purple-700",
  "bg-teal-50 text-teal-700",
];

// A simple deterministic hash so the same faculty always gets the same
// avatar tone across renders/pages, without needing a backend field for it.
export function avatarToneFor(seed: number | string): string {
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// For a native <input type="date">'s `max` attribute — caps date-of-birth
// pickers at today so the browser's own year list has no reason to scroll
// into the future (a DOB can never be one), without us having to reimplement
// the native picker's UI, which we don't control.
export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

// A native <input type="date"> only accepts an exact "YYYY-MM-DD" value —
// the backend returns date-only fields as full ISO datetime strings (e.g.
// "2026-08-05T00:00:00.000Z"), which the input can't render (it just shows
// its empty placeholder) while leaving the too-long raw string as the form's
// tracked value, tripping the schema's max-length check on an otherwise
// untouched, optional field. Pre-slicing here keeps the form's value in sync
// with what the input actually displays.
export function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const sliced = value.slice(0, 10);
  return Number.isNaN(new Date(sliced).getTime()) ? "" : sliced;
}

// Approximate — based on calendar years elapsed, not the mockup's
// day-precise calculation, since we only need a rough "N years" display.
export function experienceYears(dateOfJoining?: string | null): string {
  if (!dateOfJoining) return "—";
  const doj = new Date(dateOfJoining);
  if (Number.isNaN(doj.getTime())) return "—";
  const years = Math.max(0, Math.floor((Date.now() - doj.getTime()) / (365.25 * 24 * 3600 * 1000)));
  return `${years} year${years === 1 ? "" : "s"}`;
}

// Cheap completeness heuristic over fields the backend actually supports,
// since there's no backend-computed "profile complete" figure to show.
export function profileCompleteness(faculty: Faculty): number {
  const checks = [
    !!faculty.phone,
    !!faculty.date_of_joining,
    !!faculty.department_id,
    !!faculty.sensitive_info?.aadhar_number,
    !!faculty.sensitive_info?.pan_number,
    !!faculty.sensitive_info?.bank_account_number,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((2 + filled) / (2 + checks.length) * 100);
}

export function maskTail(value?: string | null, keep = 4): string {
  if (!value) return "Not provided";
  if (value.length <= keep) return value;
  return `${"•".repeat(value.length - keep)}${value.slice(-keep)}`;
}
