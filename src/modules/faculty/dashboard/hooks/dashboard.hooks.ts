"use client";

// GET /me/profile and GET /me/attendance were confirmed (curl, 5/5
// deterministic each way — not a browser/CORS/token issue) to permanently
// collide with a student-only controller in EOS-backend
// (src/modules/admissions/students/me-profile/me-profile.controller.ts), which
// is imported earlier in src/app.module.ts than FacultyModule/AttendanceModule
// and so always won the route match. The backend has been fixed locally
// (renamed to /me/faculty-profile and /me/attendance-records — commit
// 6b928ff on the `faculty` branch) but that fix has NOT been deployed to the
// live Render backend this frontend talks to, so calls to those paths can
// still 403 in production until it's deployed. Every call below stays
// wrapped to degrade gracefully instead of surfacing a permanent, unfixable
// "error + Retry" state.
import { useEffect, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import { attendanceService, facultyProfileService, timetableService } from "../services/dashboard.service";
import type {
  AttendanceMarkStatus,
  AttendanceRecordResponse,
  ClassStudentRaw,
  DashboardProfile,
  DayOfWeekNumber,
  RosterStudent,
  SectionStatus,
  SubjectHandlingEntry,
  TimetableCell,
  TimetableDayRow,
  TimetableSlot,
  WeeklyTimetable,
} from "../types/dashboard.types";
import { mapSlotToCell } from "../utils/mapTimetableSlot";
import { dayLabel, formatTodayLabel, todayDayOfWeek } from "../utils/time";

function toErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Most frequently occurring value in a non-empty list, or null if the list is empty. */
function dominantValue<T>(values: T[]): T | null {
  if (values.length === 0) return null;

  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

  let best = values[0];
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

function countTodaysClasses(slots: TimetableSlot[]): number {
  const todayDayOfWeekValue = new Date().getDay(); // 0=Sun..6=Sat — matches backend's own day_of_week convention
  return slots.filter((slot) => slot.day_of_week === todayDayOfWeekValue).length;
}

async function loadDashboardProfile(): Promise<DashboardProfile> {
  const token = tokenStorage.getToken();
  if (!token) {
    throw new ApiError("You are not signed in.", 401, "UNAUTHORIZED");
  }

  const authMe = await facultyProfileService.getAuthMe(token);
  if (!authMe.faculty) {
    throw new ApiError("No faculty record is linked to this account.", 404, "FACULTY_NOT_LINKED");
  }
  const facultyId = authMe.faculty.id;

  // GET /me/profile is optional enrichment, not a hard dependency: on the
  // currently deployed backend it 403s for a real faculty token (route
  // collision with a student-only handler on the same path). auth/me's
  // `faculty` sub-object already covers name/designation/department, so a
  // failure here only costs the join date, never the whole card.
  const [profile, mapping, timetable] = await Promise.all([
    facultyProfileService.getMyProfile(token).catch(() => null),
    facultyProfileService.getFacultyMapping(facultyId, token),
    timetableService.getMyTimetableSlots(facultyId, token),
  ]);

  const subjectsHandling: SubjectHandlingEntry[] = mapping.data.map((item) => ({
    subjectName: item.subject.name,
    subjectCode: item.subject.subject_code,
    departmentCode: item.class.department.code,
    section: item.class.section,
  }));

  return {
    fullName: `${authMe.faculty.first_name} ${authMe.faculty.last_name}`,
    initials: getInitials(authMe.faculty.first_name, authMe.faculty.last_name),
    designation: authMe.faculty.designation,
    departmentName: authMe.faculty.departments.name,
    departmentCode: authMe.faculty.departments.code,
    email: profile?.email ?? authMe.email,
    phone: profile?.phone ?? authMe.phone,
    dateJoined: profile?.date_of_joining ?? null,
    academicYear: dominantValue(timetable.data.map((slot) => slot.academic_year)),
    semester: dominantValue(timetable.data.map((slot) => slot.semester)),
    subjectsAllocated: mapping.meta.total,
    todaysClassesCount: countTodaysClasses(timetable.data),
    subjectsHandling,
  };
}

interface ProfileFetchResult {
  key: string;
  profile: DashboardProfile | null;
  error: string | null;
}

const INITIAL_PROFILE_FETCH_RESULT: ProfileFetchResult = { key: "", profile: null, error: null };

export function useFacultyDashboardProfile() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<ProfileFetchResult>(INITIAL_PROFILE_FETCH_RESULT);
  const requestKey = `profile:${refreshToken}`;

  const status: SectionStatus =
    fetchResult.key !== requestKey ? "loading" : fetchResult.error ? "error" : fetchResult.profile ? "ready" : "empty";

  useEffect(() => {
    let cancelled = false;

    loadDashboardProfile()
      .then((profile) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, profile, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult((prev) => ({ ...prev, key: requestKey, profile: null, error: toErrorMessage(err) }));
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  return { status, profile: fetchResult.profile, error: fetchResult.error, retry };
}

const PERIOD_NUMBERS = [1, 2, 3, 4, 5, 6, 7];
const WEEKDAYS: DayOfWeekNumber[] = [1, 2, 3, 4, 5];
const CURRENT_PERIOD_REFRESH_MS = 30_000;

function attendanceMarkedKey(classId: number, subjectId: number): string {
  return `${classId}:${subjectId}`;
}

function buildWeeklyTimetable(slots: TimetableSlot[], markedKeys: Set<string>): WeeklyTimetable {
  const today = todayDayOfWeek();
  const now = new Date();

  const days: TimetableDayRow[] = WEEKDAYS.map((dayOfWeek) => {
    const daySlots = slots.filter((slot) => slot.day_of_week === dayOfWeek);
    const cellsByPeriod: Record<number, TimetableCell | null> = {};

    for (const periodNumber of PERIOD_NUMBERS) {
      const slot = daySlots.find((candidate) => candidate.period_number === periodNumber);
      cellsByPeriod[periodNumber] = slot
        ? {
            ...mapSlotToCell(slot, today, now),
            isAttendanceMarked: markedKeys.has(attendanceMarkedKey(slot.class.id, slot.subject.id)),
          }
        : null;
    }

    return { dayOfWeek, dayLabel: dayLabel(dayOfWeek), isToday: dayOfWeek === today, cellsByPeriod };
  });

  return { periodNumbers: PERIOD_NUMBERS, days, todayLabel: formatTodayLabel() };
}

/** For today's classes only, checks which (class, subject) pairs already have
 * attendance recorded today, so the grid can show a real "already marked"
 * indicator — reuses the same GET /me/attendance-records the Attendance panel
 * itself checks against, one call per distinct class meeting today.
 *
 * GET /me/attendance-records can still 403 against the currently-deployed
 * backend (see the module-level comment at the top of this file) — every
 * call here is caught individually so that never breaks the timetable
 * itself, which loads from a completely different, working endpoint. Today's
 * chips just won't show the "already marked" badge until the fix is deployed. */
async function loadTodaysMarkedKeys(slots: TimetableSlot[], token: string): Promise<Set<string>> {
  const today = todayDayOfWeek();
  const todaySlots = slots.filter((slot) => slot.day_of_week === today);
  const uniqueClassIds = [...new Set(todaySlots.map((slot) => slot.class.id))];
  if (uniqueClassIds.length === 0) return new Set();

  const date = todayIsoDate();
  const results = await Promise.all(
    uniqueClassIds.map((classId) => attendanceService.getAttendanceForClassDate(classId, date, token).catch(() => null)),
  );

  const markedKeys = new Set<string>();
  results.forEach((result, index) => {
    if (!result) return;
    const classId = uniqueClassIds[index];
    for (const record of result.data) {
      if (record.subject) markedKeys.add(attendanceMarkedKey(classId, record.subject.id));
    }
  });
  return markedKeys;
}

async function loadTimetableSlots(): Promise<{ slots: TimetableSlot[]; markedKeys: Set<string> }> {
  const token = tokenStorage.getToken();
  if (!token) {
    throw new ApiError("You are not signed in.", 401, "UNAUTHORIZED");
  }

  const authMe = await facultyProfileService.getAuthMe(token);
  if (!authMe.faculty) {
    throw new ApiError("No faculty record is linked to this account.", 404, "FACULTY_NOT_LINKED");
  }

  const result = await timetableService.getMyTimetableSlots(authMe.faculty.id, token);
  const markedKeys = await loadTodaysMarkedKeys(result.data, token);
  return { slots: result.data, markedKeys };
}

interface TimetableFetchResult {
  key: string;
  slots: TimetableSlot[] | null;
  markedKeys: Set<string>;
  error: string | null;
}

const INITIAL_TIMETABLE_FETCH_RESULT: TimetableFetchResult = { key: "", slots: null, markedKeys: new Set(), error: null };

export function useWeeklyTimetable() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<TimetableFetchResult>(INITIAL_TIMETABLE_FETCH_RESULT);
  const requestKey = `timetable:${refreshToken}`;

  // Ticks every 30s purely to re-render so isCurrentPeriod is recomputed against
  // the live clock, without refetching data. Only the setter is used deliberately.
  const [, forceRecompute] = useState(0);

  const status: SectionStatus =
    fetchResult.key !== requestKey
      ? "loading"
      : fetchResult.error
        ? "error"
        : fetchResult.slots && fetchResult.slots.length > 0
          ? "ready"
          : "empty";

  useEffect(() => {
    let cancelled = false;

    loadTimetableSlots()
      .then(({ slots, markedKeys }) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, slots, markedKeys, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult((prev) => ({ ...prev, key: requestKey, slots: null, error: toErrorMessage(err) }));
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  useEffect(() => {
    const intervalId = setInterval(() => forceRecompute((n) => n + 1), CURRENT_PERIOD_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, []);

  const timetable = fetchResult.slots ? buildWeeklyTimetable(fetchResult.slots, fetchResult.markedKeys) : null;

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  return { status, timetable, error: fetchResult.error, retry };
}

function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface AttendanceSummary {
  presentCount: number;
  absentCount: number;
  /** Always 0 — `attendance_status_enum` on this backend only has
   * present/absent, no "late" state exists to count. Shown for visual parity
   * with the reference design, not fabricated data. */
  lateCount: number;
  total: number;
}

type ToggleMap = Record<number, AttendanceMarkStatus | undefined>;

interface SessionData {
  isAlreadyMarked: boolean;
  markedRecords: AttendanceRecordResponse[];
  roster: RosterStudent[];
  /** True only when the roster fetch itself succeeded — distinct from an
   * empty class (roster fetched fine, just has zero students). */
  rosterAvailable: boolean;
}

const EMPTY_SESSION_DATA: SessionData = {
  isAlreadyMarked: false,
  markedRecords: [],
  roster: [],
  rosterAvailable: false,
};

interface AttendanceFetchResult extends SessionData {
  key: string;
  date: string;
  toggles: ToggleMap;
  error: string | null;
}

const INITIAL_ATTENDANCE_FETCH_RESULT: AttendanceFetchResult = {
  key: "",
  date: "",
  isAlreadyMarked: false,
  markedRecords: [],
  roster: [],
  rosterAvailable: false,
  toggles: {},
  error: null,
};

function mapRosterStudent(raw: ClassStudentRaw): RosterStudent {
  return {
    id: raw.id,
    studentIdNo: raw.student_id_no,
    rollNo: raw.roll_no,
    registerNo: raw.register_no,
    firstName: raw.first_name,
    lastName: raw.last_name,
  };
}

async function loadAttendanceForSlot(slot: TimetableCell, date: string, token: string): Promise<SessionData> {
  // GET /me/attendance-records can still 403 against the currently-deployed
  // backend (see the module-level comment at the top of this file) — this
  // degrades to "can't confirm marked status" rather than showing a
  // permanent, unfixable error + Retry on every single class selection.
  let isAlreadyMarked = false;
  let markedRecords: AttendanceRecordResponse[] = [];
  try {
    const attendance = await attendanceService.getAttendanceForClassDate(slot.classId, date, token);
    const recordsForSubject = attendance.data.filter((record) => record.subject?.id === slot.subjectId);
    isAlreadyMarked = recordsForSubject.length > 0;
    markedRecords = recordsForSubject;
  } catch {
    // Fall through — treated the same as "not yet marked" below.
  }

  if (isAlreadyMarked) {
    return { isAlreadyMarked: true, markedRecords, roster: [], rosterAvailable: false };
  }

  // The roster endpoint (GET /me/classes/:class_id/students) is new and,
  // like the two routes above, only exists on the locally-fixed backend, not
  // the deployed one yet — a failure here degrades to the "unavailable"
  // notice rather than a hard error, since it's an expected, temporary state.
  try {
    const rosterResponse = await attendanceService.getStudentsForClass(slot.classId, slot.subjectId, token, slot.academicYear);
    return {
      isAlreadyMarked: false,
      markedRecords: [],
      roster: rosterResponse.students.map(mapRosterStudent),
      rosterAvailable: true,
    };
  } catch {
    return { isAlreadyMarked: false, markedRecords: [], roster: [], rosterAvailable: false };
  }
}

/** Driven entirely by the timetable cell the faculty clicks (see
 * WeeklyTimetableCard/FacultyDashboard) rather than auto-detecting "the
 * current period" — attendance is always checked/marked against today's
 * actual date regardless of which day's chip was clicked, since that's the
 * only date this backend's attendance flow is meaningful for. */
export function useClassAttendance(selectedSlot: TimetableCell | null, onSubmitted?: () => void) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<AttendanceFetchResult>(INITIAL_ATTENDANCE_FETCH_RESULT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requestKey = `attendance:${selectedSlot?.slotId ?? "none"}:${refreshToken}`;

  const status: SectionStatus = fetchResult.key !== requestKey ? "loading" : fetchResult.error ? "error" : "ready";

  useEffect(() => {
    let cancelled = false;
    const date = todayIsoDate();
    const token = tokenStorage.getToken();

    const load = !selectedSlot
      ? Promise.resolve(EMPTY_SESSION_DATA)
      : !token
        ? Promise.reject(new ApiError("You are not signed in.", 401, "UNAUTHORIZED"))
        : loadAttendanceForSlot(selectedSlot, date, token);

    load
      .then((result) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, date, toggles: {}, error: null, ...result });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({
          key: requestKey,
          date,
          isAlreadyMarked: false,
          markedRecords: [],
          roster: [],
          rosterAvailable: false,
          toggles: {},
          error: toErrorMessage(err),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, selectedSlot]);

  function toggleStudent(studentId: number, next: AttendanceMarkStatus) {
    setFetchResult((prev) => ({ ...prev, toggles: { ...prev.toggles, [studentId]: next } }));
    setSubmitError(null);
  }

  const summary: AttendanceSummary = fetchResult.isAlreadyMarked
    ? {
        presentCount: fetchResult.markedRecords.filter((record) => record.status === "present").length,
        absentCount: fetchResult.markedRecords.filter((record) => record.status === "absent").length,
        lateCount: 0,
        total: fetchResult.markedRecords.length,
      }
    : {
        presentCount: fetchResult.roster.filter((student) => fetchResult.toggles[student.id] === "present").length,
        absentCount: fetchResult.roster.filter((student) => fetchResult.toggles[student.id] === "absent").length,
        lateCount: 0,
        total: fetchResult.roster.length,
      };

  const allStudentsToggled =
    fetchResult.roster.length > 0 && fetchResult.roster.every((student) => fetchResult.toggles[student.id] !== undefined);
  const canSubmit =
    fetchResult.rosterAvailable && !fetchResult.isAlreadyMarked && allStudentsToggled && !isSubmitting;

  async function submit() {
    if (!selectedSlot || !canSubmit) return;

    const token = tokenStorage.getToken();
    if (!token) {
      setSubmitError("You are not signed in.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await attendanceService.markClassAttendance(
        selectedSlot.classId,
        {
          subjectId: selectedSlot.subjectId,
          attendanceDate: fetchResult.date,
          records: fetchResult.roster.map((student) => ({
            studentId: student.id,
            status: fetchResult.toggles[student.id] as AttendanceMarkStatus,
          })),
        },
        token,
      );
      setIsSubmitting(false);
      setRefreshToken((token) => token + 1);
      onSubmitted?.();
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(toErrorMessage(err));
    }
  }

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  return {
    status,
    date: fetchResult.date,
    isAlreadyMarked: fetchResult.isAlreadyMarked,
    markedRecords: fetchResult.markedRecords,
    roster: fetchResult.roster,
    toggles: fetchResult.toggles,
    toggleStudent,
    rosterAvailable: fetchResult.rosterAvailable,
    summary,
    canSubmit,
    isSubmitting,
    submitError,
    submit,
    error: fetchResult.error,
    retry,
  };
}
