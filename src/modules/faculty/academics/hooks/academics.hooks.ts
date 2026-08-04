"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { tokenStorage } from "@/shared/lib/token-storage";
import { attendanceService, facultyProfileService } from "../../dashboard/services/dashboard.service";
import type { ClassStudentRaw, RosterStudent } from "../../dashboard/types/dashboard.types";
import {
  assignmentsService,
  examBoardService,
  examMarksService,
  lessonPlansService,
  lmsNotesService,
  studentAssignmentStatusService,
} from "../services/academics.service";
import type {
  AcademicsMappingOption,
  Assignment,
  CreateAssignmentPayload,
  CreateLmsNotePayload,
  EnterExamMarksEntry,
  ExamMarkRecord,
  FacultyExamBoardRow,
  LessonPlan,
  LmsNote,
  UpdateLmsNotePayload,
  UpsertLessonPlanPayload,
  ValidateExamMarksResult,
} from "../types/academics.types";

type ModuleStatus = "loading" | "error" | "empty" | "ready";

function toErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

function requireToken(): string {
  const token = tokenStorage.getToken();
  if (!token) throw new ApiError("You are not signed in.", 401, "UNAUTHORIZED");
  return token;
}

function toRosterStudent(raw: ClassStudentRaw): RosterStudent {
  return {
    id: raw.id,
    studentIdNo: raw.student_id_no,
    rollNo: raw.roll_no,
    registerNo: raw.register_no,
    firstName: raw.first_name,
    lastName: raw.last_name,
  };
}

// ───────────────────────────── Shared identity + mapping options ─────────────────────────────

interface IdentityFetchResult {
  key: string;
  facultyId: number | null;
  mappingOptions: AcademicsMappingOption[];
  error: string | null;
}

const INITIAL_IDENTITY: IdentityFetchResult = { key: "", facultyId: null, mappingOptions: [], error: null };

async function loadIdentity(): Promise<{ facultyId: number; mappingOptions: AcademicsMappingOption[] }> {
  const token = requireToken();

  const authMe = await facultyProfileService.getAuthMe(token);
  if (!authMe.faculty) {
    throw new ApiError("No faculty record is linked to this account.", 404, "FACULTY_NOT_LINKED");
  }
  const facultyId = authMe.faculty.id;

  const mapping = await facultyProfileService.getFacultyMapping(facultyId, token);
  const mappingOptions: AcademicsMappingOption[] = mapping.data.map((item) => ({
    id: item.id,
    academicYear: item.academic_year,
    classId: item.class.id,
    classSection: item.class.section,
    departmentCode: item.class.department.code,
    subjectId: item.subject.id,
    subjectName: item.subject.name,
    subjectCode: item.subject.subject_code,
  }));

  return { facultyId, mappingOptions };
}

/** Shared across every Academics tab: this faculty's own id (needed by the
 * two endpoints that aren't auto-scoped — LMS Notes and Lesson Plans) and
 * the list of (subject, class, academic_year) combinations they teach,
 * which drives every "which class/subject" dropdown in this module. */
export function useFacultyAcademicsIdentity() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<IdentityFetchResult>(INITIAL_IDENTITY);
  const requestKey = `identity:${refreshToken}`;

  const status: ModuleStatus =
    fetchResult.key !== requestKey
      ? "loading"
      : fetchResult.error
        ? "error"
        : fetchResult.mappingOptions.length === 0
          ? "empty"
          : "ready";

  useEffect(() => {
    let cancelled = false;

    loadIdentity()
      .then(({ facultyId, mappingOptions }) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, facultyId, mappingOptions, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, facultyId: null, mappingOptions: [], error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  return {
    status,
    facultyId: fetchResult.facultyId,
    mappingOptions: fetchResult.mappingOptions,
    error: fetchResult.error,
    retry,
  };
}

// ───────────────────────────── LMS Notes ─────────────────────────────

interface LmsNotesFetchResult {
  key: string;
  notes: LmsNote[];
  error: string | null;
}

const INITIAL_LMS_NOTES: LmsNotesFetchResult = { key: "", notes: [], error: null };

export function useLmsNotes(facultyId: number | null) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<LmsNotesFetchResult>(INITIAL_LMS_NOTES);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestKey = `lms-notes:${facultyId ?? "none"}:${refreshToken}`;

  const status: ModuleStatus =
    fetchResult.key !== requestKey
      ? "loading"
      : fetchResult.error
        ? "error"
        : fetchResult.notes.length === 0
          ? "empty"
          : "ready";

  useEffect(() => {
    if (facultyId === null) return;
    let cancelled = false;

    lmsNotesService
      .list(facultyId, requireToken())
      .then((result) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, notes: result.data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, notes: [], error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, facultyId]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  async function createNote(payload: CreateLmsNotePayload) {
    setActionError(null);
    try {
      await lmsNotesService.create(payload, requireToken());
      retry();
      return true;
    } catch (err) {
      setActionError(toErrorMessage(err));
      return false;
    }
  }

  async function updateNote(id: number, payload: UpdateLmsNotePayload) {
    setActionError(null);
    try {
      await lmsNotesService.update(id, payload, requireToken());
      retry();
      return true;
    } catch (err) {
      setActionError(toErrorMessage(err));
      return false;
    }
  }

  async function deleteNote(id: number) {
    setActionError(null);
    try {
      await lmsNotesService.remove(id, requireToken());
      retry();
      return true;
    } catch (err) {
      setActionError(toErrorMessage(err));
      return false;
    }
  }

  return { status, notes: fetchResult.notes, error: fetchResult.error, actionError, retry, createNote, updateNote, deleteNote };
}

// ───────────────────────────── Assignments ─────────────────────────────

interface AssignmentsFetchResult {
  key: string;
  assignments: Assignment[];
  error: string | null;
}

const INITIAL_ASSIGNMENTS: AssignmentsFetchResult = { key: "", assignments: [], error: null };

/** Auto-scoped server-side — doesn't need facultyId, just an authenticated
 * faculty token, so this hook (unlike LMS Notes/Lesson Plans) can fetch as
 * soon as it mounts. */
export function useAssignments() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<AssignmentsFetchResult>(INITIAL_ASSIGNMENTS);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestKey = `assignments:${refreshToken}`;

  const status: ModuleStatus =
    fetchResult.key !== requestKey
      ? "loading"
      : fetchResult.error
        ? "error"
        : fetchResult.assignments.length === 0
          ? "empty"
          : "ready";

  useEffect(() => {
    let cancelled = false;

    assignmentsService
      .list(requireToken())
      .then((result) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, assignments: result.data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, assignments: [], error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  async function createAssignment(payload: CreateAssignmentPayload) {
    setActionError(null);
    try {
      await assignmentsService.create(payload, requireToken());
      retry();
      return true;
    } catch (err) {
      setActionError(toErrorMessage(err));
      return false;
    }
  }

  async function updateTitle(id: number, title: string) {
    setActionError(null);
    try {
      await assignmentsService.updateTitle(id, title, requireToken());
      retry();
      return true;
    } catch (err) {
      setActionError(toErrorMessage(err));
      return false;
    }
  }

  async function deleteAssignment(id: number) {
    setActionError(null);
    try {
      await assignmentsService.remove(id, requireToken());
      retry();
      return true;
    } catch (err) {
      setActionError(toErrorMessage(err));
      return false;
    }
  }

  return {
    status,
    assignments: fetchResult.assignments,
    error: fetchResult.error,
    actionError,
    retry,
    createAssignment,
    updateTitle,
    deleteAssignment,
  };
}

interface SubmissionCount {
  total: number;
  submitted: number;
}

/** For the Assignments list view's "N / M Submissions" badge — computed by
 * joining two real endpoints (class roster + student_assignment_status),
 * since no single endpoint returns this directly. Roster fetches are
 * deduplicated by (class, subject, academic year) so assignments that share
 * a class/subject don't refetch the same roster. */
const EMPTY_SUBMISSION_COUNTS = new Map<number, SubmissionCount>();

export function useAssignmentSubmissionCounts(assignments: Assignment[]) {
  const [counts, setCounts] = useState<Map<number, SubmissionCount>>(EMPTY_SUBMISSION_COUNTS);
  const [refreshToken, setRefreshToken] = useState(0);
  const assignmentsKey = assignments.map((a) => a.id).join(",");

  useEffect(() => {
    if (assignments.length === 0) return;
    let cancelled = false;
    const token = tokenStorage.getToken();
    if (!token) return;

    const rosterKeyOf = (a: Assignment) => `${a.class.id}:${a.subject.id}:${a.academic_year}`;
    const uniqueRosterKeys = [...new Set(assignments.map(rosterKeyOf))];

    Promise.all(
      uniqueRosterKeys.map((key) => {
        const [classId, subjectId, academicYear] = key.split(":");
        return attendanceService
          .getStudentsForClass(Number(classId), Number(subjectId), token, academicYear)
          .then((res) => res.total)
          .catch(() => null);
      }),
    ).then((rosterTotals) => {
      if (cancelled) return;
      const totalByRosterKey = new Map(uniqueRosterKeys.map((key, index) => [key, rosterTotals[index]]));

      Promise.all(
        assignments.map((assignment) =>
          studentAssignmentStatusService
            .listForAssignment(assignment.id, token)
            .then((res) => res.data.filter((row) => row.is_submitted).length)
            .catch(() => null),
        ),
      ).then((submittedCounts) => {
        if (cancelled) return;
        const next = new Map<number, SubmissionCount>();
        assignments.forEach((assignment, index) => {
          const total = totalByRosterKey.get(rosterKeyOf(assignment));
          const submitted = submittedCounts[index];
          if (total !== null && total !== undefined && submitted !== null) {
            next.set(assignment.id, { total, submitted });
          }
        });
        setCounts(next);
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- assignmentsKey is the stable identity for assignments
  }, [assignmentsKey, refreshToken]);

  function refresh() {
    setRefreshToken((token) => token + 1);
  }

  return { counts: assignments.length === 0 ? EMPTY_SUBMISSION_COUNTS : counts, refresh };
}

export interface SubmissionRosterRow {
  student: RosterStudent;
  statusId: number | null;
  isSubmitted: boolean;
}

interface SubmissionsSessionData {
  rows: SubmissionRosterRow[];
  /** False when the roster fetch itself failed (e.g. the roster endpoint
   * isn't deployed yet) — distinct from a hard error, degrades to the same
   * "unavailable" notice used on the Attendance panel rather than a scary
   * permanent error + Retry. */
  rosterAvailable: boolean;
}

const EMPTY_SUBMISSIONS_SESSION: SubmissionsSessionData = { rows: [], rosterAvailable: false };

interface SubmissionsFetchResult extends SubmissionsSessionData {
  key: string;
  error: string | null;
}

const INITIAL_SUBMISSIONS: SubmissionsFetchResult = { key: "", ...EMPTY_SUBMISSIONS_SESSION, error: null };

async function loadSubmissionRows(assignment: Assignment): Promise<SubmissionsSessionData> {
  const token = requireToken();
  const statusResponse = await studentAssignmentStatusService.listForAssignment(assignment.id, token);

  let rosterResponse;
  try {
    rosterResponse = await attendanceService.getStudentsForClass(
      assignment.class.id,
      assignment.subject.id,
      token,
      assignment.academic_year,
    );
  } catch {
    return { rows: [], rosterAvailable: false };
  }

  const statusByStudentId = new Map(statusResponse.data.map((row) => [row.student.id, row]));

  const rows = rosterResponse.students.map((raw) => {
    const student = toRosterStudent(raw);
    const status = statusByStudentId.get(student.id);
    return { student, statusId: status?.id ?? null, isSubmitted: status?.is_submitted ?? false };
  });
  return { rows, rosterAvailable: true };
}

/** Backs the "View Submissions" panel for one assignment — each row is
 * either created (first mark) or updated (subsequent corrections) against
 * /student-assignment-status, since a status row only exists once a faculty
 * has marked that student at least once. */
export function useAssignmentSubmissions(assignment: Assignment | null) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<SubmissionsFetchResult>(INITIAL_SUBMISSIONS);
  const [pendingStudentId, setPendingStudentId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestKey = `submissions:${assignment?.id ?? "none"}:${refreshToken}`;

  const status: ModuleStatus = fetchResult.key !== requestKey ? "loading" : fetchResult.error ? "error" : "ready";

  useEffect(() => {
    let cancelled = false;
    const load = assignment ? loadSubmissionRows(assignment) : Promise.resolve(EMPTY_SUBMISSIONS_SESSION);

    load
      .then((result) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, error: null, ...result });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, ...EMPTY_SUBMISSIONS_SESSION, error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, assignment]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  async function toggleSubmitted(row: SubmissionRosterRow) {
    if (!assignment) return;
    setPendingStudentId(row.student.id);
    setActionError(null);
    try {
      const token = requireToken();
      const nextValue = !row.isSubmitted;
      if (row.statusId === null) {
        await studentAssignmentStatusService.create(assignment.id, row.student.id, nextValue, token);
      } else {
        await studentAssignmentStatusService.update(row.statusId, nextValue, token);
      }
      retry();
    } catch (err) {
      setActionError(toErrorMessage(err));
    } finally {
      setPendingStudentId(null);
    }
  }

  return {
    status,
    rows: fetchResult.rows,
    rosterAvailable: fetchResult.rosterAvailable,
    error: fetchResult.error,
    actionError,
    pendingStudentId,
    toggleSubmitted,
    retry,
  };
}

// ───────────────────────────── CA Marks (Exam Marks) ─────────────────────────────

interface ExamBoardFetchResult {
  key: string;
  rows: FacultyExamBoardRow[];
  error: string | null;
}

const INITIAL_EXAM_BOARD: ExamBoardFetchResult = { key: "", rows: [], error: null };

async function loadExamBoard(mappingOptions: AcademicsMappingOption[]): Promise<FacultyExamBoardRow[]> {
  const token = requireToken();
  const [exams, examTypes, mappings] = await Promise.all([
    examBoardService.listExams(token),
    examBoardService.listExamTypes(token),
    examBoardService.listExamSubjectMappings(token),
  ]);

  const examTypeNameById = new Map(examTypes.map((examType) => [examType.id, examType.name]));
  const examById = new Map(exams.map((exam) => [exam.id, exam]));
  const taughtPairs = new Set(mappingOptions.map((option) => `${option.subjectId}:${option.classId}`));
  const classInfoByPair = new Map(
    mappingOptions.map((option) => [`${option.subjectId}:${option.classId}`, option]),
  );

  return mappings
    .filter((mapping) => taughtPairs.has(`${mapping.subject_id}:${mapping.class_id}`))
    .map((mapping): FacultyExamBoardRow | null => {
      const exam = examById.get(mapping.exam_id);
      const classInfo = classInfoByPair.get(`${mapping.subject_id}:${mapping.class_id}`);
      if (!exam || !classInfo) return null;

      return {
        examSubjectMappingId: mapping.id,
        examId: exam.id,
        examTypeName: examTypeNameById.get(exam.exam_type_id) ?? "Exam",
        academicYear: exam.academic_year,
        semester: exam.semester,
        classId: mapping.class_id,
        classSection: classInfo.classSection,
        subjectId: mapping.subject_id,
        subjectName: classInfo.subjectName,
        subjectCode: classInfo.subjectCode,
        examStatus: exam.status,
      };
    })
    .filter((row): row is FacultyExamBoardRow => row !== null);
}

/** The exam-subject-mapping/exams/exam-types endpoints are public read
 * endpoints with no per-faculty filter, so this joins and filters them
 * client-side down to just this faculty's own subjects/classes — there is
 * no backend endpoint that returns this pre-joined. */
export function useExamBoard(mappingOptions: AcademicsMappingOption[], identityStatus: ModuleStatus) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<ExamBoardFetchResult>(INITIAL_EXAM_BOARD);
  const mappingsKey = mappingOptions.map((option) => `${option.subjectId}:${option.classId}`).join(",");
  const requestKey = `exam-board:${mappingsKey}:${refreshToken}`;

  // Callers only ever mount this once identityStatus is "ready" (see
  // AcademicsPage, which gates every tab behind identity readiness), so the
  // not-ready case never needs to resolve — it just reports "loading".
  const status: ModuleStatus =
    identityStatus !== "ready"
      ? "loading"
      : fetchResult.key !== requestKey
        ? "loading"
        : fetchResult.error
          ? "error"
          : fetchResult.rows.length === 0
            ? "empty"
            : "ready";

  useEffect(() => {
    if (identityStatus !== "ready") return;
    let cancelled = false;

    loadExamBoard(mappingOptions)
      .then((rows) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, rows, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, rows: [], error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mappingsKey is the stable identity for mappingOptions
  }, [requestKey, identityStatus]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  return { status, rows: fetchResult.rows, error: fetchResult.error, retry };
}

interface ExamMarksSessionData {
  validation: ValidateExamMarksResult | null;
  roster: RosterStudent[];
  existingRecords: ExamMarkRecord[];
  /** False when the entry-mode roster fetch itself failed (e.g. the roster
   * endpoint isn't deployed yet) — degrades to the same "unavailable"
   * notice used on the Attendance panel instead of a raw error. Always true
   * in correction mode, since that path never needs the roster endpoint. */
  rosterAvailable: boolean;
}

const EMPTY_EXAM_MARKS_SESSION: ExamMarksSessionData = {
  validation: null,
  roster: [],
  existingRecords: [],
  rosterAvailable: false,
};

interface ExamMarksFetchResult extends ExamMarksSessionData {
  key: string;
  error: string | null;
}

const INITIAL_EXAM_MARKS_FETCH: ExamMarksFetchResult = { key: "", ...EMPTY_EXAM_MARKS_SESSION, error: null };

async function loadExamMarksSession(row: FacultyExamBoardRow): Promise<ExamMarksSessionData> {
  const token = requireToken();
  const validation = await examMarksService.validate(row.examSubjectMappingId, token);

  if (validation.entered > 0) {
    const existing = await examMarksService.listForMapping(row.examSubjectMappingId, token);
    return { validation, roster: [], existingRecords: existing.data, rosterAvailable: true };
  }

  try {
    const rosterResponse = await attendanceService.getStudentsForClass(row.classId, row.subjectId, token, row.academicYear);
    return { validation, roster: rosterResponse.students.map(toRosterStudent), existingRecords: [], rosterAvailable: true };
  } catch {
    return { validation, roster: [], existingRecords: [], rosterAvailable: false };
  }
}

/** Driven by whichever board row the faculty selects — mirrors
 * useClassAttendance's select-then-load shape. Entry mode (fresh roster +
 * local marks inputs) and correction mode (existing records, per-row PATCH)
 * are mutually exclusive per the backend's one-shot bulk-entry rule: once
 * any exam_marks row exists for a mapping, a second bulk POST is rejected
 * with 409, so this hook never offers bulk entry once `entered > 0`. */
export function useExamMarksEntry(selectedRow: FacultyExamBoardRow | null) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<ExamMarksFetchResult>(INITIAL_EXAM_MARKS_FETCH);
  const [maxMarksInput, setMaxMarksInput] = useState("");
  const [marksInputs, setMarksInputs] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requestKey = `exam-marks:${selectedRow?.examSubjectMappingId ?? "none"}:${refreshToken}`;

  const status: ModuleStatus = fetchResult.key !== requestKey ? "loading" : fetchResult.error ? "error" : "ready";

  useEffect(() => {
    let cancelled = false;
    const load = selectedRow ? loadExamMarksSession(selectedRow) : Promise.resolve(EMPTY_EXAM_MARKS_SESSION);

    load
      .then((result) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, error: null, ...result });
        setMaxMarksInput("");
        setMarksInputs({});
        setSubmitError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, ...EMPTY_EXAM_MARKS_SESSION, error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, selectedRow]);

  function setMarkInput(studentId: number, value: string) {
    setMarksInputs((prev) => ({ ...prev, [studentId]: value }));
    setSubmitError(null);
  }

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  const maxMarks = Number(maxMarksInput);
  const hasValidMaxMarks = maxMarksInput.trim() !== "" && Number.isFinite(maxMarks) && maxMarks > 0;
  const allEntered =
    fetchResult.roster.length > 0 &&
    fetchResult.roster.every((student) => {
      const raw = marksInputs[student.id];
      if (raw === undefined || raw.trim() === "") return false;
      const value = Number(raw);
      return Number.isFinite(value) && value >= 0 && value <= maxMarks;
    });
  const canSubmitEntry = hasValidMaxMarks && allEntered && !isSubmitting;

  async function submitEntry() {
    if (!selectedRow || !canSubmitEntry) return;

    const entries: EnterExamMarksEntry[] = fetchResult.roster.map((student) => ({
      studentId: student.id,
      marksObtained: Number(marksInputs[student.id]),
    }));

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await examMarksService.enterMarks(selectedRow.examSubjectMappingId, { maxMarks, entries }, requireToken());
      setIsSubmitting(false);
      retry();
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(toErrorMessage(err));
    }
  }

  async function correctMark(recordId: number, newValue: number) {
    setSubmitError(null);
    try {
      await examMarksService.correctMark(recordId, newValue, requireToken());
      retry();
      return true;
    } catch (err) {
      setSubmitError(toErrorMessage(err));
      return false;
    }
  }

  return {
    status,
    validation: fetchResult.validation,
    roster: fetchResult.roster,
    rosterAvailable: fetchResult.rosterAvailable,
    existingRecords: fetchResult.existingRecords,
    maxMarksInput,
    setMaxMarksInput,
    marksInputs,
    setMarkInput,
    canSubmitEntry,
    isSubmitting,
    submitEntry,
    correctMark,
    submitError,
    error: fetchResult.error,
    retry,
  };
}

// ───────────────────────────── Lesson Plans ─────────────────────────────

interface LessonPlansFetchResult {
  key: string;
  plans: LessonPlan[];
  error: string | null;
}

const INITIAL_LESSON_PLANS: LessonPlansFetchResult = { key: "", plans: [], error: null };

export function useLessonPlans(facultyId: number | null) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [fetchResult, setFetchResult] = useState<LessonPlansFetchResult>(INITIAL_LESSON_PLANS);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestKey = `lesson-plans:${facultyId ?? "none"}:${refreshToken}`;

  const status: ModuleStatus =
    fetchResult.key !== requestKey
      ? "loading"
      : fetchResult.error
        ? "error"
        : fetchResult.plans.length === 0
          ? "empty"
          : "ready";

  useEffect(() => {
    if (facultyId === null) return;
    let cancelled = false;

    lessonPlansService
      .list(facultyId, requireToken())
      .then((result) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, plans: result.data, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchResult({ key: requestKey, plans: [], error: toErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, facultyId]);

  function retry() {
    setRefreshToken((token) => token + 1);
  }

  async function upsertPlan(payload: UpsertLessonPlanPayload) {
    setActionError(null);
    try {
      await lessonPlansService.upsert(payload, requireToken());
      retry();
      return true;
    } catch (err) {
      setActionError(toErrorMessage(err));
      return false;
    }
  }

  async function deletePlan(id: number) {
    setActionError(null);
    try {
      await lessonPlansService.remove(id, requireToken());
      retry();
      return true;
    } catch (err) {
      setActionError(toErrorMessage(err));
      return false;
    }
  }

  return { status, plans: fetchResult.plans, error: fetchResult.error, actionError, retry, upsertPlan, deletePlan };
}

/** Convenience: mapping options deduplicated to one entry per (subject,
 * class) pair (dropping the academic_year split) — Assignments' create form
 * still needs the full per-year list, but a few UI pickers just want "which
 * subject/class combos do I teach" without repeating a row per year. */
export function useDistinctSubjectClassOptions(mappingOptions: AcademicsMappingOption[]) {
  return useMemo(() => {
    const seen = new Set<string>();
    const result: AcademicsMappingOption[] = [];
    for (const option of mappingOptions) {
      const key = `${option.subjectId}:${option.classId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(option);
    }
    return result;
  }, [mappingOptions]);
}
