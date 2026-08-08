function resourceKeys(all: readonly unknown[]) {
  return {
    all: () => all,
    list: (params: object = {}) => [...all, "list", params] as const,
    detail: (id: number | string) => [...all, "detail", id] as const,
  };
}

const base = ["advisor"] as const;

export const advisorKeys = {
  all: base,
  dashboard: () => [...base, "dashboard"] as const,
  menteeClasses: resourceKeys([...base, "mentee-classes"]),
  classResult: (classId: number) => [...base, "class-result", classId] as const,
  classMarks: (classId: number, examTypeId?: number) =>
    [...base, "class-marks", classId, examTypeId ?? null] as const,
  studentProfile: (studentId: number) => [...base, "student-profile", studentId] as const,
  studentReport: (studentId: number) => [...base, "student-report", studentId] as const,
  studentPlacements: (studentId: number) => [...base, "student-placements", studentId] as const,
  attendance: (params: object = {}) => [...base, "attendance", params] as const,
  leaves: resourceKeys([...base, "leaves"]),
  ods: resourceKeys([...base, "ods"]),
  noDue: resourceKeys([...base, "no-due"]),
  announcements: resourceKeys([...base, "announcements"]),
  assignedClasses: () => [...base, "assigned-classes"] as const,
  profile: () => [...base, "profile"] as const,
};
