const base = ["placement"] as const;

export const placementKeys = {
  all: base,
  dashboard: () => [...base, "dashboard"] as const,
  companies: {
    all: () => [...base, "companies"] as const,
    list: (params: object = {}) => [...base, "companies", "list", params] as const,
    detail: (id: number) => [...base, "companies", "detail", id] as const,
  },
  drives: {
    all: () => [...base, "drives"] as const,
    list: (params: object = {}) => [...base, "drives", "list", params] as const,
    detail: (id: number) => [...base, "drives", "detail", id] as const,
  },
  applications: {
    list: (driveId: number) => [...base, "drives", driveId, "applications"] as const,
  },
  offers: () => [...base, "offers"] as const,
  students: () => [...base, "students"] as const,
  batches: () => [...base, "batches"] as const,
  reports: (batchId?: number) => [...base, "reports", batchId ?? "all"] as const,
  studentReport: (batchId?: number) => [...base, "student-report", batchId ?? "all"] as const,
  studentDriveHistory: (studentId: number) => [...base, "student-report", studentId, "history"] as const,
  notifications: () => [...base, "notifications"] as const,
};
