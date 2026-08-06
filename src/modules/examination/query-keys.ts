// Same resourceKeys() pattern as src/modules/library/query-keys.ts — see its
// comment for why params objects are passed straight into the key array.
function resourceKeys(all: readonly unknown[]) {
  return {
    all: () => all,
    list: (params: object = {}) => [...all, "list", params] as const,
    detail: (id: number | string) => [...all, "detail", id] as const,
  };
}

const base = ["examination"] as const;

export const examinationKeys = {
  all: base,
  examTypes: resourceKeys([...base, "exam-types"]),
  exams: resourceKeys([...base, "exams"]),
  timetableVersions: resourceKeys([...base, "timetable-versions"]),
  timetableSlots: resourceKeys([...base, "timetable-slots"]),
  subjectMappings: resourceKeys([...base, "subject-mappings"]),
  seatingVersions: resourceKeys([...base, "seating-versions"]),
  seatingArrangements: resourceKeys([...base, "seating-arrangements"]),
  venues: resourceKeys([...base, "venues"]),
  invigilationDuties: resourceKeys([...base, "invigilation-duties"]),
  invigilationBatches: resourceKeys([...base, "invigilation-batches"]),
  invigilationWorkload: (facultyId: number) =>
    [...base, "invigilation-workload", facultyId] as const,
  malpractice: resourceKeys([...base, "malpractice"]),
  marks: resourceKeys([...base, "marks"]),
  marksLocks: (examId: number, departmentId: number) =>
    [...base, "marks-locks", examId, departmentId] as const,
  results: resourceKeys([...base, "results"]),
  resultsSummary: (examId: number) => [...base, "results-summary", examId] as const,
  passRateByDepartment: (examId: number) =>
    [...base, "pass-rate-by-department", examId] as const,
  rankHolders: (examId: number) => [...base, "rank-holders", examId] as const,
  revaluationWindow: (examId: number) => [...base, "revaluation-window", examId] as const,
  revaluationRequests: resourceKeys([...base, "revaluation-requests"]),
  photocopyRequests: resourceKeys([...base, "photocopy-requests"]),
  reports: {
    preview: (key: string, examId: number) => [...base, "reports", key, examId] as const,
  },
  settings: {
    passRules: () => [...base, "settings", "pass-rules"] as const,
    gradeBands: () => [...base, "settings", "grade-bands"] as const,
  },
};
